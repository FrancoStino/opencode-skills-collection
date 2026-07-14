# Architecture

## Pattern Overview

**Overall:** Plugin-based SkillPointer pipeline — an OpenCode plugin that installs categorized AI skills from a bundled snapshot into a vault, then generates lightweight pointer files for runtime discovery.

**Key Characteristics:**
- Plugin lifecycle: runs once at OpenCode startup via `Plugin` hook interface
- Vault-based storage: full skill content lives in a hidden vault (`~/.config/opencode/skill-libraries/`) to avoid token bloat at startup
- Pointer indirection: OpenCode reads lightweight `SKILL.md` pointers in `~/.config/opencode/skills/`, each listing available skills and vault path — the agent loads full skill content on-demand via `view_file`
- Content safety: CI-time scanning with regex patterns quarantines dangerous skills before npm publish; runtime patching applies config-driven find/replace fixes
- Risk-based filtering: user-configurable `skill-filter.jsonc` excludes skills by risk level or ID

## Layers

**Plugin Entry:**
- Purpose: Bootstrap the SkillPointer pipeline, resolve paths, handle top-level errors
- Location: `src/index.ts`
- Contains: Path resolution (`resolveBundledSkillsPath`, `resolveActiveSkillsDir`), the `OpenCodeSkillsCollection` plugin function
- Depends on: `src/skill-pointer/index.ts` (`runSkillPointer`), `src/utils/fs.utils.ts` (`ensureDir`)
- Used by: OpenCode runtime (loads as a plugin via `@opencode-ai/plugin`)

**SkillPointer Orchestrator:**
- Purpose: Sequence the full pipeline — load index, filter, install vault, patch content, generate pointers
- Location: `src/skill-pointer/index.ts`
- Contains: `runSkillPointer()` function, `SkillPointerOptions` interface, vault path resolution
- Depends on: `vault-installer.ts`, `skill-risk-filter.ts`, `config-loader.ts`, `skill-patcher.ts`, `pointer-generator.ts`
- Used by: `src/index.ts`

**Vault Installer:**
- Purpose: Load the skill index (from `skills_index.json` or by scanning `SKILL.md` frontmatter) and sync skill folders into the vault organized by category
- Location: `src/skill-pointer/vault-installer.ts`
- Contains: `loadSkillsIndex()`, `installSkillsToVault()`, `SkillIndexEntry` interface, frontmatter parsing, category derivation, path-traversal guards
- Depends on: `src/utils/fs.utils.ts`, `src/constants/constants.ts`
- Used by: `src/skill-pointer/index.ts`

**Risk Filter:**
- Purpose: Filter skill index entries by risk level or explicit exclusion list before installation
- Location: `src/skill-pointer/skill-risk-filter.ts`
- Contains: `shouldLoad()`, `filterIndex()`
- Depends on: `src/skill-pointer/risk-level.ts` (`RiskLevel` type), `config-loader.ts` (`SkillRiskFilterConfig`)
- Used by: `src/skill-pointer/index.ts`

**Config Loader:**
- Purpose: Load user-facing `skill-filter.jsonc` configuration (risk exclusions, scan patterns, content patches)
- Location: `src/skill-pointer/config-loader.ts`
- Contains: `loadFilterConfig()`, `SkillRiskFilterConfig`, `ScanPattern`, `SkillPatch` interfaces, default config, JSONC parsing via `strip-json-comments`
- Depends on: `src/skill-pointer/risk-level.ts`
- Used by: `src/skill-pointer/index.ts`, `src/skill-pointer/skill-risk-filter.ts`

**Content Scanner:**
- Purpose: Detect dangerous patterns in skill content (recursive invocation, aggressive matching) — used at CI time, not at runtime
- Location: `src/skill-pointer/content-scanner.ts`
- Contains: `scanSkills()`, `scanSkillContent()`, `mergePatterns()`, `DEFAULT_SCAN_PATTERNS`, `ScanResult`, `ScanOutput` interfaces
- Depends on: `src/constants/constants.ts`
- Used by: `scripts/ci-scan-skills.mjs` (CI pipeline)

**Skill Patcher:**
- Purpose: Apply config-driven regex find/replace patches to installed skill SKILL.md files in the vault
- Location: `src/skill-pointer/skill-patcher.ts`
- Contains: `applySkillPatches()`, path-traversal validation via `realpathSync`, grouped patch application
- Depends on: `src/constants/constants.ts`
- Used by: `src/skill-pointer/index.ts`

**Pointer Generator:**
- Purpose: Write lightweight `SKILL.md` pointer files into `~/.config/opencode/skills/` — one pointer per category listing all skills and vault path
- Location: `src/skill-pointer/pointer-generator.ts`
- Contains: `generatePointers()`, `buildPointerContent()` (Markdown with frontmatter, skill list, load instructions)
- Depends on: `src/constants/constants.ts`, `src/utils/fs.utils.ts`
- Used by: `src/skill-pointer/index.ts`

**Constants:**
- Purpose: Centralize shared string constants used across the plugin
- Location: `src/constants/constants.ts`
- Contains: `POINTER_SUFFIX` (`"-category-pointer"`), `SKILL_FILENAME` (`"SKILL.md"`), `VAULT_DIR_NAME` (`"skill-libraries"`), `UNCATEGORIZED_CATEGORY` (`"uncategorized"`)
- Depends on: none
- Used by: all skill-pointer modules

**Utilities:**
- Purpose: Shared filesystem helpers
- Location: `src/utils/fs.utils.ts`
- Contains: `ensureDir()` (recursive mkdir), `listSubdirectories()`
- Depends on: `node:fs`
- Used by: `src/index.ts`, `src/skill-pointer/index.ts`, `src/skill-pointer/vault-installer.ts`, `src/skill-pointer/pointer-generator.ts`

