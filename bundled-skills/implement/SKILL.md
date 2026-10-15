---
name: implement
description: Implement a piece of work based on a PRD or set of issues.
risk: critical
source: https://github.com/mattpocock/skills/tree/main/skills/engineering/implement
source_repo: mattpocock/skills
source_type: community
date_added: 2026-07-01
license: MIT
license_source: https://github.com/mattpocock/skills/blob/main/LICENSE
---


## When to Use

Use this skill when you need to implement a piece of work based on a PRD or set of issues.

Implement the work described by the user in the PRD or issues.

Use the project's actual test workflow at pre-agreed seams; `/tdd` is an upstream command, not a promised available host tool. Preserve the attached plan and existing todos.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Review the net diff and actual verification evidence. Use `/review` only when available; otherwise perform the review directly.

Commit only the authorized scope on a topic branch following repository policy; inspect staged files and preserve unrelated work. Do not commit to a protected default branch or publish merely because implementation was requested.

## Example

**User request:**

> Implement a piece of work based on a PRD or set of issues.

## Limitations

- Use this skill only when the task clearly matches its upstream source and local project context.
- Verify commands, generated code, dependencies, credentials, and external service behavior before applying changes.
- Do not treat examples as a substitute for environment-specific tests, security review, or user approval for destructive or costly actions.
