/**
 * Produit des GLB légers (< ~10 Mo, souvent ~0,5–3 Mo) pour upload (ex. limite 10 Mo).
 * Entrée : public/models/adobe-planets/*.glb (hors sous-dossier lite/)
 * Sortie : public/models/adobe-planets/lite/<même nom>.glb
 *
 * Usage (depuis frontend/) :
 *   npm run adobe-planets:lite
 *
 * Options (optionnel) :
 *   node scripts/adobe-planets-glb-lite.mjs [dossier_source] [max_côté_texture_px]
 *
 * Exemple :
 *   node scripts/adobe-planets-glb-lite.mjs public/models/adobe-planets 512
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const TEXTURE_SIZE_DEFAULT = 1024;
const TARGET_MAX_BYTES = 5 * 1024 * 1024; // ~5 Mo — si dépassé, repasse avec textures plus petites

function gltfTransformCli() {
  return path.join(
    process.cwd(),
    "node_modules",
    "@gltf-transform",
    "cli",
    "bin",
    "cli.js"
  );
}

function optimize(src, dest, textureSize) {
  const cli = gltfTransformCli();
  const r = spawnSync(
    process.execPath,
    [
      cli,
      "optimize",
      src,
      dest,
      "--compress",
      "quantize",
      "--texture-size",
      String(textureSize),
      "--texture-compress",
      "webp",
    ],
    { stdio: "inherit" }
  );
  return r.status === 0;
}

function main() {
  const baseDir =
    process.argv[2] ||
    path.join(process.cwd(), "public", "models", "adobe-planets");
  let textureSize = parseInt(process.argv[3], 10);
  if (!Number.isFinite(textureSize) || textureSize < 256) {
    textureSize = TEXTURE_SIZE_DEFAULT;
  }

  if (!fs.existsSync(baseDir)) {
    console.error("Dossier introuvable:", baseDir);
    process.exit(1);
  }

  const liteDir = path.join(baseDir, "lite");
  fs.mkdirSync(liteDir, { recursive: true });

  const glbs = fs
    .readdirSync(baseDir)
    .filter(
      (f) =>
        f.toLowerCase().endsWith(".glb") &&
        fs.statSync(path.join(baseDir, f)).isFile()
    );

  if (glbs.length === 0) {
    console.error(
      "Aucun .glb à la racine de",
      baseDir,
      "(lancez d’abord npm run adobe-planets:build …)"
    );
    process.exit(1);
  }

  const cliPath = gltfTransformCli();
  if (!fs.existsSync(cliPath)) {
    console.error("Installez les deps : npm install (dont @gltf-transform/cli)");
    process.exit(1);
  }

  console.log(`${glbs.length} fichier(s) → ${liteDir}\n`);

  for (const name of glbs) {
    const src = path.join(baseDir, name);
    const dest = path.join(liteDir, name);
    let size = textureSize;

    console.log(`[lite] ${name} (textures max ${size}px)`);
    if (!optimize(src, dest, size)) {
      process.exit(1);
    }

    let bytes = fs.statSync(dest).size;
    // Si encore trop gros pour une cible ~5 Mo / marge upload 10 Mo, recompresser plus fort
    while (bytes > TARGET_MAX_BYTES && size > 128) {
      size = Math.max(128, Math.floor(size / 2));
      console.log(`  → ${(bytes / 1024 / 1024).toFixed(2)} Mo, nouvelle passe ${size}px`);
      if (!optimize(src, dest, size)) {
        process.exit(1);
      }
      bytes = fs.statSync(dest).size;
    }

    console.log(
      `  ✓ ${(bytes / 1024 / 1024).toFixed(2)} Mo → lite/${name}\n`
    );
  }

  console.log(
    "Upload admin : fichiers dans models/adobe-planets/lite/ (URL type /models/adobe-planets/lite/…)"
  );
}

main();
