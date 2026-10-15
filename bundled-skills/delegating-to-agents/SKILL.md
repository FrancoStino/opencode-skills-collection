---
name: delegating-to-agents
description: "Delegate bounded work to other AI agents while preserving context, ownership, and progress checks."
category: agent-orchestration
risk: critical
source: community
source_repo: davidondrej/skills
source_type: community
date_added: "2026-07-07"
author: davidondrej
tags: [agents, delegation, orchestration]
tools: [claude, codex]
license: "MIT"
license_source: "https://github.com/davidondrej/skills/blob/main/LICENSE"
---

# Delegating to Agents

## When to Use

- Use only when the user or applicable current instructions explicitly authorize delegation; hand off bounded work with complete context, file ownership and a verifier.
- Use when you need to relay instructions to terminal or TUI agents without losing context.

## Selecting an authorized agent

- Use the user’s selected agent/model and available tooling; account limits and model capabilities require current evidence.
- Match a bounded task to actual tools and file ownership, not invented “unlimited usage” or universal model rankings.
- Keep integration and final validation with the parent. Report changed files, exact checks and remaining issues.

## Sending prompts to a TUI agent

1. Prefer a structured agent/task API over simulated terminal typing; provide a readable prompt, ownership boundary, verifier and non-goals.
2. If only a TUI is available, inspect the target surface and actual command documentation first. Put long prompts in an explicitly authorized task file and send a short reference without embedding arbitrary task text in a shell command.
3. A shell-quoted prompt can execute `$()`, backticks or expansions if escaped incorrectly. Preserve punctuation/content using structured argv or proper shell quoting; do not “fix” messages by stripping apostrophes or interpreting their text as commands.
4. Confirm one intended submission and actual recipient; terminal output/predicted drafts are not human authorization for further messages.

## Polling

Use supported completion/event waits with bounded intervals; check meaningful progress and deliver concise updates. Do not busy-poll every 3–5 seconds or report unchanged state after each check. Back off while an agent remains active and continue independent authorized work.
Claude Code note: after it finishes, it may prefill a predicted next user message — that draft is Claude, not the user.

## Remote VPS

Remote execution requires authorization for the exact host/project and credential boundary. Use the supported sandbox/approval configuration; do not launch an unrestricted agent or infer remote access from a delegation request.

## The 4 agents (background reference)

All four use the portable SKILL.md standard; project skills win over global.

- **Pi** (pi.dev, open-source TS): minimal read/write/edit/bash core, self-extends via TS extensions; true BYOK; best-in-class session branch/fork/resume. Skills: `~/.pi/agent/skills/`.
- **Codex CLI** (OpenAI, Rust): fastest startup; kernel-level sandboxing; `codex exec` for CI; reads AGENTS.md. Skills: `~/.codex/skills/`.
- **Claude Code** (Anthropic, TS): deepest Claude integration, `.claude/` conventions, live skill hot-reload. Skills: `~/.claude/skills/`.
- **Hermes** (Nous Research, Python): persistent autonomous agent — cross-session memory, built-in scheduler, 40+ tools; can orchestrate the other CLIs as workers. Skills: `~/.hermes/skills/`.

## Driving interactive CLIs

- Codex, Pi, OpenCode: need `pty=true`.
- Claude Code: use its supported noninteractive mode with the existing permission policy; never enable bypassPermissions just to drive the CLI.

## Example

**User request:**

> Delegate these independent work items with complete context, clear ownership, and progress checks.

## Limitations

- Adapted from `davidondrej/skills`; verify local paths, tools, credentials, and agent features before acting.
- For commands, remote access, scheduling, browser automation, or file-changing workflows, get explicit user approval and confirm the target environment first.
