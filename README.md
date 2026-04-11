<div align="center">

<img src="./docs/logo.svg" alt="OpenCode Skills Collection"/>

<br/>
<br/>
<br/>

[![npm version](https://img.shields.io/npm/v/opencode-skills-collection?style=for-the-badge&color=cb3837&label=npm)](https://www.npmjs.com/package/opencode-skills-collection)
[![npm downloads](https://img.shields.io/npm/dm/opencode-skills-collection?style=for-the-badge&color=orange)](https://www.npmjs.com/package/opencode-skills-collection)
[![license](https://img.shields.io/github/license/FrancoStino/opencode-skills-collection?style=for-the-badge&color=blue)](./LICENSE)
[![wiki](https://img.shields.io/badge/wiki-available-black?style=for-the-badge)](https://www.cubic.dev/wikis/FrancoStino/opencode-skills-collection?page=home)

</div>

# OpenCode Skills Collection

> An [OpenCode CLI](https://opencode.ai/) plugin that bundles and auto-syncs a universal collection of AI skills —
> delivered instantly, with zero network latency at startup.

> ⚠️ **Previously published
> as [`opencode-skills-antigravity`](https://www.npmjs.com/package/opencode-skills-antigravity)** — that package is now
> deprecated and points to this one.

---

## Overview

**OpenCode Skills Collection** ships a pre-bundled snapshot of 1000+ universal skills for the OpenCode CLI.

Instead of loading every skill into the AI context at startup — which would consume ~80k tokens and cause compaction
loops — the plugin uses a **SkillPointer** architecture: skills are organized into categories inside a hidden vault and
only loaded into context on demand.

---

## How It Works

The plugin operates in two phases:

**1. Local deployment (startup)**

When OpenCode starts, the plugin copies the pre-bundled skills from the npm package and runs the **SkillPointer pipeline
**:

```
bundled-skills/ (npm package)
        │
        ▼
~/.config/opencode/skills/          ← OpenCode reads this
        │
        └── SkillPointer pipeline
              │
              ├─ vault-manager     → moves raw skills to the vault
              └─ pointer-generator → writes ~35 lightweight pointer files
```

**2. On-demand skill loading**

Each pointer file tells the AI: *"there are N skills for this category in the vault — use `list_dir` / `view_file` to
retrieve them when needed."*
The full skill content is only injected into context when the AI actually needs it.

---

## Disk Layout

After the first startup, your `~/.config/opencode/` directory looks like this:

```
~/.config/opencode/
├── opencode.json
├── skills/                          ← pointer folders (active, read by OpenCode)
│   ├── backend-dev-category-pointer/
│   │   └── SKILL.md
│   ├── devops-category-pointer/
│   │   └── SKILL.md
│   └── ...
└── skill-libraries/                 ← vault with all raw skills (hidden from startup context)
    ├── backend-dev/
    │   ├── laravel-expert/
    │   │   └── SKILL.md
    │   └── wordpress-core/
    │       └── SKILL.md
    ├── devops/
    └── ...
```

---

## Context Usage

|                      | Without SkillPointer | With SkillPointer   |
|----------------------|----------------------|---------------------|
| Folders in `skills/` | ~1000                 | ~35                 |
| Tokens at startup    | ~80,000              | ~255                |
| Skills available     | All injected upfront | On-demand via vault |
| Compaction loops     | ✗ frequent           | ✓ none              |

---

## Installation

Add the plugin to your global OpenCode configuration file at `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "opencode-skills-collection@latest"
  ]
}
```

That's it. OpenCode will automatically download the npm package on next startup via Bun — no manual `npm install`
needed.

---

## Usage

Once installed, all skills are available in three ways:

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

## Development

**Requirements:** Node.js ≥ 20, TypeScript ≥ 5

```bash
# Install dependencies
npm install

# Build
npm run build

# Output is in dist/
```

The plugin is written in TypeScript and compiled to ESNext with full type declarations. It targets ES2022 and uses ESM
module resolution.

---

## Migration from `opencode-skills-antigravity`

If you were using the old package, simply update your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "opencode-skills-collection@latest"
  ]
}
```

The old `opencode-skills-antigravity` package on npm is deprecated and re-exports this one automatically.

---

## Contributing

Issues and pull requests are welcome
at [github.com/FrancoStino/opencode-skills-collection](https://github.com/FrancoStino/opencode-skills-collection/issues).

If you'd like to contribute new skills to the collection, open a PR adding a new folder inside `bundled-skills/` — it
will be automatically picked up on next sync.

---

## Beta Releases

Beta versions are published from the `develop` branch for testing before official releases.

### Installing Beta Versions

To use the latest beta version, update your `~/.config/opencode/opencode.json`:

```json
{
  "plugin": [
    "opencode-skills-collection@beta"
  ]
}
```

## License

[MIT ©](./LICENSE) 
