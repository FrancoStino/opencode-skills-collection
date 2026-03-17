import type { Plugin } from "@opencode-ai/plugin";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const AntigravityAutoUpdater: Plugin = async ({ app }) => {
  // Run asynchronously in background to not block OpenCode startup
  setTimeout(async () => {
    try {
      console.log("🔄 [Antigravity Plugin] Syncing Awesome Skills...");

      // Use the official OpenCode path as documented in antigravity-awesome-skills
      // The tool resolves .agents/skills relative to the OpenCode config directory
      const { stdout, stderr } = await execAsync(
        "npx antigravity-awesome-skills --path .agents/skills"
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
