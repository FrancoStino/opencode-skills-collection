import type { Plugin } from "@opencode-ai/plugin";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const LOG_FILE = path.join(os.homedir(), ".config", "opencode", "antigravity-debug.log");

function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try { fs.appendFileSync(LOG_FILE, line); } catch (_) {}
  process.stderr.write(line);
}

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
  const fromFile = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "bundled-skills");
  if (fs.existsSync(fromFile)) return fromFile;

  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, "bundled-skills");
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  throw new Error(`bundled-skills not found. import.meta.url=${import.meta.url}`);
}

const OpenCodeSkillsCollection: Plugin = async (_ctx) => {
  log("plugin start");
  try {
    const bundledSkillsPath = resolveBundledSkillsPath();
    const skillsPath = path.join(os.homedir(), ".config", "opencode", "skills");

    log(`bundled-skills path: ${bundledSkillsPath}`);
    log(`skills dest: ${skillsPath}`);

    fs.mkdirSync(skillsPath, { recursive: true });

    const entries = fs.readdirSync(bundledSkillsPath, { withFileTypes: true });
    log(`entries in bundled-skills: ${entries.length}`);

    let installed = 0;
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;
      const src = path.join(bundledSkillsPath, entry.name);
      if (!fs.existsSync(path.join(src, "SKILL.md"))) continue;
      copyDirContents(src, path.join(skillsPath, entry.name));
      installed++;
    }

    log(`done — installed ${installed} skills`);
  } catch (error: unknown) {
    log(`ERROR: ${String(error)}`);
  }

  return {};
};

export default OpenCodeSkillsCollection;
