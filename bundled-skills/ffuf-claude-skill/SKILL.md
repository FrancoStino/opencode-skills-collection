---
name: ffuf-claude-skill
description: "Web fuzzing with ffuf"
risk: offensive
source: "https://github.com/jthack/ffuf_claude_skill"
date_added: "2026-02-27"
---

# Ffuf Claude Skill

> **⚠️ AUTHORIZED USE ONLY**
> This skill is for educational purposes or authorized security assessments only.
> You must have explicit, written permission from the system owner before using this tool.
> Misuse of this tool is illegal and strictly prohibited.

## Overview

Web fuzzing with ffuf

## When to Use This Skill

Use this skill when you need to work with web fuzzing with ffuf.

## Instructions

Use only a specifically authorized fuzzing target and allowed paths. Record host,
protocol, scope, time window, request-rate limits and prohibited side effects before
sending traffic. This AAS entrypoint does not bundle ffuf, a wordlist or an upstream
runner. Inspect the installed version's help and review the selected wordlist.

Plan a bounded run against a local or explicitly authorized test environment;
avoid writes, authenticated-state changes and rate-limit bypass. Compare candidate
responses with a known missing-path baseline; response size/status alone does not
prove a vulnerability. Preserve request/response evidence after redacting secrets,
stop on target instability or scope changes, and report untested paths as unknown.
## Mandatory confirmation gate

Before each probing command, collect the exact target URL, IP, account, or resource, written authorization and permitted scope. Show the exact command and expected effect. Wait for explicit confirmation in the current conversation. Without confirmation, remain read-only and provide defensive guidance only. No traffic is authorized simply by invoking this guide.

## Example

**User request:**

> Use @ffuf-claude-skill for this task: Web fuzzing with ffuf.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
