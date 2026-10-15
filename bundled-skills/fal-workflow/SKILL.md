---
name: fal-workflow
description: "Generate workflow JSON files for chaining AI models"
risk: critical
source: "https://github.com/fal-ai-community/skills/blob/main/skills/claude.ai/fal-workflow/SKILL.md"
date_added: "2026-02-27"
---

# Fal Workflow

## Overview

Generate workflow JSON files for chaining AI models

## When to Use

Create a reviewable graph for a multi-step fal.ai media workflow, or plan an
explicitly authorized run through an already available integration.

## Workflow Authoring

Resolve inputs, outputs, dependencies, model schemas, privacy and cost limits.
Distinguish a portable JSON deliverable from local CLI orchestration; AAS does not
bundle the upstream CLI or references. Inspect current endpoint schemas before
choosing models. Keep node IDs consistent with keys and include every referenced
node in dependencies. Use `run` or `display` nodes for the documented JSON runtime;
input fields belong in its input schema. Whole-value references are distinct from
unsupported string interpolation.

This illustrative node fragment requires a matching real producer and surrounding
workflow schema; it is not a standalone runnable file:

```json
{"id":"output","type":"display","depends":["image"],"fields":{"image":"$image.images.0.url"}}
```

Validate graph references and real model contracts before delivery. Drafting does
not authorize upload, execution or publication. Report schema validation and actual
job execution separately; no “production-ready” guarantee.

Current richer source: [fal workflow](https://github.com/fal-ai-community/skills/blob/main/skills/fal-workflow/SKILL.md).

## Example

**User request:**

> Generate workflow JSON files for chaining AI models.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
