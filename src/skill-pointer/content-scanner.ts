import * as fs from "node:fs";
import * as path from "node:path";
import type {ScanPattern} from "./config-loader.js";
import type {SkillIndexEntry} from "./vault-installer.js";
import {SKILL_FILENAME} from "../constants/constants.js";

export interface ScanResult {
    skillId: string;
    matchedPatterns: { id: string; severity: "block" | "warn" }[];
    blocked: boolean;
}

export interface ScanOutput {
    passed: SkillIndexEntry[];
    quarantined: ScanResult[];
    warned: ScanResult[];
}

/** Default patterns that detect recursive loop triggers in skill content. */
export const DEFAULT_SCAN_PATTERNS: ScanPattern[] = [
    {
        id: "recursive-skill-invocation",
        pattern:
            String.raw`(invoke|use|check|load)\b.*?\bskills?\b.*?\bbefore\s+(any|every|all)\s+(response|action|message)`,
        description:
            "Detects instructions mandating skill invocation before every response",
        severity: "block",
    },
    {
        id: "aggressive-match-threshold",
        pattern: String.raw`(even\s+)?(a\s+)?1%\s+chance.*skill`,
        description:
            "Detects extremely low probability thresholds causing over-triggering",
        severity: "block",
    },
    {
        id: "mandatory-pre-response-skill-check",
        pattern: String.raw`you\s+(absolutely\s+)?must.*invoke.*skill`,
        description: "Detects mandatory skill invocation directives",
        severity: "block",
    },
];

/**
 * Merges user-supplied scan patterns with built-in defaults.
 * Config patterns with the same `id` override the default entry,
 * but only if the config pattern has a valid regex. Invalid overrides
 * are rejected and the default is preserved to prevent silently
 * disabling built-in protection.
 */
export function mergePatterns(configPatterns: ScanPattern[]): ScanPattern[] {
    const merged = new Map<string, ScanPattern>();

    for (const p of DEFAULT_SCAN_PATTERNS) {
        merged.set(p.id, p);
    }
    for (const p of configPatterns) {
        // Validate regex before allowing override
        try {
            new RegExp(p.pattern, "i");
            merged.set(p.id, p);
        } catch {
            // If this would override a default, keep the default — don't silently disable protection
            if (!merged.has(p.id)) {
                // New pattern with invalid regex — just skip it
                console.warn(`Invalid regex for pattern '${p.id}': ${p.pattern}`);
            }
            // Existing default stays in place
        }
    }

    return [...merged.values()];
}

/**
 * Tests skill content against a list of scan patterns.
 * Returns the list of matched pattern ids and severities.
 */
export function scanSkillContent(
    content: string,
    patterns: ScanPattern[]
): { id: string; severity: "block" | "warn" }[] {
    const matches: { id: string; severity: "block" | "warn" }[] = [];

    for (const p of patterns) {
        try {
            const re = new RegExp(p.pattern, "i");
            if (re.test(content)) {
                matches.push({id: p.id, severity: p.severity});
            }
        } catch {
            // Invalid regex — skip silently
        }
    }

    return matches;
}

/**
 * Scans every skill's SKILL.md for dangerous content patterns.
 * Returns lists of passed, quarantined (blocked), and warned entries.
 */
export function scanSkills(
    bundledSkillsPath: string,
    index: SkillIndexEntry[],
    configPatterns?: ScanPattern[]
): ScanOutput {
    const patterns = mergePatterns(configPatterns ?? []);

    const passed: SkillIndexEntry[] = [];
    const quarantined: ScanResult[] = [];
    const warned: ScanResult[] = [];

    for (const entry of index) {
        // Path traversal guard: quarantine entries whose id escapes the bundled-skills directory
        if (entry.id.includes("..") || entry.id.includes(path.sep) || entry.id.includes("/")) {
            quarantined.push({
                skillId: entry.id,
                matchedPatterns: [{ id: "path-traversal", severity: "block" }],
                blocked: true,
            });
            continue;
        }

        const skillFile = path.join(bundledSkillsPath, entry.id, SKILL_FILENAME);

        if (!fs.existsSync(skillFile)) {
            passed.push(entry);
            continue;
        }

        const content = fs.readFileSync(skillFile, "utf-8");
        const matches = scanSkillContent(content, patterns);

        if (matches.length === 0) {
            passed.push(entry);
            continue;
        }

        const hasBlock = matches.some((m) => m.severity === "block");
        const result: ScanResult = {
            skillId: entry.id,
            matchedPatterns: matches,
            blocked: hasBlock,
        };

        if (hasBlock) {
            quarantined.push(result);
        } else {
            warned.push(result);
            passed.push(entry);
        }
    }

    return {passed, quarantined, warned};
}


