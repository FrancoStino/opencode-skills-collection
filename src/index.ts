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

    // Create destination directory and copy files
    fs.mkdirSync(skillsPath, { recursive: true });
    fs.cpSync(bundledSkillsPath, skillsPath, { recursive: true, force: true });
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
