import type { Plugin } from "@opencode-ai/plugin";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { ensureDir } from "./utils/fs.utils.js";
import { runSkillPointer } from "./skill-pointer/index.js";

const ACTIVE_SKILLS_PATH_SEGMENTS = [".config", "opencode", "skills"] as const;

/**
 * Resolves the absolute path to the bundled-skills directory
 * shipped inside this npm package.
 */
function resolveBundledSkillsPath(): string {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, "..", "bundled-skills");
}

/**
 * Resolves the OpenCode active skills directory (~/.config/opencode/skills).
 */
function resolveActiveSkillsDir(): string {
  return path.join(os.homedir(), ...ACTIVE_SKILLS_PATH_SEGMENTS);
}

/**
 * Copies the bundled skills snapshot into the active skills directory.
 * Uses force: true so updates to the npm package are always applied.
 */
function installBundledSkills(
  bundledSkillsPath: string,
  activeSkillsDir: string
): void {
  ensureDir(activeSkillsDir);
  fs.cpSync(bundledSkillsPath, activeSkillsDir, {
    recursive: true,
    force: true,
  });
}

/**
 * OpenCode Skills Collection plugin.
 *
 * On every OpenCode startup:
 * 1. Copies the pre-bundled skills snapshot to the active skills directory.
 * 2. Runs the SkillPointer pipeline to reorganise skills into category
 *    pointers, reducing startup context from ~80k tokens to ~255 tokens.
 */
const OpenCodeSkillsCollection: Plugin = async (_ctx) => {
  try {
    const bundledSkillsPath = resolveBundledSkillsPath();
    const activeSkillsDir = resolveActiveSkillsDir();

    installBundledSkills(bundledSkillsPath, activeSkillsDir);
    runSkillPointer({ activeSkillsDir });
  } catch {
    // Plugin errors must never crash OpenCode.
    // A silent failure is preferable to a broken startup.
  }

  return {};
};

export default OpenCodeSkillsCollection;
