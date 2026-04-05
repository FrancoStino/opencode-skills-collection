import type { Plugin } from "@opencode-ai/plugin";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

function copyDirContents(srcDir: string, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcEntry = path.join(srcDir, entry.name);
    const destEntry = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirContents(srcEntry, destEntry);
    } else {
      fs.copyFileSync(srcEntry, destEntry);
    }
  }
}

function resolveBundledSkillsPath(): string {
  // Try resolving relative to this file (works when dist/ is next to bundled-skills/)
  const fromFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bundled-skills");
  if (fs.existsSync(fromFile)) return fromFile;

  // Try resolving relative to the package root via package.json lookup
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "bundled-skills");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error(`bundled-skills not found. Searched from: ${path.dirname(fileURLToPath(import.meta.url))}`);
}

const OpenCodeSkillsCollection: Plugin = async (_ctx) => {
  try {
    const bundledSkillsPath = resolveBundledSkillsPath();
    const skillsPath = path.join(os.homedir(), ".config", "opencode", "skills");

    process.stderr.write(`[antigravity] bundled-skills: ${bundledSkillsPath}\n`);
    process.stderr.write(`[antigravity] skills dest:    ${skillsPath}\n`);

    fs.mkdirSync(skillsPath, { recursive: true });

    const entries = fs.readdirSync(bundledSkillsPath, { withFileTypes: true });
    let installed = 0;

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;

      const src = path.join(bundledSkillsPath, entry.name);
      if (!fs.existsSync(path.join(src, "SKILL.md"))) continue;

      const dest = path.join(skillsPath, entry.name);
      copyDirContents(src, dest);
      installed++;
    }

    process.stderr.write(`[antigravity] installed ${installed} skills\n`);
  } catch (error: unknown) {
    process.stderr.write(`[antigravity] ERROR: ${String(error)}\n`);
  }

  return {};
};

export default OpenCodeSkillsCollection;
