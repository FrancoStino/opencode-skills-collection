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

> An [OpenCode CLI](https://opencode.ai/) plugin that bundles and auto-syncs a universal collection of AI skills — delivered instantly, with zero network latency at startup.

> ⚠️ **Previously published as [`opencode-skills-antigravity`](https://www.npmjs.com/package/opencode-skills-antigravity)** — that package is now deprecated and points to this one.

---

## Overview

**OpenCode Skills Collection** ships a pre-bundled snapshot of 800+ universal skills for the OpenCode CLI.

Instead of loading every skill into the AI context at startup — which would consume ~80k tokens and cause compaction loops — the plugin uses a **SkillPointer** architecture: skills are organised into categories inside a hidden vault and only loaded into context on demand.

---

## How It Works

The plugin operates in three phases:

**1. Automated upstream sync (CI)**

A GitHub Actions workflow runs every hour, checking the upstream skills repository for changes. When new or updated skills are detected, the workflow:

- Re-bundles the skill files into `bundled-skills/`
- Bumps the package version (`patch`)
- Creates a tagged GitHub Release
- Publishes the new version to npm

**2. Local deployment (startup)**

When OpenCode starts, the plugin copies the pre-bundled skills from the npm package and runs the **SkillPointer pipeline**:

```
bundled-skills/ (npm package)
        │
        ▼
~/.config/opencode/skills/          ← OpenCode reads this
        │
        └── SkillPointer pipeline
              │
              ├─ vault-manager     → moves 800+ raw skills to the vault
              └─ pointer-generator → writes ~35 lightweight pointer files
```

**3. On-demand skill loading**

Each pointer file tells the AI: *"there are N skills for this category in the vault — use `list_dir` / `view_file` to retrieve them when needed."*
The full skill content is only injected into context when the AI actually needs it.

---

## Disk Layout

After the first startup, your `~/.config/opencode/` directory looks like this:

```
~/.config/opencode/
├── opencode.json
├── skills/                          ← ~35 pointer folders (active, read by OpenCode)
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

| | Without SkillPointer | With SkillPointer |
|---|---|---|
| Folders in `skills/` | ~800 | ~35 |
| Tokens at startup | ~80,000 | ~255 |
| Skills available | All injected upfront | On-demand via vault |
| Compaction loops | ✗ frequent | ✓ none |

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

That's it. OpenCode will automatically download the npm package on next startup via Bun — no manual `npm install` needed.

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

## Project Structure

```
opencode-skills-collection/
├── src/
│   ├── constants/
│   │   └── heuristics.ts          # DOMAIN_HEURISTICS map + shared constants
│   ├── utils/
│   │   └── fs.utils.ts            # Filesystem utilities (countSkillFiles, moveDir…)
│   ├── skill-pointer/
│   │   ├── categorizer.ts         # Skill categorisation logic
│   │   ├── vault-manager.ts       # Migrates raw skills into the vault
│   │   ├── pointer-generator.ts   # Generates lightweight pointer SKILL.md files
│   │   └── index.ts               # runSkillPointer() orchestrator
│   └── index.ts                   # Plugin entry point
├── bundled-skills/                # Pre-bundled skills snapshot (auto-updated by CI)
├── dist/                          # Compiled TypeScript output
├── .github/
│   └── workflows/
│       ├── sync-skills.yml        # Hourly skill sync + auto-publish
│       ├── release.yml            # Manual version bump + GitHub Release
│       ├── publish.yml            # npm publish on new release
│       └── merge-branch.yml      # Keeps develop in sync with main
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
    "opencode-skills-collection@latest"
  ]
}
```

The old `opencode-skills-antigravity` package on npm is deprecated and re-exports this one automatically.

---

## Contributing

Issues and pull requests are welcome at [github.com/FrancoStino/opencode-skills-collection](https://github.com/FrancoStino/opencode-skills-collection/issues).

If you'd like to contribute new skills to the collection, open a PR adding a new folder inside `bundled-skills/` — it will be automatically picked up on next sync.

---

## License

MIT © [Davide Ladisa](https://www.davideladisa.it/)
