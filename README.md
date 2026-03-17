# opencode-skills-antigravity

An [OpenCode CLI](https://opencode.ai/) plugin that automatically downloads and keeps the [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) repository up to date every time you start OpenCode.

## ✨ How it works

Every time OpenCode starts, this plugin runs silently in the background:

- **First run:** clones the full `antigravity-awesome-skills` repo into `~/.config/opencode/skills/antigravity-awesome-skills`
- **Subsequent runs:** runs `git pull origin main` to silently fetch any new skills
- **Offline:** if no network is available, a warning is shown and OpenCode continues normally

OpenCode will then automatically detect all skills inside that folder and make them available to the AI agent.

## 🚀 Installation

### 1. Add the plugin to your global OpenCode config

Edit (or create) `~/.config/opencode/opencode.json`:

```json
{
  "plugins": {
    "opencode-skills-antigravity": {
      "enabled": true
    }
  }
}
```

OpenCode will automatically download the npm package on next startup. No manual `npm install` required.

### 2. Make sure `git` is installed

The plugin uses `git clone` and `git pull` under the hood. Verify with:

```bash
git --version
```

## 📁 Skills location

Skills are stored at:

```
~/.config/opencode/skills/antigravity-awesome-skills/
```

OpenCode scans this directory automatically at startup.

## 🛠️ Development

```bash
git clone https://github.com/FrancoStino/opencode-skills-antigravity.git
cd opencode-skills-antigravity
npm install
npm run build
```

## 📦 Publishing to npm

```bash
npm login
npm publish
```

## 📄 License

MIT © [Davide Ladisa](https://www.davideladisa.it/)
