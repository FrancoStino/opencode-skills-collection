import type { Plugin } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

const AntigravityAutoUpdater: Plugin = async ({ app }) => {
  // Run asynchronously in background to not block OpenCode startup
  setTimeout(async () => {
    try {
      // Target path: ~/.config/opencode/skills
      // antigravity-awesome-skills will create its own subfolder inside
      const skillsDir = path.join(os.homedir(), ".config", "opencode", "skills");

      console.log("🔄 [Antigravity Plugin] Syncing Awesome Skills...");

      // Use the official npx command as recommended by the Antigravity repo
      const { stdout, stderr } = await execAsync(
        `npx antigravity-awesome-skills --path "${skillsDir}"`
      );

      if (stdout) console.log("✅ [Antigravity Plugin]", stdout.trim());
      if (stderr) console.error("⚠️  [Antigravity Plugin]", stderr.trim());

    } catch (error: any) {
      console.error("⚠️  [Antigravity Plugin] Could not sync skills (offline?):", error.message);
    }
  }, 0);

  return {
    event: async ({ event }) => {
      // Reserved for future hooks
    }
  };
};

export default AntigravityAutoUpdater;
