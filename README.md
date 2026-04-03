<div align="center">

<img src="./docs/logo.svg" alt="OpenCode Skills Collection"/>

<br/>
<br/>
<br/>

[![npm version](https://img.shields.io/npm/v/opencode-skills-collection?style=for-the-badge&color=cb3837&label=npm)](https://www.npmjs.com/package/opencode-skills-collection)
[![npm downloads](https://img.shields.io/npm/dm/opencode-skills-collection?style=for-the-badge&color=orange)](https://www.npmjs.com/package/opencode-skills-collection)
[![license](https://img.shields.io/github/license/FrancoStino/opencode-skills-collection?style=for-the-badge&color=blue)](./LICENSE)

</div>

# OpenCode Skills Collection

> An [OpenCode CLI](https://opencode.ai/) plugin that bundles and auto-syncs the [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) collection — delivered instantly, with zero network latency at startup.

> ⚠️ **Previously published as [`opencode-skills-antigravity`](https://www.npmjs.com/package/opencode-skills-antigravity)** — that package is now deprecated and points to this one.

---

## Overview

**OpenCode Skills Collection** bridges the OpenCode CLI with the Antigravity Awesome Skills repository. Instead of fetching skills on every startup, this plugin ships with a pre-bundled snapshot that gets copied directly to your local machine the moment OpenCode launches.

The result: skills are always fresh (synced hourly via GitHub Actions), always available (even offline), and always instant.

---

## How It Works

The plugin operates in two phases:

**1. Automated upstream sync (CI)**

A GitHub Actions workflow runs every hour, checking the [Antigravity Awesome Skills](https://github.com/sickn33/antigravity-awesome-skills) repository for changes. When new or updated skills are detected, the workflow:

- Re-bundles the skill files into `bundled-skills/`
- Bumps the package version (`patch`)
- Creates a tagged GitHub Release
- Publishes the new version to npm

**2. Local deployment (startup)**

When OpenCode starts, the plugin runs and copies the pre-bundled skills from the npm package to:

```
~/.config/opencode/skills/
```

No network calls, no latency, no failures. If the copy somehow fails, a silent fallback attempts to fetch via `npx antigravity-awesome-skills` in the background.

---

## Installation

Add the plugin to your global OpenCode configuration file at `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "opencode-skills-collection"
  ]
}
```

That's it. OpenCode will automatically download the npm package on next startup via Bun — no manual `npm install` needed.

---

## Usage

Once installed, all bundled skills are available in three ways:

**Explicit invocation via CLI:**
```bash
opencode run /brainstorming help me plan a new feature
opencode run /refactor clean up this function
```

**Slash commands in the OpenCode chat:**
```
/brainstorming
/refactor
/document
```

**Natural language — OpenCode picks the right skill automatically:**
```
"Help me brainstorm ideas for a REST API design"
"Refactor this function to be more readable"
```

---

## Project Structure

```
opencode-skills-collection/
├── src/
│   └── index.ts          # Plugin entry point — copies bundled skills on startup
├── bundled-skills/        # Pre-bundled skills snapshot (auto-updated by CI)
├── dist/                  # Compiled TypeScript output
├── .github/
│   └── workflows/
│       ├── sync-skills.yml   # Hourly skill sync + auto-publish
│       ├── release.yml       # Manual version bump + GitHub Release
│       ├── publish.yml       # npm publish on new release
│       └── merge-branch.yml  # Keeps develop in sync with main
├── package.json
└── tsconfig.json
```

---

## Development

**Requirements:** Node.js ≥ 20, TypeScript ≥ 5

```bash
# Install dependencies
npm install

# Build
npm run build

# Output is in dist/
```

The plugin is written in TypeScript and compiled to ESNext with full type declarations. It targets ES2022 and uses ESM module resolution.

---

## Migration from `opencode-skills-antigravity`

If you were using the old package, simply update your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "opencode-skills-collection"
  ]
}
```

The old `opencode-skills-antigravity` package on npm is deprecated and re-exports this one automatically.

---

## Contributing

Issues and pull requests are welcome at [github.com/FrancoStino/opencode-skills-collection](https://github.com/FrancoStino/opencode-skills-collection/issues).

If you'd like to contribute new skills to the upstream collection, head over to [antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills) — they'll be automatically picked up and bundled here within the hour.

---

## License

MIT © [Davide Ladisa](https://www.davideladisa.it/)
