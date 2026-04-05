#!/usr/bin/env node
/**
 * scripts/sync-index.mjs
 *
 * Downloads the latest skills_index.json from the upstream Antigravity repo
 * and places it inside bundled-skills/ so the plugin can use it at runtime
 * without making network requests.
 *
 * Run automatically as part of "sync-skills" in package.json:
 *   node scripts/sync-index.mjs
 */
import { createWriteStream, mkdirSync } from "fs";
import { pipeline } from "stream/promises";
import path from "path";
import { fileURLToPath } from "url";

const UPSTREAM_URL =
  "https://raw.githubusercontent.com/sickn33/antigravity-awesome-skills/main/skills_index.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, "..", "bundled-skills", "skills_index.json");

mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

console.log(`⬇️  Downloading skills_index.json from upstream...`);

const response = await fetch(UPSTREAM_URL);
if (!response.ok) {
  console.error(`❌ Failed to download: ${response.status} ${response.statusText}`);
  process.exit(1);
}

await pipeline(response.body, createWriteStream(OUTPUT_PATH));
console.log(`✅ skills_index.json saved to bundled-skills/skills_index.json`);
