# Codebase Structure

## Directory Layout

```
opencode-skills-collection/
├── src/                              # TypeScript source — plugin + skill-pointer pipeline
│   ├── index.ts                      # Plugin entry point (default export)
│   ├── constants/
│   │   └── constants.ts              # Shared string constants (POINTER_SUFFIX, SKILL_FILENAME, etc.)
│   ├── skill-pointer/
│   │   ├── index.ts                  # Pipeline orchestrator (runSkillPointer)
│   │   ├── vault-installer.ts        # Load skill index, sync folders into vault
│   │   ├── pointer-generator.ts      # Write category pointer SKILL.md files
│   │   ├── skill-risk-filter.ts      # Risk-based skill filtering
│   │   ├── config-loader.ts          # Load skill-filter.jsonc (JSONC config)
│   │   ├── content-scanner.ts        # Dangerous pattern detection (CI-time)
│   │   ├── skill-patcher.ts          # Regex find/replace patches on installed skills
│   │   └── risk-level.ts             # RiskLevel union type
│   ├── utils/
│   │   └── fs.utils.ts              # ensureDir, listSubdirectories helpers
│   └── __tests__/                    # Bun test suite (excluded from tsconfig compilation)
│       ├── constants.test.ts
│       ├── content-scanner.test.ts
│       ├── pointer-generator.test.ts
│       ├── skill-patcher.test.ts
│       ├── skill-risk-filter.test.ts
│       ├── vault-installer.test.ts
│       └── test-helpers.ts           # Shared test utilities
├── bundled-skills/                   # Pre-built skill folders (synced nightly from upstream)
├── skills_index.json                 # Pre-built skill index JSON (synced nightly from upstream)
├── scripts/
│   └── ci-scan-skills.mjs           # CI script: scans and quarantines dangerous skills before publish
├── dist/                             # Compiled output (tsc, .gitignored)
├── docs/
│   └── assets/                       # Documentation assets
├── .github/
│   └── workflows/
│       ├── sync-skills.yml           # Nightly sync from upstream + release
│       ├── publish.yml               # npm publish after sync/release
│       ├── beta-release.yml          # Manual beta publish from develop
│       ├── release.yml               # Manual version bump + GitHub release
│       └── merge-branch.yml          # Merge develop → main
├── package.json                      # npm package config (@opencode-ai/plugin, strip-json-comments)
├── tsconfig.json                     # TypeScript config (ES2022, ESNext modules, bundler resolution)
├── AGENTS.md                         # AI agent instructions for this repo
├── README.md                         # Project documentation
├── SECURITY.md                       # Security policy
├── CHANGELOG.md                      # Release changelog
├── BETA_CHANGELOG.md                 # Beta changelog
├── CODEOWNERS                        # GitHub code ownership
└── LICENSE                           # MIT license
```

## Directory Purposes

**`src/`:**
- Purpose: All TypeScript source code for the plugin
- Contains: Plugin entry, skill-pointer pipeline modules, constants, utilities
- Key files: `index.ts` (plugin entry), `skill-pointer/index.ts` (orchestrator)

**`src/skill-pointer/`:**
- Purpose: Core pipeline — the SkillPointer architecture that loads, filters, installs, patches, and generates pointers for skills
- Contains: 8 TypeScript modules covering every pipeline stage
- Key files: `vault-installer.ts` (index loading + vault sync), `pointer-generator.ts` (pointer file creation), `config-loader.ts` (user config parsing), `content-scanner.ts` (CI safety scanning), `skill-patcher.ts` (runtime content patches)

**`src/constants/`:**
- Purpose: Shared string constants referenced across modules
- Contains: Single file with 4 exported constants
- Key files: `constants.ts`

**`src/utils/`:**
- Purpose: Generic filesystem helpers
- Contains: `ensureDir()` for recursive directory creation, `listSubdirectories()` for directory enumeration
- Key files: `fs.utils.ts`

**`src/__tests__/`:**
- Purpose: Bun-based test suite covering pipeline modules
- Contains: 6 test files + 1 test helper, excluded from TypeScript compilation
- Key files: `test-helpers.ts`, one `*.test.ts` per major module

