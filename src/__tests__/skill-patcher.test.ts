import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import { applySkillPatches } from "../skill-pointer/skill-patcher.js";
import type { SkillPatch } from "../skill-pointer/config-loader.js";
import type { SkillIndexEntry } from "../skill-pointer/vault-installer.js";
import {
  createTestContext,
  cleanupTestContext,
  makeSkill,
  readSkill,
  type TestContext,
} from "./test-helpers.js";

describe("applySkillPatches", () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext("patcher-test", "vault");
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  test("applies a simple text replacement", () => {
    const entry = makeSkill(ctx.baseDir, "test-skill", "dev", "You MUST invoke skill before every response.");
    const patches: SkillPatch[] = [
      { skillId: "test-skill", find: "MUST invoke skill", replace: "may invoke skill" },
    ];

    applySkillPatches(ctx.baseDir, [entry], patches);
    const result = readSkill(ctx.baseDir, "test-skill", "dev");
    expect(result).toContain("may invoke skill");
    expect(result).not.toContain("MUST invoke skill");
  });

  test("applies regex replacement with capture groups", () => {
    const entry = makeSkill(ctx.baseDir, "regex-skill", "meta", "even a 1% chance a skill might apply");
    const patches: SkillPatch[] = [
      { skillId: "regex-skill", find: String.raw`(\d+)% chance`, replace: "reasonable chance" },
    ];

    applySkillPatches(ctx.baseDir, [entry], patches);
    const result = readSkill(ctx.baseDir, "regex-skill", "meta");
    expect(result).toContain("reasonable chance");
    expect(result).not.toContain("1% chance");
  });

  test("handles symlinked vault directory correctly", () => {
    // Create a real directory outside the vault
    const realVaultDir = path.join(ctx.baseDir, "real-vault");
    fs.mkdirSync(realVaultDir);
    
    // Create a symlink to it
    const symlinkedVaultDir = path.join(ctx.baseDir, "symlinked-vault");
    fs.symlinkSync(realVaultDir, symlinkedVaultDir, "dir");

    // Create a skill in the real directory
    const categoryDir = path.join(realVaultDir, "dev");
    fs.mkdirSync(categoryDir);
    const skillDir = path.join(categoryDir, "symlink-skill");
    fs.mkdirSync(skillDir);
    fs.writeFileSync(path.join(skillDir, "SKILL.md"), "Original content", "utf-8");

    const entry: SkillIndexEntry = {
      id: "symlink-skill",
      category: "dev",
      name: "Symlink",
      description: "Symlink test",
    };

    const patches: SkillPatch[] = [
      { skillId: "symlink-skill", find: "Original", replace: "Patched" },
    ];

    // Apply patches using the symlinked vault path
    applySkillPatches(symlinkedVaultDir, [entry], patches);

    // Verify the patch was applied
    const result = fs.readFileSync(path.join(realVaultDir, "dev", "symlink-skill", "SKILL.md"), "utf-8");
    expect(result).toBe("Patched content");
  });

  test("applies regex replacement across newlines using dotAll flag", () => {
    const entry = makeSkill(ctx.baseDir, "multiline-skill", "dev", "Line 1\nLine 2\nLine 3");
    const patches: SkillPatch[] = [
      { skillId: "multiline-skill", find: "Line 1.*Line 3", replace: "Replaced all lines" },
    ];

    applySkillPatches(ctx.baseDir, [entry], patches);
    const result = readSkill(ctx.baseDir, "multiline-skill", "dev");
    expect(result).toBe("Replaced all lines");
  });

  test("skips silently on invalid inputs (missing index, missing file, invalid regex)", () => {
    const existingEntry = makeSkill(ctx.baseDir, "existing-skill", "dev", "Some content.");
    const badRegexEntry = makeSkill(ctx.baseDir, "bad-regex-skill", "dev", "Some content here.");
    const ghostEntry: SkillIndexEntry = { id: "ghost-skill", category: "dev", name: "Ghost", description: "No file" };

    const patches: SkillPatch[] = [
      { skillId: "nonexistent-skill", find: "content", replace: "replaced" },
      { skillId: "ghost-skill", find: "anything", replace: "replaced" },
      { skillId: "bad-regex-skill", find: "[invalid(", replace: "replaced" },
    ];

    expect(() => applySkillPatches(ctx.baseDir, [existingEntry, badRegexEntry, ghostEntry], patches)).not.toThrow();
    
    expect(readSkill(ctx.baseDir, "existing-skill", "dev")).toBe("Some content.");
    expect(readSkill(ctx.baseDir, "bad-regex-skill", "dev")).toBe("Some content here.");
  });

  test("applies multiple patches to the same skill in order", () => {
    const entry = makeSkill(ctx.baseDir, "multi-patch", "dev", "AAA BBB CCC");
    const patches: SkillPatch[] = [
      { skillId: "multi-patch", find: "AAA", replace: "111" },
      { skillId: "multi-patch", find: "BBB", replace: "222" },
    ];

    applySkillPatches(ctx.baseDir, [entry], patches);
    const result = readSkill(ctx.baseDir, "multi-patch", "dev");
    expect(result).toBe("111 222 CCC");
  });

  test("is idempotent — re-running same patches produces no further changes", () => {
    const entry = makeSkill(ctx.baseDir, "idempotent-skill", "dev", "Replace THIS word.");
    const patches: SkillPatch[] = [
      { skillId: "idempotent-skill", find: "THIS", replace: "THAT" },
    ];

    applySkillPatches(ctx.baseDir, [entry], patches);
    const firstRun = readSkill(ctx.baseDir, "idempotent-skill", "dev");
    applySkillPatches(ctx.baseDir, [entry], patches);
    const secondRun = readSkill(ctx.baseDir, "idempotent-skill", "dev");

    expect(firstRun).toBe(secondRun);
    expect(secondRun).toBe("Replace THAT word.");
  });

  test("does nothing when patches array is empty", () => {
    const entry = makeSkill(ctx.baseDir, "unchanged", "dev", "Original content.");

    applySkillPatches(ctx.baseDir, [entry], []);
    expect(readSkill(ctx.baseDir, "unchanged", "dev")).toBe("Original content.");
  });

  test("replacement is case-insensitive and global", () => {
    const entry = makeSkill(ctx.baseDir, "case-skill", "dev", "MUST do this. You must also must do that.");
    const patches: SkillPatch[] = [
      { skillId: "case-skill", find: "must", replace: "may" },
    ];

    applySkillPatches(ctx.baseDir, [entry], patches);
    const result = readSkill(ctx.baseDir, "case-skill", "dev");
    expect(result).not.toMatch(/must/i);
    expect(result).toContain("may");
  });
});
