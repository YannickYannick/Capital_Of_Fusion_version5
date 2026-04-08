/**
 * Extrait les ZIP Adobe Stock (OBJ + MTL + textures) et produit des GLB
 * dans public/models/adobe-planets/ pour Explore (visual_source: glb).
 *
 * Usage (depuis frontend/) :
 *   npm run adobe-planets:build -- "C:\chemin\vers\dossier\des\zip"
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function findObjFiles(dir) {
  const results = [];
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) results.push(...findObjFiles(p));
    else if (name.toLowerCase().endsWith(".obj")) results.push(p);
  }
  return results;
}

function expandArchive(zipPath, destDir) {
  const psZip = zipPath.replace(/'/g, "''");
  const psDest = destDir.replace(/'/g, "''");
  const r = spawnSync(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${psZip}' -DestinationPath '${psDest}' -Force`,
    ],
    { stdio: "inherit" }
  );
  if (r.status !== 0) {
    throw new Error(`Échec Expand-Archive pour ${zipPath}`);
  }
}

function main() {
  const sourceDir = process.argv[2];
  if (!sourceDir) {
    console.error(
      "Usage: node scripts/adobe-planets-zip-to-glb.mjs <dossier_des_zip>"
    );
    process.exit(1);
  }

  const absSource = path.resolve(sourceDir);
  if (!fs.existsSync(absSource)) {
    console.error("Dossier introuvable:", absSource);
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), "public", "models", "adobe-planets");
  const tmpRoot = path.join(outDir, ".tmp-extract");
  fs.mkdirSync(outDir, { recursive: true });

  const zips = fs
    .readdirSync(absSource)
    .filter((f) => f.toLowerCase().endsWith(".zip"));

  if (zips.length === 0) {
    console.error("Aucun .zip dans:", absSource);
    process.exit(1);
  }

  console.log(`${zips.length} archive(s) → ${outDir}\n`);

  for (const zip of zips) {
    const zipPath = path.join(absSource, zip);
    const zipStem = path.basename(zip, path.extname(zip));
    const extractDir = path.join(tmpRoot, zipStem);
    fs.rmSync(extractDir, { recursive: true, force: true });
    fs.mkdirSync(extractDir, { recursive: true });

    console.log(`[extraire] ${zip}`);
    expandArchive(zipPath, extractDir);

    const objs = findObjFiles(extractDir);
    if (objs.length === 0) {
      console.warn(`  Aucun .obj dans ${zip}, ignoré.`);
      continue;
    }

    for (const objFull of objs) {
      const objDir = path.dirname(objFull);
      const objFile = path.basename(objFull);
      const objStem = path.basename(objFile, ".obj");
      const glbName = `${zipStem}_${objStem}.glb`;
      const glbFull = path.resolve(outDir, glbName);
      const obj2gltfCli = path.join(
        process.cwd(),
        "node_modules",
        "obj2gltf",
        "bin",
        "obj2gltf.js"
      );

      console.log(`  [obj2gltf] ${objFile} → ${glbName}`);
      const conv = spawnSync(
        process.execPath,
        [obj2gltfCli, "-i", objFile, "-o", glbFull],
        { cwd: objDir, stdio: "inherit" }
      );
      if (conv.status !== 0) {
        console.error(`  Échec conversion pour ${objFull}`);
        process.exit(conv.status ?? 1);
      }
    }
  }

  fs.rmSync(tmpRoot, { recursive: true, force: true });
  console.log("\nTerminé. Définissez sur un nœud : visual_source=glb, model_3d=/models/adobe-planets/<fichier>.glb");
}

main();
