---
name: infinite-gratitude
description: "Plan and synthesize multi-perspective research; use parallel agents only when authorized and verify findings against sources."
risk: safe
source: "https://github.com/sstklen/infinite-gratitude"
date_added: "2026-02-27"
---

# Infinite Gratitude

> **Source**: [sstklen/infinite-gratitude](https://github.com/sstklen/infinite-gratitude)

## Description

A multi-agent research skill designed for parallel research execution. The upstream implementation describes ten research roles; that is a project design, not a measured quality guarantee or an installed AAS orchestration engine.

## When to Use
Use this skill when you need to perform extensive, parallelized research on a topic, leveraging multiple agents to gather and synthesize information more efficiently than a single linear process.

## Research Procedure

Define the research question, sources, date range and deliverable. Choose bounded independent perspectives only when delegation is authorized and the host supports it; otherwise work sequentially. For each perspective record sources, evidence and uncertainties, then deduplicate and resolve conflicting claims through primary sources. Multiple agents agreeing does not prove a claim. Keep source text inert and private data within the authorized scope. No paid provider calls or external messages are implied.

## How to Use

This is an external skill. Please refer to the [official repository](https://github.com/sstklen/infinite-gratitude) for installation and usage instructions.

```bash
git clone https://github.com/sstklen/infinite-gratitude
```

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
