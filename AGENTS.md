# AGENTS.md

## What this is

OpenCode plugin (npm: `opencode-skills-collection`) that bundles 1400+ AI skills and deploys them via a SkillPointer architecture to avoid token bloat at startup.

## ⚠️ Generated files — never edit directly

`bundled-skills/` and `skills_index.json` are **destroyed and regenerated nightly** by `.github/workflows/sync-skills.yml` from upstream repo `sickn33/agentic-awesome-skills`.

- The workflow runs `rm -rf bundled-skills` then re-downloads everything
- `skills_index.json` is overwritten from upstream's `main` branch
- Any local changes to these paths **will be lost**

**To add or modify skills:** submit a PR to [`sickn33/agentic-awesome-skills`](https://github.com/sickn33/agentic-awesome-skills). After merge, the nightly sync brings changes here automatically.

**To add skills from external sources:** clone the source repo, copy files programmatically with a script. Never write SKILL.md content by hand.

## Commands

```bash
npm install          # install deps
npm run build        # tsc → dist/
npm test             # bun test (src/__tests__/)
```

Tests use Bun's test runner, not Jest/Vitest. Tests are in `src/__tests__/` and excluded from `tsconfig.json` compilation.

## Source structure

```
src/
├── index.ts                          # Plugin entry — resolves paths, calls runSkillPointer()
├── constants/constants.ts            # POINTER_SUFFIX, SKILL_FILENAME, VAULT_DIR_NAME
├── utils/fs.utils.ts                 # ensureDir helper
└── skill-pointer/
    ├── index.ts                      # Orchestrator: loadIndex → filter → installVault → generatePointers
    ├── vault-installer.ts            # Reads skills_index.json, copies skills into vault by category
    ├── pointer-generator.ts          # Writes lightweight SKILL.md pointers per category
    ├── skill-risk-filter.ts          # shouldLoad() / filterIndex() — risk-based filtering
    ├── config-loader.ts              # Loads skill-filter.jsonc config
    └── risk-level.ts                 # RiskLevel type: 'none' | 'safe' | 'critical' | 'offensive' | 'unknown'
```

### Pipeline flow (runtime)

`loadSkillsIndex()` → `loadFilterConfig()` → `filterIndex()` → `installSkillsToVault()` → `generatePointers()`

All steps are synchronous. The plugin runs once at OpenCode startup.

### Key paths at runtime

| Path | Purpose |
|---|---|
| `~/.config/opencode/skills/` | Active pointer files (OpenCode reads these) |
| `~/.config/opencode/skill-libraries/` | Vault with full skill content, organized by category |
| `~/.config/opencode/skill-filter.jsonc` | Optional risk filter config |

## CI/CD workflows

| Workflow | Trigger | Effect |
|---|---|---|
| `sync-skills.yml` | Nightly cron + manual | Wipes `bundled-skills/`, re-syncs from upstream, bumps patch version, creates release |
| `publish.yml` | After sync or release workflow succeeds | Publishes to npm (`@latest`) |
| `beta-release.yml` | Manual dispatch on `develop` only | Bumps beta version, publishes to npm (`@beta`) |
| `release.yml` | Manual dispatch (`patch`/`minor`/`major`/`current`) | Bumps version (`patch`/`minor`/`major`) or releases current version, then creates GitHub release |
| `merge-branch.yml` | Manual dispatch | Merges `develop` → `main` |

## Branching

- `main`: stable releases, auto-synced nightly
- `develop`: beta/experimental work, manual beta releases only
