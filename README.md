# opencode-skills-antigravity

An [OpenCode CLI](https://opencode.ai/) plugin that automatically downloads and keeps the [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) repository up to date every time you start OpenCode.

## ✨ How it works

Every time OpenCode starts, this plugin runs silently in the background:

- **First run:** clones the full `antigravity-awesome-skills` repo into `~/.config/opencode/skills/antigravity-awesome-skills`
- **Subsequent runs:** runs `git pull origin main` to silently fetch any new skills
- **Offline:** if no network is available, a warning is shown and OpenCode continues normally

OpenCode will then automatically detect all skills inside that folder and make them available to the AI agent.

You can then invoke any skill explicitly in your prompt:

```bash
opencode run @brainstorming help me plan a feature
```

Or simply describe what you want and OpenCode will pick the right skill automatically.

## 🚀 Installation

### 1. Add the plugin to your global OpenCode config

Edit (or create) `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "opencode-skills-antigravity"
  ]
}
```

OpenCode will automatically download the npm package on next startup via Bun. No manual `npm install` required.

### 2. Make sure `git` is installed

The plugin uses `git clone` and `git pull` under the hood. Verify with:

```bash
git --version
```

## 📁 Skills location

Skills are stored at:

```
~/.config/opencode/skills/
```

OpenCode scans this directory automatically at startup.


## 📄 License

MIT © [Davide Ladisa](https://www.davideladisa.it/)
