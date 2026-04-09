import fs from "fs";

export function ensureDir(dirPath: string): void {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function listSubdirectories(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];

  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
