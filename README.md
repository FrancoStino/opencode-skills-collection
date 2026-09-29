<!-- GitAds-Verify: UJY7GLBGO5NXKQAS89X9E6DFWFIHOM1Q -->
<div align="center">

<img src="docs/assets/logo.svg" alt="OpenCode Skills Collection"/>

<br/>
<br/>
<br/>

[![npm version](https://img.shields.io/npm/v/opencode-skills-collection?style=for-the-badge&color=cb3837&label=npm)](https://www.npmjs.com/package/opencode-skills-collection)
[![npm downloads](https://img.shields.io/npm/dm/opencode-skills-collection?style=for-the-badge&color=orange)](https://www.npmjs.com/package/opencode-skills-collection)
[![HOL Guard](https://img.shields.io/endpoint?url=https%3A%2F%2Fhol.org%2Fapi%2Fregistry%2Fbadges%2Fplugin%3Fslug%3Dfrancostino%252Fopencode-skills-collection%26metric%3Dtrust&style=for-the-badge)](https://hol.org/go/guard/rawsar?dest=%2Fguard%2Fbilling%3Fpromo%3DGUARD20-RAWSAR%23upgrade&link_id=02c248f9-50d5-4c60-abf0-ca80d2604a6b&utm_source=insights_share&utm_medium=affiliate_cta&utm_campaign=share20)
[![license](https://img.shields.io/github/license/FrancoStino/opencode-skills-collection?style=for-the-badge&color=blue)](./LICENSE)
[![zread](https://img.shields.io/badge/Documentation-_.svg?style=for-the-badge&color=00b0aa&labelColor=000000&logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTQuOTYxNTYgMS42MDAxSDIuMjQxNTZDMS44ODgxIDEuNjAwMSAxLjYwMTU2IDEuODg2NjQgMS42MDE1NiAyLjI0MDFWNC45NjAxQzEuNjAxNTYgNS4zMTM1NiAxLjg4ODEgNS42MDAxIDIuMjQxNTYgNS42MDAxSDQuOTYxNTZDNS4zMTUwMiA1LjYwMDEgNS42MDE1NiA1LjMxMzU2IDUuNjAxNTYgNC45NjAxVjIuMjQwMUM1LjYwMTU2IDEuODg2NjQgNS4zMTUwMiAxLjYwMDEgNC45NjE1NiAxLjYwMDFaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00Ljk2MTU2IDEwLjM5OTlIMi4yNDE1NkMxLjg4ODEgMTAuMzk5OSAxLjYwMTU2IDEwLjY4NjQgMS42MDE1NiAxMS4wMzk5VjEzLjc1OTlDMS42MDE1NiAxNC4xMTM0IDEuODg4MSAxNC4zOTk5IDIuMjQxNTYgMTQuMzk5OUg0Ljk2MTU2QzUuMzE1MDIgMTQuMzk5OSA1LjYwMTU2IDE0LjExMzQgNS42MDE1NiAxMy43NTk5VjExLjAzOTlDNS42MDE1NiAxMC42ODY0IDUuMzE1MDIgMTAuMzk5OSA0Ljk2MTU2IDEwLjM5OTlaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik0xMy43NTg0IDEuNjAwMUgxMS4wMzg0QzEwLjY4NSAxLjYwMDEgMTAuMzk4NCAxLjg4NjY0IDEwLjM5ODQgMi4yNDAxVjQuOTYwMUMxMC4zOTg0IDUuMzEzNTYgMTAuNjg1IDUuNjAwMSAxMS4wMzg0IDUuNjAwMUgxMy43NTg0QzE0LjExMTkgNS42MDAxIDE0LjM5ODQgNS4zMTM1NiAxNC4zOTg0IDQuOTYwMVYyLjI0MDFDMTQuMzk4NCAxLjg4NjY0IDE0LjExMTkgMS42MDAxIDEzLjc1ODQgMS42MDAxWiIgZmlsbD0iI2ZmZiIvPgo8cGF0aCBkPSJNNCAxMkwxMiA0TDQgMTJaIiBmaWxsPSIjZmZmIi8%2BCjxwYXRoIGQ9Ik00IDEyTDEyIDQiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4K&logoColor=ffffff)](https://zread.ai/FrancoStino/opencode-skills-collection)
</div>

# OpenCode Skills Collection

> An [OpenCode](https://opencode.ai/) plugin that bundles and auto-syncs a universal collection of AI skills —
> delivered instantly, with zero network latency at startup.

---

## Sponsor
[![Sponsored by GitAds](https://gitads.dev/v1/ad-serve?source=francostino/opencode-skills-collection@github)](https://gitads.dev/v1/ad-track?source=francostino/opencode-skills-collection@github)

---

## Overview

**OpenCode Skills Collection** ships a pre-bundled snapshot of 2400+ universal skills for OpenCode.

Instead of registering every skill with OpenCode at startup — which would flood the model's available-skills list with
thousands of entries — the plugin uses a **SkillPointer** architecture: skills are stored in a hidden vault organized by
category, and only ~100 lightweight pointer skills are registered. At each model step OpenCode advertises the pointers
(ID, name, description); the model loads a pointer via the `skill` tool, reads which vault skills match the task, then
loads the chosen vault `SKILL.md` via `read`.

---

## How It Works

The plugin operates in two phases:

**1. Local deployment (startup)**

When OpenCode starts, the plugin runs the SkillPointer pipeline synchronously before anything else. No hooks, tools,
or commands are registered — the only side effect is files on disk:

```
bundled-skills/ (npm package) + skills_index.json
        │
        ▼ runSkillPointer()
        ├─ filterIndex       → drops skills matching excluded risk levels / IDs
        ├─ installSkillsToVault → copies kept skills into the vault by category,
        │                        removes vault entries no longer in the filtered index
        ├─ applySkillPatches → regex find/replace from skill-filter.jsonc on vault copies
        └─ generatePointers  → writes one <category>-category-pointer/SKILL.md per
                               category into the active skills dir, removes stale pointers
        │
        ├── ~/.config/opencode/skill-libraries/<category>/<skill>/SKILL.md  (vault, NOT registered)
        └── ~/.config/opencode/skills/<category>-category-pointer/SKILL.md  (registered by OpenCode)
```

Content scanning is NOT a runtime stage: dangerous skills are quarantined at CI time (sync-skills.yml) and never
reach the npm package.

**2. On-demand skill loading (at inference time)**

1. OpenCode discovers pointer skills in `~/.config/opencode/skills/` and advertises ID + name + description to the
   model at each step (body stays out of context).
2. The model loads the matching pointer via the `skill` tool (`{"id": "<category>-category-pointer"}`); OpenCode
   injects the pointer body — the categorized skill list plus vault path.
3. The model reads the chosen vault file via `read` (`skill-libraries/<category>/<skill>/SKILL.md`) and follows it.

Vault skills are never registered with OpenCode directly, so they never appear in the advertised list.

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

|                              | Without SkillPointer | With SkillPointer     |
|------------------------------|----------------------|-----------------------|
| Entries in `skills/`         | ~2450                | ~100 pointers         |
| Skills advertised per step   | ~2450                | ~100                  |
| Full bodies in context       | On explicit load     | On explicit load      |
| Vault skills loaded          | n/a                  | Via `read` after pointer |

---

## Installation

Add the plugin to your global OpenCode configuration file at `~/.config/opencode/opencode.json`:

```jsonc
{
  // OpenCode V2
  "plugins": [
    "opencode-skills-collection@latest"
  ]
}
```

For OpenCode V1 (>= 1.18.29), use the `plugin` key instead (older V1 releases expect a function entrypoint and cannot load this version):

```jsonc
{
  // OpenCode V1
  "plugin": [
    "opencode-skills-collection@latest"
  ]
}
```

That's it. OpenCode will automatically download the npm package on next startup via Bun — no manual `npm install`
needed.

---

## Usage

The plugin registers pointer skills, not commands. There is no `/skill-name` slash command and no `opencode run /...`
syntax — slash commands live in `commands/`, this plugin only writes to `skills/`.

**How a skill gets used (V2 runtime):**

1. You describe the task in plain language (CLI `opencode run "..."`, TUI chat, or session).
2. OpenCode advertises the ~100 pointer skills (ID + description) to the model.
3. The model loads the matching `<category>-category-pointer` via the `skill` tool, picks the vault skill from its
   list, reads `skill-libraries/<category>/<skill>/SKILL.md` via `read`, and follows it.

```
"Help me design a REST API"  →  model loads backend-dev-category-pointer  →  reads laravel-expert/SKILL.md
```

Skills without a `description` are never advertised; skills can opt out of the advertised list with
`metadata.opencode/autoinvoke: false` but remain loadable by exact ID. The `skill` tool takes an exact,
case-sensitive ID.

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

```jsonc
{
  // OpenCode V2
  "plugins": [
    "opencode-skills-collection@beta"
  ]
}
```

For OpenCode V1 (>= 1.18.29):

```jsonc
{
  // OpenCode V1
  "plugin": [
    "opencode-skills-collection@beta"
  ]
}
```

## License

[MIT ©](./LICENSE)

## Star History

<a href="https://www.star-history.com/?repos=FrancoStino%2Fopencode-skills-collection&type=date&legend=top-left">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=FrancoStino/opencode-skills-collection&type=date&theme=dark&legend=top-left&sealed_token=QyOR2eOD47MzxIAhnsjhkG1p25eQjMkEF7T6a0A6tDSVh3SQZUKZ7v5G-ZdgxEknAqANbBQ2qqK8EjY75dMWcY2Av-LYGeTE0SJjXUZC1UILMIzSWP2clQ" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=FrancoStino/opencode-skills-collection&type=date&legend=top-left&sealed_token=QyOR2eOD47MzxIAhnsjhkG1p25eQjMkEF7T6a0A6tDSVh3SQZUKZ7v5G-ZdgxEknAqANbBQ2qqK8EjY75dMWcY2Av-LYGeTE0SJjXUZC1UILMIzSWP2clQ" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=FrancoStino/opencode-skills-collection&type=date&legend=top-left&sealed_token=QyOR2eOD47MzxIAhnsjhkG1p25eQjMkEF7T6a0A6tDSVh3SQZUKZ7v5G-ZdgxEknAqANbBQ2qqK8EjY75dMWcY2Av-LYGeTE0SJjXUZC1UILMIzSWP2clQ" />
 </picture>
</a>