**`bundled-skills/`:**
- Purpose: Pre-packaged skill folders synced nightly from `sickn33/antigravity-awesome-skills`
- Contains: Subdirectories per skill, each with a `SKILL.md` and optional assets
- Key files: `skills_index.json` (at project root, not inside this dir)

**`scripts/`:**
- Purpose: CI automation scripts
- Contains: Content scanner invoked before npm publish
- Key files: `ci-scan-skills.mjs`

**`.github/workflows/`:**
- Purpose: GitHub Actions CI/CD pipelines
- Contains: 5 workflow files for sync, publish, release, beta, and branch merge
- Key files: `sync-skills.yml` (nightly + manual), `publish.yml`

## Key File Locations

**Entry Points:** `src/index.ts`: Plugin default export — invoked by OpenCode runtime at startup
**Entry Points:** `scripts/ci-scan-skills.mjs`: CI entry — runs content scanning and quarantine before publish
**Configuration:** `package.json`: npm package metadata, dependencies, build/test scripts
**Configuration:** `tsconfig.json`: TypeScript compiler options (ES2022 target, ESNext modules, bundler resolution)
**Configuration:** `~/.config/opencode/skill-filter.jsonc`: User-facing runtime config for risk filtering and content patches (not in repo)
**Core Logic:** `src/skill-pointer/index.ts`: Pipeline orchestrator — sequences all stages
**Core Logic:** `src/skill-pointer/vault-installer.ts`: Index loading and vault synchronization
**Core Logic:** `src/skill-pointer/pointer-generator.ts`: Pointer file generation with Markdown templates
**Core Logic:** `src/skill-pointer/config-loader.ts`: JSONC config parsing with validation
**Core Logic:** `src/skill-pointer/content-scanner.ts`: Regex-based dangerous pattern detection
**Core Logic:** `src/skill-pointer/skill-patcher.ts`: Regex find/replace content patching
**Tests:** `src/__tests__/`: Bun test suite (run via `bun test`)
**Generated:** `bundled-skills/`: Synced nightly — never edit directly
**Generated:** `skills_index.json`: Synced nightly — never edit directly
**Generated:** `dist/`: TypeScript compilation output — `.gitignored`

## Naming Conventions

**Files:** kebab-case for all source files (e.g., `vault-installer.ts`, `skill-risk-filter.ts`, `pointer-generator.ts`, `content-scanner.ts`)
**Directories:** kebab-case (e.g., `skill-pointer/`, `constants/`, `utils/`)
**Types:** PascalCase interfaces and type aliases (e.g., `SkillIndexEntry`, `RiskLevel`, `SkillPointerOptions`, `ScanPattern`)
**Functions:** camelCase (e.g., `runSkillPointer`, `loadSkillsIndex`, `installSkillsToVault`, `generatePointers`, `applySkillPatches`)
**Constants:** UPPER_SNAKE_CASE (e.g., `POINTER_SUFFIX`, `SKILL_FILENAME`, `VAULT_DIR_NAME`, `UNCATEGORIZED_CATEGORY`)
**Test files:** `*.test.ts` co-located in `src/__tests__/`
**Skill folders:** kebab-case (e.g., `laravel-expert`, `wordpress-core`, `php-pro`)

## Where to Add New Code

**New pipeline stage:** `src/skill-pointer/[stage-name].ts` — export a function, call it from `src/skill-pointer/index.ts` in the pipeline sequence
**New constant:** `src/constants/constants.ts` — add an exported `const` with UPPER_SNAKE_CASE name
**New utility:** `src/utils/[utility-name].ts` — keep functions generic and filesystem-related
**New config field:** Add interface property to `SkillRiskFilterConfig` in `src/skill-pointer/config-loader.ts`, add parsing + validation in `loadFilterConfig()`
**New scan pattern:** Add to `DEFAULT_SCAN_PATTERNS` array in `src/skill-pointer/content-scanner.ts`
**New risk level:** Extend the `RiskLevel` union type in `src/skill-pointer/risk-level.ts`, add to `VALID_RISK_LEVELS` in `config-loader.ts`
**New CI workflow:** `.github/workflows/[workflow-name].yml`
**New test:** `src/__tests__/[module-name].test.ts` — use Bun test runner, import from compiled `dist/` or source directly
**New pointer format:** Modify `buildPointerContent()` in `src/skill-pointer/pointer-generator.ts`
