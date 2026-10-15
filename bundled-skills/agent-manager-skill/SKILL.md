---
name: agent-manager-skill
description: "Manage multiple local CLI agents via tmux sessions (start/stop/monitor/assign) in an explicitly authorized workspace."
risk: critical
source: community
date_added: "2026-02-27"
---

# Agent Manager Skill

## When to Use
Use this skill when you need to:

- run multiple local CLI agents in parallel (separate tmux sessions)
- start/stop agents and tail their logs
- assign tasks to agents and monitor output
- prepare a scoped plan for repeated agent work only when scheduling is explicitly requested

## Prerequisites

This AAS entrypoint does not bundle the manager runtime. The historical upstream URL was unavailable during this review; do not execute its examples until an actual reviewed installation and CLI help confirm them. The original install option is retained as attribution, not an automatic setup step:

```bash
git clone https://github.com/fractalmind-ai/agent-manager-skill.git
```

## Historical Upstream Command Shapes

The clone directory above differs from the `agent-manager/` path below. Resolve the actual installed script path rather than assuming these examples work from the current directory. Employee IDs and team files are examples and must be replaced with verified workspace configuration.

```bash
python3 agent-manager/scripts/main.py doctor
python3 agent-manager/scripts/main.py list
python3 agent-manager/scripts/main.py start EMP_0001
python3 agent-manager/scripts/main.py monitor EMP_0001 --follow
python3 agent-manager/scripts/main.py assign EMP_0002 <<'EOF'
Follow teams/fractalmind-ai-maintenance.md Workflow
EOF
```

## Bounded Operation

List the actual configured agents and existing tmux sessions first. Starting, assigning or stopping an agent requires authorization for that task and target. Preserve unrelated sessions, record the specific session/PID and inspected command, and redact logs before sharing. A session being alive does not prove its task completed; verify the requested result. No cron installer or automatic scheduler is bundled, so this guide does not claim cron support.

## Notes

- Requires `tmux` and `python3`.
- Agents are configured under an `agents/` directory (see the repo for examples).

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
