---
name: conductor-validator
description: 'Validates Conductor project artifacts for completeness,

  consistency, and correctness. Use after setup, when diagnosing issues, or

  before implementation to verify project context.

  '
risk: safe
source: community
date_added: '2026-02-27'
---

# Validate Conductor workflow artifacts

## When to Use
Inspect a project that actually uses a `conductor/` workflow directory after setup, before resuming a track, or when diagnosing inconsistent plans/status. This is distinct from the Rails Conductor desktop-app setup (`conductor.json`/`script/server`).

## Read-only discovery

```bash
# Run from the explicitly selected project root; missing paths are findings, not permission to create them.
ls -ld conductor/ conductor/tracks/
ls conductor/index.md conductor/product.md conductor/tech-stack.md conductor/workflow.md conductor/tracks.md
```

## Validation procedure

1. Read current project instructions and the actual configured Conductor workflow/version.
2. Compare the declared artifact list with the project’s real files; report missing, unreadable and extra artifacts separately.
3. Resolve local index/track links, track IDs and plan/status markers against their referenced content. Do not assume directory presence proves completeness.
4. Reconcile completed markers with recorded implementation/test evidence and the current revision; report stale or conflicting state without inventing a pass.
5. Output a concise list of file, observed inconsistency, expected contract and proposed correction. Apply fixes only when requested; preserve existing plans and dirty work.

No implementation-playbook file or runnable validator script is bundled. The procedure above is the complete local guide; optional project-specific automation must actually exist and be reviewed before execution.

## Pattern Matching

**Status markers in tracks.md:**

```
- [ ] Track Name  # Not started
- [~] Track Name  # In progress
- [x] Track Name  # Complete
```

**Task markers in plan.md:**

```
- [ ] Task description  # Pending
- [~] Task description  # In progress
- [x] Task description  # Complete
```

**Track ID pattern:**

```
<type>_<name>_<YYYYMMDD>
Example: feature_user_auth_20250115
```

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
