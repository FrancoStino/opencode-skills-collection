import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import type { RiskLevel } from "../skill-pointer/risk-level.js";
import { shouldLoad, filterIndex } from "../skill-pointer/skill-risk-filter.js";
import { loadFilterConfig } from "../skill-pointer/config-loader.js";
import { runSkillPointer } from "../skill-pointer/index.js";
import type { SkillIndexEntry } from "../skill-pointer/vault-installer.js";
import type { SkillRiskFilterConfig } from "../skill-pointer/config-loader.js";
import { POINTER_SUFFIX } from "../constants/constants.js";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

describe("shouldLoad", () => {
  const defaultConfig: SkillRiskFilterConfig = {
    excludedRiskLevels: [],
    excludedSkills: [],
  };

  test("returns true for all risk levels when config has empty exclusions", () => {
    const levels: RiskLevel[] = ["none", "safe", "critical", "offensive", "unknown"];
    for (const level of levels) {
      expect(shouldLoad("any-skill", level, defaultConfig)).toBe(true);
    }
  });

  test("returns false when risk is in excludedRiskLevels", () => {
    const config: SkillRiskFilterConfig = {
      excludedRiskLevels: ["offensive"],
      excludedSkills: [],
    };
    expect(shouldLoad("ad-attacks", "offensive", config)).toBe(false);
    expect(shouldLoad("safe-tool", "safe", config)).toBe(true);
  });

  test("returns false when skillId is in excludedSkills", () => {
    const config: SkillRiskFilterConfig = {
      excludedRiskLevels: [],
      excludedSkills: ["my-skill"],
    };
    expect(shouldLoad("my-skill", "safe", config)).toBe(false);
    expect(shouldLoad("other-skill", "safe", config)).toBe(true);
  });

  test("treats undefined risk as unknown", () => {
    const config: SkillRiskFilterConfig = {
      excludedRiskLevels: ["unknown"],
      excludedSkills: [],
    };
    expect(shouldLoad("x", undefined, config)).toBe(false);
  });
});

describe("filterIndex", () => {
  const entries: SkillIndexEntry[] = [
    { id: "safe-tool", category: "dev", name: "Safe Tool", description: "A safe tool", risk: "safe" },
    { id: "offensive-tool", category: "security", name: "Offensive Tool", description: "An offensive tool", risk: "offensive" },
    { id: "unknown-tool", category: "dev", name: "Unknown Tool", description: "Unknown risk", risk: "unknown" },
    { id: "no-risk-tool", category: "dev", name: "No Risk Tool", description: "No risk field" },
  ];

  test("returns all entries with default config", () => {
    const config: SkillRiskFilterConfig = {
      excludedRiskLevels: [],
      excludedSkills: [],
    };
    const result = filterIndex(entries, config);
    expect(result.length).toBe(4);
  });

  test("filters out excluded risk levels", () => {
    const config: SkillRiskFilterConfig = {
      excludedRiskLevels: ["offensive"],
      excludedSkills: [],
    };
    const result = filterIndex(entries, config);
    expect(result.length).toBe(3);
    expect(result.find((e) => e.id === "offensive-tool")).toBeUndefined();
  });

  test("filters out excluded skills", () => {
    const config: SkillRiskFilterConfig = {
      excludedRiskLevels: [],
      excludedSkills: ["unknown-tool"],
    };
    const result = filterIndex(entries, config);
    expect(result.length).toBe(3);
    expect(result.find((e) => e.id === "unknown-tool")).toBeUndefined();
  });

  test("treats missing risk as unknown for filtering", () => {
    const config: SkillRiskFilterConfig = {
      excludedRiskLevels: ["unknown"],
      excludedSkills: [],
    };
    const result = filterIndex(entries, config);
    expect(result.find((e) => e.id === "no-risk-tool")).toBeUndefined();
    expect(result.find((e) => e.id === "unknown-tool")).toBeUndefined();
  });
});

