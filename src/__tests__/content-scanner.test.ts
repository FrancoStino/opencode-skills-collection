import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import {
  scanSkillContent,
  scanSkills,
  mergePatterns,
  DEFAULT_SCAN_PATTERNS,
} from "../skill-pointer/content-scanner.js";
import type { ScanPattern } from "../skill-pointer/config-loader.js";
import type { SkillIndexEntry } from "../skill-pointer/vault-installer.js";
import {
  createTestContext,
  cleanupTestContext,
  makeBundledSkill,
  type TestContext,
} from "./test-helpers.js";

describe("scanSkillContent", () => {
  test("detects recursive skill invocation pattern", () => {
    const content =
      "Invoke relevant or requested skills BEFORE any response or action.";
    const matches = scanSkillContent(content, DEFAULT_SCAN_PATTERNS);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((m) => m.id === "recursive-skill-invocation")).toBe(true);
  });

  test("detects recursive skill invocation pattern across newlines", () => {
    const content =
      "Invoke relevant or requested skills\nBEFORE any response or action.";
    const matches = scanSkillContent(content, DEFAULT_SCAN_PATTERNS);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((m) => m.id === "recursive-skill-invocation")).toBe(true);
  });

  test("detects aggressive 1% threshold pattern", () => {
    const content =
      "If you think there is even a 1% chance a skill might apply, you ABSOLUTELY MUST invoke the skill.";
    const matches = scanSkillContent(content, DEFAULT_SCAN_PATTERNS);
    expect(matches.some((m) => m.id === "aggressive-match-threshold")).toBe(true);
  });

  test("detects mandatory skill invocation directive", () => {
    const content = "You ABSOLUTELY MUST invoke the skill before anything.";
    const matches = scanSkillContent(content, DEFAULT_SCAN_PATTERNS);
    expect(matches.some((m) => m.id === "mandatory-pre-response-skill-check")).toBe(true);
  });

  test("returns empty array for safe content", () => {
    const content = "This skill helps you write Laravel controllers.\n\n## Steps\n1. Create the controller.";
    const matches = scanSkillContent(content, DEFAULT_SCAN_PATTERNS);
    expect(matches).toEqual([]);
  });

  test("skips invalid regex patterns silently", () => {
    const patterns: ScanPattern[] = [
      { id: "bad-regex", pattern: "[invalid(", description: "broken", severity: "block" },
    ];
    const matches = scanSkillContent("any content", patterns);
    expect(matches).toEqual([]);
  });
});

describe("mergePatterns", () => {
  test("returns defaults when config patterns are empty", () => {
    const result = mergePatterns([]);
    expect(result.length).toBe(DEFAULT_SCAN_PATTERNS.length);
  });

  test("config patterns override defaults with same id", () => {
    const override: ScanPattern[] = [
      {
        id: "recursive-skill-invocation",
        pattern: "custom-override-pattern",
        description: "overridden",
        severity: "warn",
      },
    ];
    const result = mergePatterns(override);
    const found = result.find((p) => p.id === "recursive-skill-invocation");
    expect(found?.pattern).toBe("custom-override-pattern");
    expect(found?.severity).toBe("warn");
  });

  test("config patterns add new entries", () => {
    const extra: ScanPattern[] = [
      { id: "custom-check", pattern: "dangerous", description: "custom", severity: "block" },
    ];
    const result = mergePatterns(extra);
    expect(result.length).toBe(DEFAULT_SCAN_PATTERNS.length + 1);
    expect(result.some((p) => p.id === "custom-check")).toBe(true);
  });
});

describe("scanSkills", () => {
  let ctx: TestContext;

  beforeEach(() => {
    ctx = createTestContext("scanner-test", "bundled");
  });

  afterEach(() => {
    cleanupTestContext(ctx);
  });

  test("quarantines skill with blocking patterns", () => {
    makeBundledSkill(ctx.baseDir, "loop-skill", "You ABSOLUTELY MUST invoke the skill before ANY response.");

    const index: SkillIndexEntry[] = [
      { id: "loop-skill", category: "meta", name: "Loop", description: "Loops" },
    ];

    const result = scanSkills(ctx.baseDir, index);
    expect(result.quarantined.length).toBe(1);
    expect(result.quarantined[0].skillId).toBe("loop-skill");
    expect(result.quarantined[0].blocked).toBe(true);
    expect(result.passed.length).toBe(0);
  });

  test("quarantines entries with path-traversal-like skillIds", () => {
    const index: SkillIndexEntry[] = [
      { id: "../escape", category: "dev", name: "Escape", description: "Escape" },
      { id: "a/b", category: "dev", name: "Nested", description: "Nested" },
    ];

    const result = scanSkills(ctx.baseDir, index);
    expect(result.quarantined.length).toBe(2);
    expect(result.quarantined[0].skillId).toBe("../escape");
    expect(result.quarantined[0].matchedPatterns[0].id).toBe("path-traversal");
    expect(result.quarantined[1].skillId).toBe("a/b");
    expect(result.passed.length).toBe(0);
  });

  test("passes safe skills", () => {
    makeBundledSkill(ctx.baseDir, "safe-skill", "---\nname: safe-skill\n---\nHelps write clean code.");

    const index: SkillIndexEntry[] = [
      { id: "safe-skill", category: "dev", name: "Safe", description: "Safe" },
    ];

    const result = scanSkills(ctx.baseDir, index);
    expect(result.passed.length).toBe(1);
    expect(result.quarantined.length).toBe(0);
  });

  test("passes skills whose SKILL.md is missing", () => {
    const index: SkillIndexEntry[] = [
      { id: "ghost-skill", category: "dev", name: "Ghost", description: "No file" },
    ];

    const result = scanSkills(ctx.baseDir, index);
    expect(result.passed.length).toBe(1);
  });

  test("warns but passes skills with warn-only patterns", () => {
    makeBundledSkill(ctx.baseDir, "warn-skill", "Some warn-triggering content.");

    const warnPatterns: ScanPattern[] = [
      { id: "warn-test", pattern: "warn-triggering", description: "test", severity: "warn" },
    ];

    const index: SkillIndexEntry[] = [
      { id: "warn-skill", category: "dev", name: "Warn", description: "Warn" },
    ];

    const result = scanSkills(ctx.baseDir, index, warnPatterns);
    expect(result.passed.length).toBe(1);
    expect(result.warned.length).toBe(1);
    expect(result.quarantined.length).toBe(0);
  });

  test("quarantines the using-superpowers skill content", () => {
    makeBundledSkill(
      ctx.baseDir,
      "using-superpowers",
      [
        "<EXTREMELY-IMPORTANT>",
        "If you think there is even a 1% chance a skill might apply, you ABSOLUTELY MUST invoke the skill.",
        "</EXTREMELY-IMPORTANT>",
        "Invoke relevant or requested skills BEFORE any response or action.",
      ].join("\n")
    );

    const index: SkillIndexEntry[] = [
      { id: "using-superpowers", category: "meta", name: "Using Superpowers", description: "Meta skill" },
    ];

    const result = scanSkills(ctx.baseDir, index);
    expect(result.quarantined.length).toBe(1);
    expect(result.quarantined[0].skillId).toBe("using-superpowers");
    expect(result.passed.length).toBe(0);
  });
});
