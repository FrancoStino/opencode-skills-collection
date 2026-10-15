---
name: bdistill-behavioral-xray
description: "X-ray any AI model's behavioral patterns — refusal boundaries, hallucination tendencies, reasoning style, formatting defaults. No API key needed."
category: ai-testing
risk: safe
source: community
date_added: "2026-03-20"
author: FrancyJGLisboa
tags: [ai, testing, behavioral-analysis, model-evaluation, red-team, compliance, mcp]
tools: [claude, cursor, codex, copilot]
---

# Behavioral X-Ray

Systematically probe an AI model's behavioral patterns and generate a visual report. The described workflow probes the host model through its existing session; it still requires the separately installed bdistill package/MCP integration and can consume host-model usage. Do not configure the host automatically just from a request to read this skill.

## Overview

bdistill's Behavioral X-Ray runs 30 carefully designed probe questions across 6 dimensions, auto-tags each response with behavioral metadata, and compiles results into a styled HTML report with radar charts and actionable insights.

Use it to understand your model before building with it, compare models for task selection, or track behavioral drift over time.

## When to Use This Skill

- Use when you want to understand how your AI model actually behaves (not how it claims to)
- Use when choosing between models for a specific task
- Use when debugging unexpected refusals, hallucinations, or formatting issues
- Use for compliance auditing — documenting model behavior at deployment boundaries
- Use for red team assessments — systematic boundary mapping across safety dimensions

## How It Works

### Step 1: Install

```bash
pip install bdistill
claude mcp add bdistill -- bdistill-mcp   # Claude Code
```

For other tools, add bdistill-mcp as an MCP server in your project config.

### Step 2: Run the probe

In Claude Code:
```
/xray                          # Full behavioral probe (30 questions)
/xray --dimensions refusal     # Probe just one dimension
/xray-report                   # Generate report from completed probe
```

In any tool with MCP:
```
"X-ray your behavioral patterns"
"Test your refusal boundaries"
"Generate a behavioral report"
```

## Probe Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| **tool_use** | When does it call tools vs. answer from knowledge? |
| **refusal** | Where does it draw safety boundaries? Does it over-refuse? |
| **formatting** | Lists vs. prose? Code blocks? Length calibration? |
| **reasoning** | Does the visible answer provide an appropriate concise explanation and handle trick questions? Do not request, expose or infer hidden chain-of-thought. |
| **persona** | Identity, tone matching, composure under hostility |
| **grounding** | Hallucination resistance, fabrication traps, knowledge limits |

## Output

A styled HTML report showing:
- Observed refusal/hedge rates and visible explanation style; no measurement of hidden reasoning
- Per-dimension breakdown with bar charts
- Notable response examples with behavioral tags
- Actionable insights (e.g., "visible explanations appeared in 25 of 30 recorded responses; this is not a hidden-reasoning measurement")

## Best Practices

- Answer probe questions honestly — the value is in authentic behavioral data
- Run probes on the same model periodically to track behavioral drift
- Compare reports across models to make informed selection decisions
- Use adversarial knowledge extraction (`/distill --adversarial`) alongside behavioral probes for complete model profiling

## Related Skills

- `@bdistill-knowledge-extraction` - Extract structured domain knowledge from any AI model

## Limitations
- Self-reported behavior and a 30-question run are exploratory evidence, not an independent benchmark, compliance certification or universal model capability. Keep exact prompts, responses, host/model identity, date and run conditions; compare like-for-like repeated runs.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