describe("loadFilterConfig", () => {
  test("returns defaults for nonexistent file", () => {
    const config = loadFilterConfig(path.join(os.tmpdir(), `nonexistent-opencode-test-${Date.now()}.jsonc`));
    expect(config.excludedRiskLevels).toEqual([]);
    expect(config.excludedSkills).toEqual([]);
  });

  test("parses JSONC with excludedRiskLevels", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "risk-filter-test-"));
    const configPath = path.join(tmpDir, "skill-filter.jsonc");
    fs.writeFileSync(
      configPath,
      `{
  // This is a comment
  "excludedRiskLevels": ["offensive", "unknown"],
  "excludedSkills": ["windows-privilege-escalation"]
}`
    );
    try {
      const config = loadFilterConfig(configPath);
      expect(config.excludedRiskLevels).toEqual(["offensive", "unknown"]);
      expect(config.excludedSkills).toEqual(["windows-privilege-escalation"]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("parses JSONC with scanPatterns and skillPatches", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "risk-filter-test-"));
    const configPath = path.join(tmpDir, "skill-filter.jsonc");
    fs.writeFileSync(
      configPath,
      `{
  "scanPatterns": [
    { "id": "test-pattern", "pattern": "test", "description": "test", "severity": "block" },
    { "id": "invalid-pattern", "pattern": "test" } // Missing fields
  ],
  "skillPatches": [
    { "skillId": "test-skill", "find": "test", "replace": "replaced" },
    { "skillId": "invalid-patch" } // Missing fields
  ]
}`
    );
    try {
      const config = loadFilterConfig(configPath);
      expect(config.scanPatterns?.length).toBe(1);
      expect(config.scanPatterns?.[0].id).toBe("test-pattern");
      expect(config.skillPatches?.length).toBe(1);
      expect(config.skillPatches?.[0].skillId).toBe("test-skill");
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test("returns defaults when skillRiskFilter section is missing", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "risk-filter-test-"));
    const configPath = path.join(tmpDir, "skill-filter.jsonc");
    fs.writeFileSync(configPath, `{ "otherSection": { "key": "value" } }`);
    try {
      const config = loadFilterConfig(configPath);
      expect(config.excludedRiskLevels).toEqual([]);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

describe("runSkillPointer integration with risk filter", () => {
  let tmpDir: string;
  let activeSkillsDir: string;
  let bundledSkillsPath: string;
  let vaultDir: string;
  let configPath: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-pointer-integration-"));
    activeSkillsDir = path.join(tmpDir, "active-skills");
    bundledSkillsPath = path.join(tmpDir, "bundled-skills");
    vaultDir = path.join(tmpDir, "vault");
    configPath = path.join(tmpDir, "skill-filter.jsonc");

    fs.mkdirSync(bundledSkillsPath);
    
    const safeSkillDir = path.join(bundledSkillsPath, "safe-skill");
    fs.mkdirSync(safeSkillDir);
    fs.writeFileSync(path.join(safeSkillDir, "SKILL.md"), "---\nname: safe-skill\nrisk: safe\n---\nSafe content");

    const offensiveSkillDir = path.join(bundledSkillsPath, "offensive-skill");
    fs.mkdirSync(offensiveSkillDir);
    fs.writeFileSync(path.join(offensiveSkillDir, "SKILL.md"), "---\nname: offensive-skill\nrisk: offensive\n---\nOffensive content");

    const index: SkillIndexEntry[] = [
      { id: "safe-skill", category: "general", name: "Safe Skill", description: "Safe", risk: "safe" },
      { id: "offensive-skill", category: "security", name: "Offensive Skill", description: "Offensive", risk: "offensive" },
    ];
    fs.writeFileSync(path.join(tmpDir, "skills_index.json"), JSON.stringify(index));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test("filters out offensive skills when configured", () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        excludedRiskLevels: ["offensive"],
      })
    );

    runSkillPointer({
      activeSkillsDir,
      bundledSkillsPath,
      vaultDir,
      configPath,
    });

    expect(fs.existsSync(path.join(vaultDir, "general", "safe-skill"))).toBe(true);
    expect(fs.existsSync(path.join(vaultDir, "security", "offensive-skill"))).toBe(false);

    expect(fs.existsSync(path.join(activeSkillsDir, `general${POINTER_SUFFIX}`))).toBe(true);
    expect(fs.existsSync(path.join(activeSkillsDir, `security${POINTER_SUFFIX}`))).toBe(false);
  });

  test("loads all skills when no exclusions are set", () => {
    fs.writeFileSync(
      configPath,
      JSON.stringify({
        excludedRiskLevels: [],
      })
    );

    runSkillPointer({
      activeSkillsDir,
      bundledSkillsPath,
      vaultDir,
      configPath,
    });

    expect(fs.existsSync(path.join(vaultDir, "general", "safe-skill"))).toBe(true);
    expect(fs.existsSync(path.join(vaultDir, "security", "offensive-skill"))).toBe(true);

    expect(fs.existsSync(path.join(activeSkillsDir, `general${POINTER_SUFFIX}`))).toBe(true);
    expect(fs.existsSync(path.join(activeSkillsDir, `security${POINTER_SUFFIX}`))).toBe(true);
  });
});
