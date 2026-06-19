import fs from "fs";
import path from "path";
import { POINTER_SUFFIX, SKILL_FILENAME, UNCATEGORIZED_CATEGORY } from "../constants/constants.js";
import { ensureDir } from "../utils/fs.utils.js";
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
risk: none
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

> ⚠️ **Anti-loop guard**: Do NOT invoke skills recursively or check for applicable skills before every response. Each skill should be loaded at most once per user request. If you have already identified and loaded the relevant skill for this task, proceed with execution — do not re-scan for skills.
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
  const byCategory = new Map<string, SkillIndexEntry[]>();
  for (const entry of index) {
    const cat = entry.category ?? UNCATEGORIZED_CATEGORY;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(entry);
  }

  const expectedPointers = new Set(
    [...byCategory.keys()].map((c) => `${c}${POINTER_SUFFIX}`)
  );
  if (fs.existsSync(activeSkillsDir)) {
    for (const dirent of fs.readdirSync(activeSkillsDir, { withFileTypes: true })) {
      if (!dirent.isDirectory() || !dirent.name.endsWith(POINTER_SUFFIX)) continue;
      if (!expectedPointers.has(dirent.name)) {
        fs.rmSync(path.join(activeSkillsDir, dirent.name), { recursive: true, force: true });
      }
    }
  }

  for (const [categoryName, skills] of byCategory.entries()) {
    const categoryVaultPath = path.join(vaultDir, categoryName);

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
