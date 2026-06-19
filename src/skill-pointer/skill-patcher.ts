import * as fs from "node:fs";
import * as path from "node:path";
import type { SkillPatch } from "./config-loader.js";
import type { SkillIndexEntry } from "./vault-installer.js";
import { SKILL_FILENAME } from "../constants/constants.js";

/**
 * Checks whether a path component is safe (no traversal sequences).
 */
function isSafePath(component: string): boolean {
  return !component.includes("..") && !component.includes("/") && !component.includes(path.sep);
}

/**
 * Resolves the SKILL.md file path for a given index entry within the vault.
 * Returns `undefined` if the path is unsafe or the file does not exist.
 */
function resolveSkillFile(vaultDir: string, entry: SkillIndexEntry): string | undefined {
  if (!isSafePath(entry.id) || !isSafePath(entry.category)) return undefined;

  const skillFile = path.join(vaultDir, entry.category, entry.id, SKILL_FILENAME);
  if (!fs.existsSync(skillFile)) return undefined;

  const resolvedVault = fs.realpathSync(vaultDir);
  const realSkillFile = fs.realpathSync(skillFile);

  if (!realSkillFile.startsWith(resolvedVault + path.sep)) return undefined;

  return skillFile;
}

/**
 * Applies a single patch to content, returning the modified content.
 * Returns `undefined` if the patch could not be applied (invalid regex, empty find, no match).
 */
function applySinglePatch(content: string, patch: SkillPatch): string | undefined {
  if (!patch.find) return undefined;

  try {
    const re = new RegExp(patch.find, "gis");
    // Use function replacement to treat patch.replace as a literal string
    // (avoids $& $1 $` $' being interpreted as special replacement patterns)
    const replacement = patch.replace;
    const newContent = content.replace(re, () => replacement);
    return newContent === content ? undefined : newContent;
  } catch {
    return undefined;
  }
}

/**
 * Groups patches by skillId, preserving order within each group.
 */
function groupPatchesBySkill(patches: SkillPatch[]): Map<string, SkillPatch[]> {
  const grouped = new Map<string, SkillPatch[]>();
  for (const patch of patches) {
    const group = grouped.get(patch.skillId);
    if (group) {
      group.push(patch);
    } else {
      grouped.set(patch.skillId, [patch]);
    }
  }
  return grouped;
}

/**
 * Applies regex-based content patches to installed skill files in the vault.
 *
 * Each patch targets a `skillId`, performing a case-insensitive global regex
 * replacement on the skill's SKILL.md content. Multiple patches for the same
 * skill are applied in order. Invalid regex patterns are silently skipped.
 *
 * This function is idempotent — re-running with the same patches on already-patched
 * content produces no further changes (the regex simply won't match).
 */
export function applySkillPatches(
  vaultDir: string,
  index: SkillIndexEntry[],
  patches: SkillPatch[]
): void {
  if (patches.length === 0) return;

  const entryById = new Map<string, SkillIndexEntry>();
  for (const entry of index) {
    entryById.set(entry.id, entry);
  }

  const patchesBySkill = groupPatchesBySkill(patches);

  for (const [skillId, skillPatches] of patchesBySkill) {
    const entry = entryById.get(skillId);
    if (!entry) continue;

    const skillFile = resolveSkillFile(vaultDir, entry);
    if (!skillFile) continue;

    let content = fs.readFileSync(skillFile, "utf-8");
    let modified = false;

    for (const patch of skillPatches) {
      const result = applySinglePatch(content, patch);
      if (result !== undefined) {
        content = result;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(skillFile, content, "utf-8");
    }
  }
}
