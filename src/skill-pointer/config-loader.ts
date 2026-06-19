import * as os from "node:os";
import * as path from "node:path";
import * as fs from "node:fs";
import stripJsonComments from "strip-json-comments";
import type { RiskLevel } from "./risk-level.js";

export interface ScanPattern {
  id: string;
  pattern: string;
  description: string;
  severity: "block" | "warn";
}

export interface SkillPatch {
  skillId: string;
  find: string;
  replace: string;
  description?: string;
}

export interface SkillRiskFilterConfig {
  excludedRiskLevels?: RiskLevel[];
  excludedSkills?: string[];
  scanPatterns?: ScanPattern[];
  skillPatches?: SkillPatch[];
}

const DEFAULT_CONFIG: SkillRiskFilterConfig = {
  excludedRiskLevels: [],
  excludedSkills: [],
  scanPatterns: [],
  skillPatches: [],
};

export const DEFAULT_FILTER_CONFIG_PATH = path.join(
  os.homedir(),
  ".config",
  "opencode",
  "skill-filter.jsonc"
);

const VALID_RISK_LEVELS: RiskLevel[] = ["none", "safe", "critical", "offensive", "unknown"];
const VALID_SEVERITIES = ["block", "warn"] as const;

function isValidScanPattern(entry: unknown): entry is ScanPattern {
  if (typeof entry !== "object" || entry === null) return false;
  const obj = entry as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.pattern === "string" &&
    typeof obj.description === "string" &&
    typeof obj.severity === "string" &&
    (VALID_SEVERITIES as readonly string[]).includes(obj.severity)
  );
}

function isValidSkillPatch(entry: unknown): entry is SkillPatch {
  if (typeof entry !== "object" || entry === null) return false;
  const obj = entry as Record<string, unknown>;
  return (
    typeof obj.skillId === "string" &&
    typeof obj.find === "string" &&
    typeof obj.replace === "string"
  );
}

/**
 * Loads filter config from skill-filter.jsonc. Missing file or section returns defaults.
 * @param configPath Optional override (for testing).
 */
export function loadFilterConfig(
  configPath?: string
): SkillRiskFilterConfig {
  const resolvedPath = configPath ?? DEFAULT_FILTER_CONFIG_PATH;

  if (!fs.existsSync(resolvedPath)) {
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(resolvedPath, "utf-8");
    const stripped = stripJsonComments(raw);
    const parsed = JSON.parse(stripped) as Record<string, unknown>;

    return {
      excludedRiskLevels: Array.isArray(parsed.excludedRiskLevels)
        ? (parsed.excludedRiskLevels.filter((v: unknown) =>
            VALID_RISK_LEVELS.includes(v as RiskLevel)
          ) as RiskLevel[])
        : DEFAULT_CONFIG.excludedRiskLevels,
      excludedSkills: Array.isArray(parsed.excludedSkills)
        ? (parsed.excludedSkills as string[])
        : DEFAULT_CONFIG.excludedSkills,
      scanPatterns: Array.isArray(parsed.scanPatterns)
        ? parsed.scanPatterns.filter(isValidScanPattern)
        : DEFAULT_CONFIG.scanPatterns,
      skillPatches: Array.isArray(parsed.skillPatches)
        ? parsed.skillPatches.filter(isValidSkillPatch)
        : DEFAULT_CONFIG.skillPatches,
    };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}
