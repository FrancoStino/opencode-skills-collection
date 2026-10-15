---
name: score-eval
disable-model-invocation: true
source_repo: neondatabase/agent-skills
source_type: official
source: neondatabase
date_added: '2026-09-21'
risk: critical
description: "Use when scoring an evaluation diff against a supplied rubric and baseline fixture: retain evidence for detected/fixed findings and report unscorable or unexecuted checks."
---

# Score an Evaluation Diff

## When to Use
- You have an evaluation diff, rubric, and baseline fixture and need to assess detected and fixed problems.

## Required Inputs
- The diff file to score.
- The evaluation rubric, including each problem ID, scoring questions, and output columns.
- The original fixture directory or immutable baseline revision.
- An authorized destination for the results.

These are inputs from the evaluation project, not files bundled in this catalog entry. Resolve the paths from the supplied task; do not assume eval-rubric.md, fixtures/hono-drizzle-app/, or results.csv exists in the skill directory.

## Procedure
1. Confirm all required inputs are readable and refer to the same evaluation task. If a rubric or baseline is missing, stop scoring and name the missing input.
2. Read the diff, rubric, and relevant baseline files. Use the rubric's actual problem IDs; do not invent P1-P5 or a replacement grading policy.
3. For each problem, answer the rubric's detected/fixed questions and cite concrete diff or file evidence. Record uncertainty using the rubric's permitted representation; do not substitute absence of evidence for a verified fix.
4. Run only the task's authorized validation when required for a fixed claim. Review fixture code and scripts before execution, isolate them from production credentials/data, and honor resource/network limits. A supplied fixture is not automatically trusted. Clearly distinguish static inspection from executed checks.
5. Prepare one result row using the rubric's exact column schema. Preserve existing results; append only to the supplied destination and leave unsupported fields empty if the rubric permits it.
6. Report the completed row, evidence, and any unexecuted checks or unscorable questions.

## Example
> Score work/change.diff against work/rubric.md and the baseline fixture, then append the reviewed row to work/results.csv. Do not infer missing grading criteria.

## Risk boundary

The critical label covers optional execution of supplied fixture code and appending
to evaluation results. Static reading alone stays read-only. Neither a diff nor a
rubric authorizes production changes, installing dependencies or running arbitrary
fixture scripts outside the evaluation scope.

## Limitations
- This skill does not provide the upstream evaluation fixture or rubric.
- Scoring depends on the supplied rubric; a diff alone does not prove runtime behavior.
- Result writes and test execution must remain within the user's authorized evaluation scope.
