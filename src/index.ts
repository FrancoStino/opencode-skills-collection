import type { Plugin } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import os from "os";

const execAsync = promisify(exec);

const AntigravityAutoUpdater: Plugin = async ({ app }) => {
  // Run asynchronously in background to not block OpenCode startup
  setTimeout(async () => {
    try {
      const configDir = path.join(os.homedir(), ".config", "opencode", "skills");
      const repoDir = path.join(configDir, "antigravity-awesome-skills");
      const repoUrl = "https://github.com/sickn33/antigravity-awesome-skills.git";

      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      if (!fs.existsSync(repoDir)) {
        console.log("⬇️  [Antigravity Plugin] Downloading Awesome Skills for the first time...");
        await execAsync(`git clone ${repoUrl} "${repoDir}"`);
        console.log("✅ [Antigravity Plugin] Awesome Skills loaded successfully!");
      } else {
        const { stdout } = await execAsync(`git -C "${repoDir}" pull origin main`);
        if (stdout.includes("Already up to date")) {
          console.log("✅ [Antigravity Plugin] Awesome Skills are already up to date.");
        } else {
          console.log("🔄 [Antigravity Plugin] Awesome Skills updated successfully!");
        }
      }
    } catch (error: any) {
      console.error("⚠️  [Antigravity Plugin] Could not update skills (offline?):", error.message);
    }
  }, 0);

  return {
    event: async ({ event }) => {
      // Reserved for future hooks
    }
  };
};

export default AntigravityAutoUpdater;
