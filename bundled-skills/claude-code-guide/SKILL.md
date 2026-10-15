---
name: claude-code-guide
description: "To provide a comprehensive reference for configuring and using Claude Code (the agentic coding tool) to its full potential. This skill synthesizes best practices, configuration templates, and advanced usage patterns."
risk: critical
source: community
date_added: "2026-02-27"
---

# Claude Code Guide

## Purpose

To provide a comprehensive reference for configuring and using Claude Code (the agentic coding tool) to its full potential. This skill synthesizes best practices, configuration templates, and advanced usage patterns.

## Configuration (`CLAUDE.md`)

Read existing project instructions first. Add or update a project `CLAUDE.md` only within the requested scope, preserving repository conventions and existing instructions. The template below illustrates a React/TypeScript npm project; replace its commands and stack rules with verified project facts.

### Template (General)

```markdown
# Project Guidelines

## Commands

- Run app: `npm run dev`
- Test: `npm test`
- Build: `npm run build`

## Code Style

- Use TypeScript for all new code.
- Functional components with Hooks for React.
- Tailwind CSS for styling.
- Early returns for error handling.

## Workflow

- Read `README.md` first to understand project context.
- Before editing, read the file content.
- After editing, run tests to verify.
```

## Advanced Features

### Thinking Keywords

State the desired investigation and verification criteria explicitly. These phrases describe tasks; they are not guaranteed switches for model reasoning effort:

- "Think step-by-step"
- "Analyze the root cause"
- "Plan before executing"
- "Verify your assumptions"

### Debugging

If the agent is stuck or behaving unexpectedly:

1. **Clear Context**: Save the task state and relevant evidence before starting a new session. A prompt to forget instructions does not erase loaded project rules.
2. **Explicit Instructions**: Be extremely specific about paths, filenames, and desired outcomes.
3. **Logs**: Ask the agent to "check the logs" or "run the command with verbose output".

## Best Practices

1. **Small Contexts**: Don't dump the entire codebase into the context. Use `rg` or `rg --files` to locate relevant files first.
2. **Iterative Development**: Ask for small changes, verify, then proceed.
3. **Feedback Loop**: If the agent makes a mistake, correct it immediately and ask it to "add a lesson" to its memory (if supported) or `CLAUDE.md`.

## Verification

Inspect the resulting diff and confirm the intended instructions actually load in the installed host. Project instructions guide behavior; they do not enforce a security boundary. Keep secrets out of tracked instructions. Check current features against [official memory documentation](https://code.claude.com/docs/en/memory).

## Reference

Based on [Claude Code Guide by zebbern](https://github.com/zebbern/claude-code-guide).

## When to Use
Use when configuring project instructions, diagnosing conflicting Claude Code guidance, or defining verified build/test workflows.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
