---
name: avoid-ai-writing
description: "Audit and rewrite prose for repetitive, vague, or formulaic wording while preserving meaning, evidence, and the writer's voice."
risk: none
source: https://github.com/conorbronsdon/avoid-ai-writing
date_added: "2026-03-06"
---

# Avoid AI Writing — Audit & Rewrite

Detects and fixes AI writing patterns ("AI-isms") that make text sound machine-generated. Covers 21 pattern categories with examples of plainer alternatives. The full upstream pattern catalog is not bundled in this AAS entrypoint; do not claim a complete 43-entry table is present.

## When to Use This Skill

- When asked to "remove AI-isms," "clean up AI writing," or "make this sound less like AI"
- After drafting content with AI and before publishing
- When editing any text that sounds like it was generated rather than written
- When auditing documentation, blog posts, marketing copy, or internal communications for AI tells

## What It Detects

**21 pattern categories:** formatting issues (em dashes, bold overuse, emoji headers, bullet-heavy sections), sentence structure problems (hedging, hollow intensifiers, rule of three), word/phrase replacements (43 entries like leverage→use, utilize→use, robust→reliable), template phrases, transition phrases, structural issues, significance inflation, copula avoidance, synonym cycling, vague attributions, filler phrases, generic conclusions, chatbot artifacts, notability name-dropping, superficial -ing analyses, promotional language, formulaic challenges, false ranges, inline-header lists, title case headings, and cutoff disclaimers.

## Example

**Prompt:**
```
Audit this for AI writing patterns:

"In today's rapidly evolving AI landscape, developers are embarking on a pivotal journey to leverage cutting-edge tools that streamline their workflows. Moreover, these robust solutions serve as a testament to the industry's commitment to fostering seamless experiences."
```

**Output:** The skill returns four sections:
1. **Issues found** — every AI-ism quoted (landscape, embarking, pivotal, leverage, cutting-edge, streamline, robust, serves as, testament to, fostering, seamless, Moreover, In today's rapidly evolving...)
2. **Rewritten version** — "Developers are starting to use newer AI tools to simplify their work. These tools are reliable, and they're making development less painful."
3. **What changed** — summary of edits
4. **Second-pass audit** — re-reads the rewrite to catch any surviving tells

## Limitations
- These are editorial heuristics, not proof of AI authorship. Preserve factual claims, uncertainty, attributed quotations, code, identifiers, and the requested scope.
- For audit-only requests, report findings without rewriting. Avoid replacing a precise technical term merely because it appears on a word list.

- Does not detect AI-generated code, only prose
- Pattern matching is guideline-based, not absolute — some flagged words are fine in context
- The replacement table suggests alternatives but the best choice depends on context
- Cannot verify factual claims or find real citations to replace vague attributions
