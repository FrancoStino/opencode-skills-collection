import os from "os";
import path from "path";
import { VAULT_DIR_NAME } from "../constants/heuristics.js";
import { ensureDir } from "../utils/fs.utils.js";
import { generatePointers } from "./pointer-generator.js";
import { installSkillsToVault, loadSkillsIndex } from "./vault-installer.js";

export interface SkillPointerOptions {
  /** Absolute path where OpenCode looks for active skills. */
  activeSkillsDir: string;
  /** Absolute path to the bundled-skills snapshot inside the npm package. */
  bundledSkillsPath: string;
  /**
   * Absolute path of the hidden vault where raw skills are stored.
   * Defaults to ~/.config/opencode/skill-libraries
   */
  vaultDir?: string;
}

function resolveDefaultVaultDir(): string {
  return path.join(os.homedir(), ".config", "opencode", VAULT_DIR_NAME);
}

/**
 * Orchestrates the full SkillPointer pipeline:
 *
 * 1. Reads skills_index.json (bundled from upstream Antigravity)
 * 2. Copies bundled skills directly into the vault, categorised by the index.
 * 3. Generates pointer SKILL.md files in activeSkillsDir with full skill
 *    listings so keyword searches (e.g. "laravel") work out of the box.
 *
 * The activeSkillsDir is never used as a staging area — user custom
 * skills already present there are never moved or overwritten.
 */
export function runSkillPointer(options: SkillPointerOptions): void {
  const vaultDir = options.vaultDir ?? resolveDefaultVaultDir();

  ensureDir(options.activeSkillsDir);
  ensureDir(vaultDir);

  const index = loadSkillsIndex(options.bundledSkillsPath);
  installSkillsToVault(options.bundledSkillsPath, vaultDir, index);
  generatePointers(options.activeSkillsDir, vaultDir, index);
}
