import type { Plugin } from "@opencode-ai/plugin";
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
 * OpenCode Skills Collection plugin.
 *
 * On every OpenCode startup:
 * 1. Copies bundled skills directly into the vault (~/.config/opencode/skill-libraries/)
 *    organised by category — the active skills directory is never used as staging.
 * 2. Generates lightweight category pointer SKILL.md files in
 *    ~/.config/opencode/skills/ without touching any user custom skills.
 */
const OpenCodeSkillsCollection: Plugin = async (_ctx) => {
  try {
    const bundledSkillsPath = resolveBundledSkillsPath();
    const activeSkillsDir = resolveActiveSkillsDir();

    ensureDir(activeSkillsDir);

    runSkillPointer({ bundledSkillsPath, activeSkillsDir });
  } catch {
    // Plugin errors must never crash OpenCode.
    // A silent failure is preferable to a broken startup.
  }

  return {};
};

export default OpenCodeSkillsCollection;
