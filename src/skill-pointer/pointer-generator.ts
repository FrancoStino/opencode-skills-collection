import fs from "fs";
import path from "path";
import { POINTER_SUFFIX, SKILL_FILENAME } from "../constants/heuristics.js";
import { countSkillFiles, ensureDir, listSubdirectories } from "../utils/fs.utils.js";

/**
 * Builds the SKILL.md content for a category pointer.
 * The pointer instructs the AI to use native file tools
 * (list_dir / view_file) to browse the hidden vault on demand.
 */
function buildPointerContent(
  category: string,
  skillCount: number,
  libraryPath: string
): string {
  const title = category
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const normalizedPath = libraryPath.replace(/\\/g, "/");

  return `---
name: ${category}${POINTER_SUFFIX}
description: "Pointer to a library of ${skillCount} specialized ${title} skills. Use when working on ${category}-related tasks."
risk: safe
---

# ${title} Capability Library 🎯

This is a **pointer skill**. The ${skillCount} specialized ${title} skills are stored in a hidden vault to keep your startup context minimal.

## How to retrieve a skill

1. Use \`list_dir\` to browse the vault: \`${normalizedPath}\`
2. Identify the sub-folder matching your task.
3. Use \`view_file\` to read its \`SKILL.md\` into context.
4. Follow those instructions to complete the request.

**Vault path:** \`${normalizedPath}\`

> Do not guess best practices — always read from the vault first.
`;
}

/**
 * Scans every category directory in the vault and writes
 * a lightweight pointer SKILL.md into the active skills directory.
 */
export function generatePointers(
  activeSkillsDir: string,
  vaultDir: string
): void {
  const categoryDirs = listSubdirectories(vaultDir);

  for (const categoryName of categoryDirs) {
    const categoryVaultPath = path.join(vaultDir, categoryName);
    const skillCount = countSkillFiles(categoryVaultPath);

    if (skillCount === 0) continue;

    const pointerDir = path.join(
      activeSkillsDir,
      `${categoryName}${POINTER_SUFFIX}`
    );

    ensureDir(pointerDir);

    const content = buildPointerContent(
      categoryName,
      skillCount,
      categoryVaultPath
    );

    fs.writeFileSync(path.join(pointerDir, SKILL_FILENAME), content, "utf-8");
  }
}
