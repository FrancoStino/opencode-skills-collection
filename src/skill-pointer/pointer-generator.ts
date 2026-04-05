import fs from "fs";
import path from "path";
import { POINTER_SUFFIX, SKILL_FILENAME } from "../constants/heuristics.js";
import { ensureDir, listSubdirectories } from "../utils/fs.utils.js";
import type { SkillIndexEntry } from "./vault-installer.js";

/**
 * Builds the SKILL.md content for a category pointer.
 *
 * The pointer includes:
 * - Instructions for the AI to browse the vault on demand.
 * - A full list of skill names + descriptions so that keyword-based
 *   tools like get_available_skills can match queries like
 *   "laravel", "wordpress", "react", etc. without loading every SKILL.md.
 */
function buildPointerContent(
  category: string,
  skills: SkillIndexEntry[],
  libraryPath: string
): string {
  const title = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizedPath = libraryPath.replace(/\\/g, "/");
  const skillCount = skills.length;

  const skillList = skills
    .map((s) => `- **${s.id}** — ${s.description || s.name}`)
    .join("\n");

  return `---
name: ${category}${POINTER_SUFFIX}
description: "Pointer to a library of ${skillCount} specialized ${title} skills. Use when working on ${category}-related tasks."
risk: safe
---

# ${title} Capability Library 🎯

This is a **pointer skill**. The ${skillCount} specialized ${title} skills are stored in a hidden vault to keep your startup context minimal.

## Available skills in this category

${skillList}

## How to load a skill

1. Identify the skill name above matching your task.
2. Use \`view_file\` to read its \`SKILL.md\` from the vault:
   \`${normalizedPath}/<skill-name>/SKILL.md\`
3. Follow those instructions to complete the request.

**Vault path:** \`${normalizedPath}\`

> Do not guess best practices — always read from the vault first.
`;
}

/**
 * Scans every category directory in the vault and writes
 * a lightweight pointer SKILL.md into the active skills directory.
 *
 * If skills_index.json entries are available for a category, the pointer
 * will include the full skill list for searchability. Otherwise it falls
 * back to counting files in the vault directory.
 */
export function generatePointers(
  activeSkillsDir: string,
  vaultDir: string,
  index: SkillIndexEntry[] = []
): void {
  const categoryDirs = listSubdirectories(vaultDir);

  // Group index entries by category for O(1) access per category
  const byCategory = new Map<string, SkillIndexEntry[]>();
  for (const entry of index) {
    const cat = entry.category ?? "_uncategorized";
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry);
  }

  for (const categoryName of categoryDirs) {
    const categoryVaultPath = path.join(vaultDir, categoryName);
    const skills = byCategory.get(categoryName) ?? [];

    // Skip empty vault category dirs that have no indexed skills either
    if (skills.length === 0) {
      const subDirs = fs.readdirSync(categoryVaultPath).filter((e) => {
        return fs.statSync(path.join(categoryVaultPath, e)).isDirectory();
      });
      if (subDirs.length === 0) continue;
    }

    const pointerDir = path.join(
      activeSkillsDir,
      `${categoryName}${POINTER_SUFFIX}`
    );

    ensureDir(pointerDir);

    const content = buildPointerContent(categoryName, skills, categoryVaultPath);
    fs.writeFileSync(path.join(pointerDir, SKILL_FILENAME), content, "utf-8");
  }
}
