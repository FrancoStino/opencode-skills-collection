# opencode-skills-antigravity

An [OpenCode CLI](https://opencode.ai/) plugin that bundles and manages the [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) repository for instant use.

## ✨ How it works

This plugin ensures you always have the latest skills without any network latency at startup.

- **Automated Updates:** A GitHub Action checks for updates in the [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) repository every hour. If new skills are found, it automatically bundles them and publishes a new version of the NPM package.
- **Instant Deployment:** When you start OpenCode, the plugin instantly copies the pre-bundled skills to your local machine. This process works perfectly offline and ensures zero network latency during startup.

OpenCode automatically detects all skills and makes them available to the AI agent.

You can then invoke any skill explicitly in your prompt:

```bash
opencode run /brainstorming help me plan a feature
```

Skills are also available as `/` commands directly in the OpenCode chat (e.g., `/brainstorming`).

Or simply describe what you want and OpenCode will pick the right skill automatically.

## 🚀 Installation

### Add the plugin to your global OpenCode config

Edit (or create) `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "opencode-skills-antigravity"
  ]
}
```

OpenCode will automatically download the npm package on next startup via Bun. No manual `npm install` required.

## 📁 Skills location

Skills are stored at:

```
~/.config/opencode/skills/
```

OpenCode scans this directory automatically at startup.


## 📄 License

MIT © [Davide Ladisa](https://www.davideladisa.it/)
