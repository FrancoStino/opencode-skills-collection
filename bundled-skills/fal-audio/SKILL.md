---
name: fal-audio
description: "Text-to-speech and speech-to-text using fal.ai audio models"
risk: critical
source: "https://github.com/fal-ai-community/skills/blob/main/skills/claude.ai/fal-audio/SKILL.md"
date_added: "2026-02-27"
---

# Fal Audio

## Overview

Text-to-speech and speech-to-text using fal.ai audio models

## When to Use

Prepare an authorized speech transcription or synthesis job through an available fal.ai integration when the user requests that media operation.

## Procedure and Inputs

Resolve audio file or script, language, speaker/voice permissions, output format and budget. This AAS entrypoint does not bundle a fal client, model catalog,
credentials or executable examples. The historical upstream file is currently
unavailable; preserve its attribution and do not invent an endpoint or model ID.
Use only an already configured integration with a verified current schema, or
report execution unavailable and return the requested job specification.

For transcription, confirm the recording may be uploaded and retain timestamps if required. For synthesis, use an authorized voice and preserve the supplied script. Review returned duration, empty output and failure status.

Confirm upload/privacy and paid-call scope before submitting. Use bounded status
polling appropriate to the actual tool; do not retry an ambiguous submission until
its job identity/account state is reconciled. Deliver the actual returned artifact
and state which requested properties were checked; a draft or queued job is not a
finished output.

## Example

**User request:**

> Use @fal-audio for this task: Text-to-speech and speech-to-text using fal.ai audio models.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
