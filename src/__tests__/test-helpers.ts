import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { SkillIndexEntry } from "../skill-pointer/vault-installer.js";

export interface TestContext {
  tmpDir: string;
  baseDir: string;
}

/**
 * Create a temporary directory for tests.
 * @param prefix - Prefix for the temp directory name
 * @param subdirName - Subdirectory name inside the temp dir (e.g. "vault", "bundled")
 */
export function createTestContext(prefix: string, subdirName: string): TestContext {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));
  const baseDir = path.join(tmpDir, subdirName);
  fs.mkdirSync(baseDir);
  return { tmpDir, baseDir };
}

/**
 * Remove a temporary directory and all its contents.
 */
export function cleanupTestContext(ctx: TestContext): void {
  fs.rmSync(ctx.tmpDir, { recursive: true, force: true });
}

/**
 * Create a skill directory with a SKILL.md file and return a SkillIndexEntry.
 * @param baseDir - Root directory (vault or bundled-skills)
 * @param id - Skill identifier
 * @param category - Skill category
 * @param content - Content for SKILL.md
 */
export function makeSkill(
  baseDir: string,
  id: string,
  category: string,
  content: string
): SkillIndexEntry {
  const skillDir = path.join(baseDir, category, id);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), content, "utf-8");
  return { id, category, name: id, description: `${id} skill` };
}

/**
 * Read the content of a skill's SKILL.md file.
 */
export function readSkill(baseDir: string, id: string, category: string): string {
  return fs.readFileSync(
    path.join(baseDir, category, id, "SKILL.md"),
    "utf-8"
  );
}

/**
 * Create a skill directory with a SKILL.md file at the flat level (no category nesting).
 * Used for bundled-skills style layout where skills are at bundledPath/skillId/SKILL.md.
 */
export function makeBundledSkill(
  bundledPath: string,
  id: string,
  content: string
): void {
  const skillDir = path.join(bundledPath, id);
  fs.mkdirSync(skillDir, { recursive: true });
  fs.writeFileSync(path.join(skillDir, "SKILL.md"), content, "utf-8");
}
