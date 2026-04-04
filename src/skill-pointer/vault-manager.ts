import fs from "fs";
import path from "path";
import { ensureDir, moveDir } from "../utils/fs.utils.js";
import { getCategoryForSkill, isPointerFolder, shouldSkipEntry } from "./categorizer.js";

/**
 * Result of a vault migration pass.
 */
export interface MigrationResult {
  /** Total number of skill folders moved to the vault. */
  movedCount: number;
  /** Map of category slug → list of skill folder names moved into it. */
  categoryMap: Record<string, string[]>;
}

/**
 * Iterates over all skill folders in the active skills directory,
 * categorises each one, and moves it into the hidden vault.
 *
 * Folders that are already pointers or should be skipped are left in place.
 */
export function migrateSkillsToVault(
  activeSkillsDir: string,
  vaultDir: string
): MigrationResult {
  const categoryMap: Record<string, string[]> = {};
  let movedCount = 0;

  for (const entry of fs.readdirSync(activeSkillsDir)) {
    const fullPath = path.join(activeSkillsDir, entry);

    if (!fs.statSync(fullPath).isDirectory()) continue;
    if (shouldSkipEntry(entry)) continue;
    if (isPointerFolder(entry)) continue;

    const category = getCategoryForSkill(entry);
    const categoryVaultDir = path.join(vaultDir, category);

    ensureDir(categoryVaultDir);
    moveDir(fullPath, path.join(categoryVaultDir, entry));

    categoryMap[category] ??= [];
    categoryMap[category].push(entry);
    movedCount++;
  }

  return { movedCount, categoryMap };
}
