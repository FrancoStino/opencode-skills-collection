import type { Plugin } from "@opencode-ai/plugin";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const AntigravityAutoUpdater: Plugin = async (_ctx) => {
  // Run asynchronously in background to not block OpenCode startup
  setTimeout(() => {
    try {
      console.log("🔄 [Antigravity Plugin] Syncing Awesome Skills...");

      // Resolve absolute path to the bundled-skills directory relative to this file
      // Works regardless of where OpenCode is launched from
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const bundledSkillsPath = path.join(__dirname, "..", "bundled-skills");

      // Resolve target path in OpenCode's config directory
      const skillsPath = path.join(os.homedir(), ".config", "opencode", ".agents", "skills");

      // Create destination directory and copy files
      fs.mkdirSync(skillsPath, { recursive: true });
      fs.cpSync(bundledSkillsPath, skillsPath, { recursive: true, force: true });

      console.log("✅ [Antigravity Plugin] Skills synced successfully.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("⚠️  [Antigravity Plugin] Could not sync skills:", message);
    }
  }, 0);

  return {};
};

export default AntigravityAutoUpdater;
