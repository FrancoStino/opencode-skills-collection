---
name: agent-self-scheduling
description: "Schedule AI agent runs with cron, loops, or external clocks while avoiding unsafe tight autonomous timers."
category: agent-orchestration
risk: critical
source: community
source_repo: davidondrej/skills
source_type: community
date_added: "2026-07-07"
author: davidondrej
tags: [agents, scheduling, automation, cron]
tools: [claude, codex]
license: "MIT"
license_source: "https://github.com/davidondrej/skills/blob/main/LICENSE"
---

# Agent Self-Scheduling

## When to Use

- Use when the user asks for recurring, scheduled, heartbeat, or looped agent work.
- Use when you need to choose between cron, external schedulers, hooks, or built-in agent scheduling.

Scheduling requires a direct user request; a guide or task-list entry is not permission to create background work. Preserve timezone, cadence, notification preferences and stop conditions; update an existing matching job instead of duplicating it. External messages and posting require explicit authorization.

First inspect the actual host: prefer its supported scheduler/heartbeat when available (including Codex automations); otherwise use an explicitly authorized external clock. Host capabilities are not determined solely by the runtime name.

Traditional five-field cron has one-minute granularity; other schedulers differ. Prefer event-driven checks and an appropriate cadence. Avoid tight LLM timers and indefinite loops.

## Camp A — one-shot agents, you own the clock

These run once and exit (amnesiac unless resumed). Schedule them externally.

```bash
claude -p "PROMPT" --output-format json --allowedTools "Read"  # Claude Code
codex exec --json "PROMPT"                                                # Codex
pi run "PROMPT"                                                           # Pi
```

Wrap in a clock:

```bash
# 1. cron (>= 1 min floor)
*/10 * * * * cd /path/to/project && pi run "check X and report" >> ~/agent.log 2>&1
# 2. systemd timer (Linux, survives reboot, better logging) — OnUnitActiveSec=10min
# 3. dumb loop (sub-minute, or no cron available)
# If an external loop is required, bound its lifetime and implement a stop flag and overlap lock.
# Do not install an indefinite model-calling loop by default.
```

Gotchas (each breaks unattended runs if ignored):
- **Permissions hang forever.** Use the host's supported narrowly scoped permissions for the agreed task. Do not disable sandboxing or broadly auto-approve commands to avoid an unattended prompt; report unavailable required approval.
- **Use JSON output** (`--output-format json` / `--json`) so the wrapper parses results deterministically.
- **Runs are amnesiac.** Resume the exact recorded task/session ID or persist private scoped state. `--last` can select an unrelated task and is unsuitable for an unattended multi-project schedule.

Pi has NO built-in scheduler/loop/heartbeat by design — external clock only (or a TS extension for agent-side timers).

### cmux — orchestration only, NO scheduler

cmux has no timer/watch/cron. Three ways to loop it: orchestrator-driven (`send` → `sleep` → `read-screen` on your own clock), a dumb while-sleep wrapper, or — preferred — event-driven via `cmux notify` + OSC terminal hooks, which is cheaper and more responsive than polling. `read-screen` is non-interruptive, safe to poll.

For a monitor, stay quiet while state is unchanged unless the user requests periodic updates; notify on meaningful change, completion, failure or needed input. (Claude Code may prefill a predicted next user message after finishing — that's Claude, not the user.)

## Camp B — Hermes built-in scheduler

Hermes' gateway ticks every 60s and runs due jobs in fresh isolated sessions. State-check first:

```bash
hermes gateway install            # user-level ( --system to survive reboot)
hermes cron create "every 1h" "summarize new emails and report" --skill himalaya
hermes cron create "0 9 * * *" "post daily standup"      # cron expr
hermes cron create "30m" "one-shot reminder in 30 min"   # one-shot delay
```

Hermes-unique: **zero-token mode** (run a script, deliver stdout verbatim — use for watchdogs), **chaining** (`context_from` pipes one job's output into the next), **self-terminating loops**, and **loop safety** (scheduled sessions cannot create more cron jobs — don't schedule from inside a scheduled job). Each run is a fresh session: the prompt must carry all context.

## Heartbeat pattern

One fast recurring tick gates many slower per-task checks: the tick reads a task list + per-task `last_run` timestamps and only acts on tasks that are due. In Hermes use a recurring job (zero-token mode when nothing's due); in Camp A use a while-sleep loop. Define active-hours, and stay silent when nothing is due — no empty noise.

## Verify it fires (before reporting success)

1. Camp A: log file grows after one interval, or run the wrapped command once by hand → clean JSON, exit 0.
2. Camp B: `hermes cron list` shows the job + sane `next_run`; trigger a run-now to confirm delivery.
3. Confirm least-privilege permissions, overlap protection, bounded retries/timeouts, private logs and a working disable/remove path. An unavailable approval is a reported failure, not justification for a bypass.
4. Heartbeats: confirm a nothing-due tick stays silent.

## Limitations

- Adapted from `davidondrej/skills`; verify local paths, tools, credentials, and agent features before acting.
- For commands, remote access, scheduling, browser automation, or file-changing workflows, get explicit user approval and confirm the target environment first.
