<!-- GitAds-Verify: UJY7GLBGO5NXKQAS89X9E6DFWFIHOM1Q -->
<div align="center">

<img src="docs/assets/logo.svg" alt="OpenCode Skills Collection"/>

<br/>
<br/>
<br/>

[![npm version](https://img.shields.io/npm/v/opencode-skills-collection?style=for-the-badge&color=cb3837&label=npm)](https://www.npmjs.com/package/opencode-skills-collection)
[![npm downloads](https://img.shields.io/npm/dm/opencode-skills-collection?style=for-the-badge&color=orange)](https://www.npmjs.com/package/opencode-skills-collection)
[![license](https://img.shields.io/github/license/FrancoStino/opencode-skills-collection?style=for-the-badge&color=blue)](./LICENSE)
[![zread](https://img.shields.io/badge/Documentation-_.svg?style=for-the-badge&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/FrancoStino/opencode-skills-collection)
</div>

# OpenCode Skills Collection

> An [OpenCode](https://opencode.ai/) plugin that bundles and auto-syncs a universal collection of AI skills —
> delivered instantly, with zero network latency at startup.

---

## Overview

**OpenCode Skills Collection** ships a pre-bundled snapshot of 1595+ universal skills for the OpenCode.

Instead of loading every skill into the AI context at startup — which would consume ~80k tokens and cause compaction
loops — the plugin uses a **SkillPointer** architecture: skills are organized into categories inside a hidden vault and
only loaded into context on demand.

---

## How It Works

The plugin operates in two phases:

**1. Local deployment (startup)**

When OpenCode starts, the plugin copies the pre-bundled skills from the npm package and runs the SkillPointer pipeline:

```
bundled-skills/ (npm package)
        │
        ▼
~/.config/opencode/skills/          ← OpenCode reads this
        │
        └── SkillPointer pipeline
              │
              ├─ risk-filter       → excludes skills by risk level or ID
              ├─ content-scanner   → quarantines skills with dangerous patterns
              ├─ vault-manager     → moves safe skills to the vault
              ├─ skill-patcher     → applies config-driven content patches
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
├── skill-filter.jsonc                ← optional: risk filter + patcher config
├── skills/                           ← pointer folders (active, read by OpenCode)
│   ├── backend-dev-category-pointer/
│   │   └── SKILL.md
│   └── ...
└── skill-libraries/                  ← vault with all raw skills
    ├── backend-dev/
    │   ├── laravel-expert/
    │   │   └── SKILL.md
    │   └── ...
    └── ...
```

---

## Context Usage

|                      | Without SkillPointer | With SkillPointer   |
|----------------------|----------------------|---------------------|
| Folders in `skills/` | ~1000                | ~35                 |
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

## Skill Safety & Filtering

The plugin supports configurable risk-based filtering of skills. By default, **all skills are loaded** — filtering is
opt-in.

Each skill in the index has a `risk` field with one of these levels:

| Level       | Description                                                        |
|-------------|--------------------------------------------------------------------|
| `none`      | No risk assessment                                                 |
| `safe`      | Verified safe                                                      |
| `critical`  | Contains sensitive operations                                      |
| `offensive` | Contains offensive security tools (exploits, reverse shells, etc.) |
| `unknown`   | Not yet classified                                                 |

### Configuration

Create a `~/.config/opencode/skill-filter.jsonc` file:

```jsonc
{
  "excludedRiskLevels": ["offensive"],
  "excludedSkills": ["windows-privilege-escalation"]
}
```

- **`excludedRiskLevels`**: Array of risk levels to block entirely
- **`excludedSkills`**: Array of specific skill IDs to block

Blocked skills are excluded from both the vault and the generated pointers — they are never loaded into context.

### Content Safety Scanner (CI)

Dangerous skills are automatically detected and removed **at build time** — before the npm package is published.
The nightly sync workflow scans every SKILL.md for recursive loop patterns and strips matching skills from
`bundled-skills/` and `skills_index.json`, so they never reach end users.

**Built-in patterns detect:**
- Recursive skill invocation loops ("invoke skills before any response")
- Aggressive match thresholds ("even a 1% chance")
- Mandatory pre-response skill checks ("you must invoke the skill")

### Skill Patcher

The plugin can modify skill content after installation via config-driven patches. This allows neutralizing
problematic instructions without forking upstream skills.

Add patches in `skill-filter.jsonc`:

```jsonc
{
  "skillPatches": [
    {
      "skillId": "some-skill-name",
      "find": "regex-pattern-to-match",
      "replace": "replacement-text",
      "description": "Why this patch exists"
    }
  ]
}
```

Patches are applied in order, case-insensitive, and globally (all occurrences). Invalid regex patterns are
skipped silently. Re-running the pipeline with the same patches is idempotent.

---

## Development

**Requirements:** Bun ≥ 1.3

```bash
# Install dependencies
bun install

# Build
bun run build

# Test
bun test

# Output is in dist/
```

The plugin is written in TypeScript and compiled to ESNext with full type declarations. It targets ES2022 and uses ESM
module resolution.

---

## Contributing

Issues and pull requests are welcome
at [github.com/FrancoStino/opencode-skills-collection](https://github.com/FrancoStino/opencode-skills-collection/issues).

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

## GitAds Sponsored
[![Sponsored by GitAds](https://gitads.dev/v1/ad-serve?source=francostino/opencode-skills-collection@github)](https://gitads.dev/v1/ad-track?source=francostino/opencode-skills-collection@github)

## Star History

<a href="https://www.star-history.com/?repos=FrancoStino%2Fopencode-skills-collection&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=FrancoStino/opencode-skills-collection&type=date&theme=dark&legend=top-left&sealed_token=QyOR2eOD47MzxIAhnsjhkG1p25eQjMkEF7T6a0A6tDSVh3SQZUKZ7v5G-ZdgxEknAqANbBQ2qqK8EjY75dMWcY2Av-LYGeTE0SJjXUZC1UILMIzSWP2clQ" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=FrancoStino/opencode-skills-collection&type=date&legend=top-left&sealed_token=QyOR2eOD47MzxIAhnsjhkG1p25eQjMkEF7T6a0A6tDSVh3SQZUKZ7v5G-ZdgxEknAqANbBQ2qqK8EjY75dMWcY2Av-LYGeTE0SJjXUZC1UILMIzSWP2clQ" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=FrancoStino/opencode-skills-collection&type=date&legend=top-left&sealed_token=QyOR2eOD47MzxIAhnsjhkG1p25eQjMkEF7T6a0A6tDSVh3SQZUKZ7v5G-ZdgxEknAqANbBQ2qqK8EjY75dMWcY2Av-LYGeTE0SJjXUZC1UILMIzSWP2clQ" />
 </picture>
</a>
