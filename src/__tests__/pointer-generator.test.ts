import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import fs from "fs";
import path from "path";
import os from "os";
import { generatePointers } from "../skill-pointer/pointer-generator.js";
import type { SkillIndexEntry } from "../skill-pointer/vault-installer.js";
import { POINTER_SUFFIX, SKILL_FILENAME } from "../constants/constants.js";

function createTmpDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "ptr-gen-test-"));
}

describe("Pointer Generator", () => {
  let activeDir: string;
  let vaultDir: string;

  beforeEach(() => {
    activeDir = createTmpDir();
    vaultDir = createTmpDir();
  });

  afterEach(() => {
    fs.rmSync(activeDir, { recursive: true, force: true });
    fs.rmSync(vaultDir, { recursive: true, force: true });
  });

  test("generates pointer file for a category with indexed skills", () => {
    const categoryName = "backend-dev";
    fs.mkdirSync(path.join(vaultDir, categoryName, "laravel-expert"), { recursive: true });

    const index: SkillIndexEntry[] = [
      { id: "laravel-expert", category: categoryName, name: "Laravel Expert", description: "Laravel framework skills" },
    ];

    generatePointers(activeDir, vaultDir, index);

    const pointerPath = path.join(activeDir, `${categoryName}${POINTER_SUFFIX}`, SKILL_FILENAME);
    expect(fs.existsSync(pointerPath)).toBe(true);

    const content = fs.readFileSync(pointerPath, "utf-8");
    expect(content).toContain("laravel-expert");
    expect(content).toContain("Laravel framework skills");
    expect(content).toContain("1 specialized");
    // V2 tool names: pointers must instruct the agent to use `read`.
    expect(content).toContain("`read`");
    expect(content).not.toContain("view_file");
    expect(content).not.toContain("list_dir");
  });

  test("does not generate pointers when index is empty even if vault has subdirs", () => {
    const categoryName = "uncategorized";
    fs.mkdirSync(path.join(vaultDir, categoryName, "some-skill"), { recursive: true });
    fs.mkdirSync(path.join(vaultDir, categoryName, "another-skill"), { recursive: true });

    generatePointers(activeDir, vaultDir, []);

    const pointerPath = path.join(activeDir, `${categoryName}${POINTER_SUFFIX}`);
    expect(fs.existsSync(pointerPath)).toBe(false);
  });

  test("skips category when not present in index", () => {
    const categoryName = "empty-cat";
    fs.mkdirSync(path.join(vaultDir, categoryName), { recursive: true });

    generatePointers(activeDir, vaultDir, []);

    const pointerPath = path.join(activeDir, `${categoryName}${POINTER_SUFFIX}`);
    expect(fs.existsSync(pointerPath)).toBe(false);
  });
});
