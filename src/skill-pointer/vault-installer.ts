import fs from "fs";
import path from "path";
import { ensureDir } from "../utils/fs.utils.js";
import { UNCATEGORIZED_CATEGORY } from "../constants/constants.js";

export interface SkillIndexEntry {
  id: string;
  category: string;
  name: string;
  description: string;
}

/**
 * Extracts a frontmatter field value from a SKILL.md string.
 * Handles both quoted and unquoted values.
 */
function parseFrontmatterField(content: string, field: string): string {
  const match = content.match(new RegExp(`^${field}:\\s*["']?([^"'\\n]+)["']?`, "m"));
  return match ? match[1].trim() : "";
}

/**
 * Derives a category slug from a skill folder name by taking the
 * first hyphen-separated segment (e.g. "laravel-expert" → "laravel",
 * "wordpress-core" → "wordpress", "php-pro" → "php").
 * Falls back to UNCATEGORIZED_CATEGORY for single-word names.
 */
function categoryFromFolderName(folderName: string): string {
  const parts = folderName.split("-");
  return parts.length > 1 ? parts[0] : UNCATEGORIZED_CATEGORY;
}

/**
 * Builds a SkillIndexEntry[] by scanning every skill folder in
 * bundledSkillsPath and reading its SKILL.md frontmatter.
 * This is used as fallback when skills_index.json is absent.
 */
function buildIndexFromBundledSkills(bundledSkillsPath: string): SkillIndexEntry[] {
  const index: SkillIndexEntry[] = [];
  for (const entry of fs.readdirSync(bundledSkillsPath)) {
    if (entry.startsWith(".") || entry === "skills_index.json" || entry === "README.md") continue;
    const skillDir = path.join(bundledSkillsPath, entry);
    if (!fs.statSync(skillDir).isDirectory()) continue;
    const skillMdPath = path.join(skillDir, "SKILL.md");
    if (!fs.existsSync(skillMdPath)) continue;

    const content = fs.readFileSync(skillMdPath, "utf-8");
    const name = parseFrontmatterField(content, "name") || entry;
    const description = parseFrontmatterField(content, "description") || name;
    const category = parseFrontmatterField(content, "category") || categoryFromFolderName(entry);

    index.push({ id: entry, category, name, description });
  }
  return index;
}

/**
 * Loads the pre-built skills_index.json from the project root.
 * Falls back to a dynamically generated index from SKILL.md frontmatter
 * when the file is missing, so the plugin always works correctly.
 */
export function loadSkillsIndex(bundledSkillsPath: string): SkillIndexEntry[] {
  const indexPath = path.join(bundledSkillsPath, "..", "skills_index.json");
  if (fs.existsSync(indexPath)) {
    try {
      const raw = fs.readFileSync(indexPath, "utf-8");
      return JSON.parse(raw) as SkillIndexEntry[];
    } catch {
      // fall through to dynamic generation
    }
  }
  return buildIndexFromBundledSkills(bundledSkillsPath);
}

/**
 * Copies every skill folder from bundledSkillsPath directly into
 * the vault under the appropriate category sub-directory.
 */
export function installSkillsToVault(
  bundledSkillsPath: string,
  vaultDir: string,
  index: SkillIndexEntry[]
): void {
  if (!fs.existsSync(bundledSkillsPath)) return;

  const categoryMap = new Map(
    index.map((e) => [e.id, e.category ?? UNCATEGORIZED_CATEGORY])
  );

  for (const entry of fs.readdirSync(bundledSkillsPath)) {
    if (
      entry.startsWith(".") ||
      entry === "skills_index.json" ||
      entry === "README.md"
    ) continue;

    const srcPath = path.join(bundledSkillsPath, entry);
    if (!fs.statSync(srcPath).isDirectory()) continue;

    const category = categoryMap.get(entry) ?? UNCATEGORIZED_CATEGORY;
    const destPath = path.join(vaultDir, category, entry);

    ensureDir(path.join(vaultDir, category));
    fs.cpSync(srcPath, destPath, { recursive: true, force: true });
  }
}
