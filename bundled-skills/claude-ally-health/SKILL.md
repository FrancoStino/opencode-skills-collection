---
name: claude-ally-health
description: "A health assistant skill for medical information analysis, symptom tracking, and wellness guidance."
risk: critical
source: "https://github.com/huifer/Claude-Ally-Health"
date_added: "2026-02-27"
---

# Claude Ally Health

## Overview

A health assistant skill for medical information analysis, symptom tracking, and wellness guidance.

## When to Use

Organize user-supplied symptom notes or medical records into a clear timeline and
questions for a qualified clinician; explain supplied terminology with sources.

## Evidence and Privacy Workflow

1. Establish the requested informational task, supplied records, dates and intended
   recipient. Do not infer missing diagnosis, medication, dosage or test results.
2. Separate patient-reported symptoms, documented findings and unresolved questions.
3. Produce a source-linked timeline or appointment summary; mark missing/conflicting
   records explicitly. Keep sensitive records local unless sharing is authorized.
4. For medical explanations, consult current authoritative clinical sources and
   distinguish general information from individualized professional advice.

This entrypoint does not bundle a clinical decision system. It cannot diagnose,
recommend treatment changes, certify wellness or replace urgent medical care.
Do not wait on this workflow when the user reports an apparent medical emergency.
Preserve the original source attribution; the upstream project now redirects to
WellAlly-health and its implementation must be separately reviewed before use.

## Example

**User request:**

> Use @claude-ally-health for this task: A health assistant skill for medical information analysis, symptom tracking, and wellness guidance.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
