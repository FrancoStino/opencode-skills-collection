---
name: executing-plans
description: "Use when you have a written implementation plan to execute in a separate session with review checkpoints"
risk: critical
source: community
date_added: "2026-02-27"
---

# Executing Plans

## Overview

Load plan, review critically, execute tasks in batches, report for review between batches.

**Core principle:** Batch execution with checkpoints for architect review.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: use the project’s existing task/todo mechanism and proceed; TodoWrite is a host-specific tool, not a universally installed command

### Step 2: Execute Batch
**Batch size follows the user’s explicit instruction or project contract; otherwise choose a practical reviewable group**

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Report
When batch complete:
- Show what was implemented
- Show verification output
- Continue to the next authorized batch unless the user explicitly requested a checkpoint; provide concise progress without ending the task unnecessarily.

### Step 4: Continue
Based on feedback:
- Apply changes if needed
- Execute next batch
- Repeat until complete

### Step 5: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- Use the actually available finishing-a-development-branch skill only when appropriate; repository-specific maintainer/merge workflows take precedence. Do not invent a superpowers plugin dependency.
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

Pause only the dependent step when an indispensable input/authorization or unresolved external blocker prevents it; preserve independent work. Repair ordinary failures autonomously. Examples of issues to investigate include:
- A missing dependency or failing test: inspect the actual cause and attempt relevant repair; it is not automatically a reason to stop
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Between batches: follow the user’s authorized cadence and continue when no required checkpoint remains
- Stop when blocked, don't guess

## When to Use
Use when implementing an existing written plan with verifiable tasks and checkpoints. Preserve the plan file when requested, use existing todos and the user’s latest batching/continuation instruction.

## Example

**User request:**

> Use @executing-plans for this task: Use when you have a written implementation plan to execute in a separate session with review checkpoints.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
