import fs from "fs";
import path from "path";
import { SKILL_FILENAME } from "../constants/heuristics.js";

/**
 * Recursively counts SKILL.md files inside a directory.
 */
export function countSkillFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;

  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      count += countSkillFiles(fullPath);
    } else if (entry === SKILL_FILENAME) {
      count++;
    }
  }

  return count;
}

/**
 * Ensures a directory exists, creating it recursively if needed.
 */
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Moves a directory from src to dest, overwriting dest if it already exists.
 */
export function moveDir(src: string, dest: string): void {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.renameSync(src, dest);
}

/**
 * Returns the names of all direct child directories inside a given path.
 */
export function listSubdirectories(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath)
    .filter((entry) => {
      const fullPath = path.join(dirPath, entry);
      return fs.statSync(fullPath).isDirectory();
    });
}
