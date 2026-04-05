import type { Plugin } from "@opencode-ai/plugin";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const OpenCodeSkillsCollection: Plugin = async (_ctx) => {
  try {
    // Resolve absolute path to the bundled-skills directory relative to this file
    // Works regardless of where OpenCode is launched from
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const bundledSkillsPath = path.join(__dirname, "..", "bundled-skills");

    // Resolve target path in OpenCode's config directory
    const skillsPath = path.join(os.homedir(), ".config", "opencode", "skills");

    fs.mkdirSync(skillsPath, { recursive: true });

    // Iterate each entry in bundled-skills and copy only valid skill folders
    // (those containing a SKILL.md), skipping files and hidden entries like
    // .antigravity-install-manifest.json which would cause OpenCode to
    // group everything under _uncategorized
    const entries = fs.readdirSync(bundledSkillsPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith(".")) continue;

      const src = path.join(bundledSkillsPath, entry.name);
      const skillMd = path.join(src, "SKILL.md");

      // Only copy folders that contain a valid SKILL.md
      if (!fs.existsSync(skillMd)) continue;

      const dest = path.join(skillsPath, entry.name);
      fs.cpSync(src, dest, { recursive: true, force: true });
    }
  } catch (error: unknown) {
    setTimeout(async () => {
      try {
        const { exec } = await import("child_process");
        const util = await import("util");
        const execAsync = util.promisify(exec);
        const fallbackPath = path.join(os.homedir(), ".config", "opencode", "skills");
        await execAsync(`npx --yes antigravity-awesome-skills --path "${fallbackPath}"`);
      } catch (e) {
        // silently fail completely
      }
    }, 0);
  }

  return {};
};

export default OpenCodeSkillsCollection;
