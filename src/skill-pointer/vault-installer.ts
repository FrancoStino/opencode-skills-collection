import fs from "fs";
import path from "path";
import { SKILL_FILENAME } from "../constants/heuristics.js";
import { ensureDir } from "../utils/fs.utils.js";
import { getCategoryForSkill, shouldSkipEntry } from "./categorizer.js";

/**
 * Copies every skill folder from bundledSkillsPath directly into
 * the vault under the appropriate category sub-directory.
 *
 * Skills are never staged in the active skills directory, so user
 * custom skills already present in skills/ are never touched.
 *
 * @param bundledSkillsPath - Absolute path to the bundled-skills snapshot.
 * @param vaultDir          - Absolute path to the skill-libraries vault.
 */
export function installSkillsToVault(
  bundledSkillsPath: string,
  vaultDir: string
): void {
  if (!fs.existsSync(bundledSkillsPath)) return;

  for (const entry of fs.readdirSync(bundledSkillsPath)) {
    if (shouldSkipEntry(entry)) continue;

    const srcPath = path.join(bundledSkillsPath, entry);
    if (!fs.statSync(srcPath).isDirectory()) continue;

    const category = getCategoryForSkill(entry);
    const destPath = path.join(vaultDir, category, entry);

    ensureDir(path.join(vaultDir, category));
    fs.cpSync(srcPath, destPath, { recursive: true, force: true });
  }
}
