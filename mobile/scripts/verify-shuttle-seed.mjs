#!/usr/bin/env node
/**
 * Vérifie le seed navettes — compte les départs par jour/sens.
 * Usage: node scripts/verify-shuttle-seed.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const seed = JSON.parse(readFileSync(join(root, 'src/data/shuttles.seed.json'), 'utf8'));

let total = 0;
for (const day of seed.days) {
  const h = day.toHotel.length;
  const p = day.toPalmeraie.length;
  total += h + p;
  console.log(`${day.label} (${day.date}): Palmeraie→Hôtel ${h}, Hôtel→Palmeraie ${p}`);
}
console.log(`Total départs: ${total}`);
