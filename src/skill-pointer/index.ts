import os from "os";
import path from "path";
import { VAULT_DIR_NAME } from "../constants/heuristics.js";
import { ensureDir } from "../utils/fs.utils.js";
import { generatePointers } from "./pointer-generator.js";
import { migrateSkillsToVault } from "./vault-manager.js";

export interface SkillPointerOptions {
  /** Absolute path where OpenCode looks for active skills. */
  activeSkillsDir: string;
  /**
   * Absolute path of the hidden vault where raw skills are stored.
   * Defaults to ~/.opencode-skill-libraries
   */
  vaultDir?: string;
}

/**
 * Orchestrates the full SkillPointer pipeline:
 * 1. Moves all raw skill folders from activeSkillsDir into the hidden vault.
 * 2. Generates lightweight category pointer SKILL.md files in activeSkillsDir.
 *
 * After this runs, activeSkillsDir contains only ~35 pointer folders
 * instead of 800+, reducing startup context from ~80k tokens to ~255.
 */
export function runSkillPointer(options: SkillPointerOptions): void {
  const vaultDir =
    options.vaultDir ?? path.join(os.homedir(), VAULT_DIR_NAME);

  ensureDir(options.activeSkillsDir);
  ensureDir(vaultDir);

  migrateSkillsToVault(options.activeSkillsDir, vaultDir);
  generatePointers(options.activeSkillsDir, vaultDir);
}
