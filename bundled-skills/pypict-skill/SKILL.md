---
name: pypict-skill
description: "Pairwise test generation"
risk: safe
source: "https://github.com/omkamal/pypict-claude-skill/blob/main/SKILL.md"
date_added: "2026-02-27"
---

# Pypict Skill

## Overview

Pairwise test generation

## When to Use

Design a small test matrix covering every pair of values across discrete factors,
when exhaustive combinations are too costly and pairwise coverage is appropriate.

## Procedure

1. Define factors, permitted values and real invalid-combination constraints.
2. Inspect an actual installed pairwise generator and its supported input format;
   this entrypoint does not bundle a Python package or executable.
3. Generate candidate rows and independently enumerate covered valid value pairs.
   Missing pairs must remain visible; constraints must not be invented to hide them.
4. Convert rows into tests with expected behavior, not just input combinations.

For three binary factors, this illustrative matrix covers all two-factor pairs:

```json
[[0,0,0],[0,1,1],[1,0,1],[1,1,0]]
```

Pair coverage is not correctness or coverage of three-way interactions. Add known
boundary, authorization and failure cases separately.

## Example

**User request:**

> Use @pypict-skill for this task: Pairwise test generation.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
