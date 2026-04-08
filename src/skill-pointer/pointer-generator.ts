import fs from "fs";
import path from "path";
import { POINTER_SUFFIX, SKILL_FILENAME, UNCATEGORIZED_CATEGORY } from "../constants/constants.js";
import { ensureDir, listSubdirectories } from "../utils/fs.utils.js";
import type { SkillIndexEntry } from "./vault-installer.js";

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
 * Each pointer includes the full list of skill names + descriptions
 * so keyword searches (e.g. "laravel", "wordpress") resolve correctly
 * via get_available_skills without loading every SKILL.md.
 */
export function generatePointers(
  activeSkillsDir: string,
  vaultDir: string,
  index: SkillIndexEntry[] = []
): void {
  const categoryDirs = listSubdirectories(vaultDir);

  const byCategory = new Map<string, SkillIndexEntry[]>();
  for (const entry of index) {
    const cat = entry.category ?? UNCATEGORIZED_CATEGORY;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry);
  }

  for (const categoryName of categoryDirs) {
    const categoryVaultPath = path.join(vaultDir, categoryName);
    const skills = byCategory.get(categoryName) ?? [];

    if (skills.length === 0) {
      const subDirs = fs.readdirSync(categoryVaultPath).filter((e) =>
        fs.statSync(path.join(categoryVaultPath, e)).isDirectory()
      );
      if (subDirs.length === 0) continue;
    }

    const pointerDir = path.join(
      activeSkillsDir,
      `${categoryName}${POINTER_SUFFIX}`
    );

    ensureDir(pointerDir);
    fs.writeFileSync(
      path.join(pointerDir, SKILL_FILENAME),
      buildPointerContent(categoryName, skills, categoryVaultPath),
      "utf-8"
    );
  }
}
