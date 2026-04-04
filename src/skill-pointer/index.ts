import os from "os";
import path from "path";
import { VAULT_DIR_NAME } from "../constants/heuristics.js";
import { ensureDir } from "../utils/fs.utils.js";
import { generatePointers } from "./pointer-generator.js";
import { installSkillsToVault } from "./vault-installer.js";

export interface SkillPointerOptions {
  /** Absolute path where OpenCode looks for active skills. */
  activeSkillsDir: string;
  /** Absolute path to the bundled-skills snapshot inside the npm package. */
  bundledSkillsPath: string;
  /**
   * Absolute path of the hidden vault where raw skills are stored.
   * Defaults to ~/.config/opencode/skill-libraries
   *
   * Co-located with the rest of OpenCode config to keep all
   * OpenCode-related data under one XDG-style directory.
   */
  vaultDir?: string;
}

/**
 * Resolves the default vault path: ~/.config/opencode/skill-libraries
 */
function resolveDefaultVaultDir(): string {
  return path.join(os.homedir(), ".config", "opencode", VAULT_DIR_NAME);
}

/**
 * Orchestrates the full SkillPointer pipeline:
 * 1. Copies bundled skills directly into the vault, categorised by folder name.
 * 2. Generates lightweight category pointer SKILL.md files in activeSkillsDir.
 *
 * The activeSkillsDir is never used as a staging area — user custom skills
 * already present there are never moved or overwritten.
 *
 * After this runs, activeSkillsDir contains only pointer folders,
 * reducing startup context from ~80k tokens to ~255.
 */
export function runSkillPointer(options: SkillPointerOptions): void {
  const vaultDir = options.vaultDir ?? resolveDefaultVaultDir();

  ensureDir(options.activeSkillsDir);
  ensureDir(vaultDir);

  installSkillsToVault(options.bundledSkillsPath, vaultDir);
  generatePointers(options.activeSkillsDir, vaultDir);
}
