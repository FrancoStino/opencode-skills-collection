import type {Plugin as PluginV1, PluginInput} from "@opencode-ai/plugin";
import {Plugin} from "@opencode/plugin";
import os from "os";
import path from "path";
import {fileURLToPath} from "url";
import {ensureDir} from "./utils/fs.utils.js";
import {runSkillPointer} from "./skill-pointer/index.js";

const ACTIVE_SKILLS_PATH_SEGMENTS = [".config", "opencode", "skills"] as const;

function resolveBundledSkillsPath(): string {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    return path.join(__dirname, "..", "bundled-skills");
}

function resolveActiveSkillsDir(): string {
    return path.join(os.homedir(), ...ACTIVE_SKILLS_PATH_SEGMENTS);
}

function runStartupPipeline(): void {
    const bundledSkillsPath = resolveBundledSkillsPath();
    const activeSkillsDir = resolveActiveSkillsDir();

    ensureDir(activeSkillsDir);
    runSkillPointer({bundledSkillsPath, activeSkillsDir});
}

/**
 * OpenCode Skills Collection plugin (V1 + V2 from a single entrypoint).
 *
 * On every OpenCode startup:
 * 1. Copies bundled skills directly into the vault
 *    (~/.config/opencode/skill-libraries/) organised by category.
 *    The active skills directory is never used as staging.
 * 2. Generates lightweight category pointer SKILL.md files in
 *    ~/.config/opencode/skills/ without touching user custom skills.
 */
const OpenCodeSkillsCollectionV1: PluginV1 = async (_ctx) => {
    try {
        runStartupPipeline();
    } catch (error) {
        process.stderr.write(`[opencode-skills-collection] ${error}\n`);
    }

    return {};
};

export default {
    ...Plugin.define({
        id: "opencode-skills-collection",
        async setup(_ctx) {
            try {
                runStartupPipeline();
            } catch (error) {
                process.stderr.write(`[opencode-skills-collection] ${error}\n`);
            }
        },
    }),
    async server(ctx: PluginInput) {
        return OpenCodeSkillsCollectionV1(ctx);
    },
};