## Data Flow

**Startup Pipeline (runtime):**

1. OpenCode loads the plugin — `src/index.ts` resolves `bundledSkillsPath` (from `dist/` relative to `__dirname`) and `activeSkillsDir` (`~/.config/opencode/skills/`)
2. `runSkillPointer()` is called — `src/skill-pointer/index.ts`
3. `loadSkillsIndex()` reads `skills_index.json` (or scans `SKILL.md` frontmatter as fallback) — `src/skill-pointer/vault-installer.ts`
4. `loadFilterConfig()` reads `~/.config/opencode/skill-filter.jsonc` (JSONC with comments support) — `src/skill-pointer/config-loader.ts`
5. `filterIndex()` removes skills matching excluded risk levels or IDs — `src/skill-pointer/skill-risk-filter.ts`
6. `installSkillsToVault()` syncs skill folders from `bundled-skills/` into `~/.config/opencode/skill-libraries/<category>/`, removing stale skills not in the filtered index — `src/skill-pointer/vault-installer.ts`
7. `applySkillPatches()` applies regex find/replace patches from config to installed SKILL.md files — `src/skill-pointer/skill-patcher.ts`
8. `generatePointers()` writes category pointer folders (`<category>-category-pointer/SKILL.md`) into `~/.config/opencode/skills/`, cleaning up stale pointer directories — `src/skill-pointer/pointer-generator.ts`

**CI Content Scanning (build time):**

1. `scripts/ci-scan-skills.mjs` loads the compiled index and scanner from `dist/`
2. `scanSkills()` tests every SKILL.md against merged default + config scan patterns — `src/skill-pointer/content-scanner.ts`
3. Quarantined skills (those matching `block`-severity patterns) are deleted from `bundled-skills/` and removed from `skills_index.json`
4. Warnings are logged but skills are kept; exit code 0 on success

## Key Abstractions

**SkillIndexEntry:**
- Purpose: Unified representation of a skill's metadata — id (folder name), category, name, description, risk level
- Location: `src/skill-pointer/vault-installer.ts`
- Pattern: Plain data interface

**RiskLevel:**
- Purpose: Classify skill safety — `"none" | "safe" | "critical" | "offensive" | "unknown"`
- Location: `src/skill-pointer/risk-level.ts`
- Pattern: Union type

**SkillRiskFilterConfig:**
- Purpose: User-facing configuration for filtering skills, scanning content, and patching skill files
- Location: `src/skill-pointer/config-loader.ts`
- Pattern: Configuration interface with safe defaults

**SkillPointerOptions:**
- Purpose: Input parameters for the orchestrator — bundled skills path, active skills dir, optional vault dir and config path overrides
- Location: `src/skill-pointer/index.ts`
- Pattern: Options interface

**Pointer Files (`<category>-category-pointer/SKILL.md`):**
- Purpose: Lightweight Markdown files with YAML frontmatter that list all skills in a category and provide vault path + load instructions for the agent
- Location: Generated at runtime into `~/.config/opencode/skills/<category>-category-pointer/SKILL.md`
- Pattern: Template-driven code generation

## Entry Points

**OpenCode Plugin Hook:**
- Location: `src/index.ts` (default export `OpenCodeSkillsCollection`)
- Triggers: OpenCode startup (plugin system loads the package)
- Responsibilities: Resolve paths, ensure directories exist, invoke the full SkillPointer pipeline, catch and log errors to stderr

**CI Scanner Script:**
- Location: `scripts/ci-scan-skills.mjs`
- Triggers: GitHub Actions workflow (`sync-skills.yml`) before npm publish
- Responsibilities: Load index, scan all skills for dangerous patterns, remove quarantined skills from `bundled-skills/` and `skills_index.json`, emit GitHub Actions annotations

## Error Handling

**Strategy:** Fail-closed at the plugin level with stderr logging. The top-level `try/catch` in `src/index.ts` catches any pipeline failure and writes to `process.stderr`, then returns an empty plugin object — OpenCode continues without skills rather than crashing. Individual pipeline stages use safe defaults:
- `loadFilterConfig()` returns empty defaults on missing file, parse errors, or invalid entries
- `loadSkillsIndex()` falls back to scanning `SKILL.md` frontmatter when `skills_index.json` is missing or corrupt
- `applySkillPatches()` silently skips invalid regex patterns and unmapped skill IDs
- `content-scanner.ts` silently skips invalid regex patterns and preserves defaults when config overrides are invalid
- Path-traversal guards (`isSafePath`, `isSafePathComponent`, `realpathSync` checks) prevent directory escapes in vault operations

## Cross-Cutting Concerns

**Storage:** Filesystem-based. Skills live as folders of files in `~/.config/opencode/skill-libraries/` (vault). Pointer files live in `~/.config/opencode/skills/`. Configuration lives in `~/.config/opencode/skill-filter.jsonc`. No database.

**Logging:** `process.stderr.write()` for plugin-level errors. `console.warn()` in `content-scanner.ts` for invalid regex patterns. GitHub Actions `::warning::` annotations from CI script. No structured logging framework.

**Caching:** None. The pipeline runs synchronously on every OpenCode startup. The vault is a file-level cache of bundled skills — `cpSync` with `force: true` ensures consistency on every run.

**Security:** OWASP-aligned path traversal prevention. Every function that accepts user-derived or index-derived skill IDs validates components against `..`, `/`, and path separator injection. `realpathSync` ensures resolved paths stay within expected boundaries. Content scanning at CI time quarantines dangerous skill instructions before they reach the npm package. No secrets or credentials in code — configuration is user-authored JSONC.
