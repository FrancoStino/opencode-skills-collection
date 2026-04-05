import fs from "fs";
import path from "path";

/**
 * Ensures a directory exists, creating it recursively if needed.
 */
export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
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
