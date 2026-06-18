import * as os from "node:os";
import * as path from "node:path";
import { VAULT_DIR_NAME } from "../constants/constants.js";
import { ensureDir } from "../utils/fs.utils.js";
import { generatePointers } from "./pointer-generator.js";
import { installSkillsToVault, loadSkillsIndex } from "./vault-installer.js";
import { filterIndex } from "./skill-risk-filter.js";
import { loadFilterConfig, DEFAULT_FILTER_CONFIG_PATH } from "./config-loader.js";
import { applySkillPatches } from "./skill-patcher.js";

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
  /**
   * Optional path to the risk filter configuration file.
   */
  configPath?: string;
}

function resolveDefaultVaultDir(): string {
  return path.join(os.homedir(), ".config", "opencode", VAULT_DIR_NAME);
}

/**
 * Orchestrates the full SkillPointer pipeline:
 *
 * 1. Reads skills_index.json bundled alongside the skills snapshot.
 * 2. Filters by risk level / excluded skills.
 * 3. Copies skills into the vault, categorised by the index.
 * 4. Applies config-driven content patches to installed skills.
 * 5. Generates pointer SKILL.md files in activeSkillsDir with full skill
 *    listings so keyword searches (e.g. "laravel") resolve out of the box.
 *
 * Content safety scanning is performed at CI time (sync-skills.yml),
 * not at runtime — dangerous skills are removed before npm publish.
 *
 * The activeSkillsDir is never used as a staging area — user custom
 * skills already present there are never moved or overwritten.
 */
export function runSkillPointer(options: SkillPointerOptions): void {
  const vaultDir = options.vaultDir ?? resolveDefaultVaultDir();

  ensureDir(options.activeSkillsDir);
  ensureDir(vaultDir);

  const index = loadSkillsIndex(options.bundledSkillsPath);
  const configPath = options.configPath ?? DEFAULT_FILTER_CONFIG_PATH;
  const config = loadFilterConfig(configPath);
  const filteredIndex = filterIndex(index, config);

  installSkillsToVault(options.bundledSkillsPath, vaultDir, filteredIndex);

  // Apply content patches
  if (config.skillPatches && config.skillPatches.length > 0) {
    applySkillPatches(vaultDir, filteredIndex, config.skillPatches);
  }

  generatePointers(options.activeSkillsDir, vaultDir, filteredIndex);
}
