---
name: deterministic-design
description: "Measure rendered UI layout with reproducible spatial metrics and a separately assessed usability review; distinguish measurements from subjective judgments and user tests."
risk: safe
source: community
source_type: community
source_repo: connerkward/deterministic-design-skill
date_added: "2026-06-16"
author: Conner K Ward
license: MIT
tags:
  - design
  - layout
  - usability
  - audit
  - verification
  - vision
tools:
  - claude-code
  - antigravity
  - cursor
  - gemini-cli
  - codex-cli
---
## When to Use

Use to catch AI-generated UI that "looks off", is misaligned or centered-mush, or fails usability — when you need reproducible spatial measurements and an evidence-based usability review. Metrics do not prove user success, accessibility or overall design quality. Compose it with any taste/token design skill before reporting design "done".

_Source: [connerkward/deterministic-design-skill](https://github.com/connerkward/deterministic-design-skill) (MIT)._

# deterministic-design

Thesis: **determinism beats AI randomness.** A model can't trust its own eye on layout — so
don't. Render the UI and *measure* it.

Two sub-skills (load as needed):
- **[design-spatial](https://github.com/connerkward/deterministic-design-skill/blob/main/design-spatial/SKILL.md)** — deterministic layout audit: explicit grid
  + 8-pt spacing, and `layout-audit.js` computes centroid / optical-center / pixel-oracle
  balance and draws an annotated screenshot. **Numbers, not vibes.** Plus a render-then-
  critique vision loop.
- **[design-ux](https://github.com/connerkward/deterministic-design-skill/blob/main/design-ux/SKILL.md)** — usability audit: scores the rendered UI against
  Nielsen's 10 + interaction heuristics via an authorized separate judge or clearly disclosed self-review → prioritized fix list.

This **improves** existing design skills (including the default Anthropic one) by adding the
layer they lack — it doesn't just advise on taste, it renders, measures, and judges the
output. Composable with any design skill.

In central this lives as a subdir of ckw-design; it **publishes separately** as
`deterministic-design-skill` (its own distribution) via publish-skill. One of the two
flagship narratives — the *determinism* one; its sibling is human-in-the-loop (lookdev).

## Example

**User request:**

> Review this interface with @deterministic-design, identify the highest-impact design problems, and propose an implementation-ready improvement.

## Limitations

- Layout metrics and vision-judged audits catch many spatial and usability failures, but they are not a substitute for product judgment or user testing.
- The workflow requires a rendered UI or screenshot; record viewport, scale, fonts, capture state and measurement definitions. Separate layout measurements, subjective vision judgments and actual user/accessibility tests.
- The linked sub-skills and layout-audit.js are external, not bundled. Read and pin them before use; the link is not executable availability. Delegation requires existing explicit authorization, and screenshots may contain private data.
- Automated scoring can miss brand nuance, copy tone, accessibility needs, and domain-specific user expectations.
