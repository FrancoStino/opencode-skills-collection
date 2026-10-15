---
name: design-spells
description: Curated micro-interactions and design details that add "magic" and personality to websites and apps.
risk: safe
source: community
date_added: "2026-03-07"
---

# Design Spells Skill

[Design Spells](https://www.designspells.com/) is a collection of exceptional design details—micro-interactions, easter eggs, and clever UX patterns—that transform standard interfaces into memorable digital experiences.

## Context

Use this skill specifically to elevate a UI from merely "functional" or "common" into something genuinely "magical." It focuses on the minute details that surprise and delight users, establishing a strong, premium brand personality.

## When to Use
Trigger this skill when:

- Polishing a finished feature to actively add a "wow" factor.
- Designing unique interactions to replace standard web behaviors (e.g., clever hover states, creative loaders, surprising transitions).
- Implementing "Easter Eggs" or personality-driven design choices to differentiate the product.
- Looking to break away from generic, template-driven development.

## Execution Workflow

1. **Identify Opportunity**: Target the "boring" or "standard" parts of the interface (e.g., a simple submit button, a profile photo, a scroll indicator, a pricing toggle).
2. **Research Spells**: Browse Design Spells for highly creative patterns (e.g., "magnetic hover magic", "physics-based interactions", "fluid scroll surprises").
3. **Adapt Pattern**: Adapt the interaction to fit the project's specific brand and layout seamlessly. Use it to enhance the core narrative of the app.
4. **Implement flawlessly**: Use CSS, Anime.js, or Framer Motion to build the specific micro-interaction with measured smoothness on target devices; frame-rate claims require profiling rather than a guarantee.

## Strict Rules

- **Scoped enhancement**: Use a micro-interaction only when it serves the requested product experience. Respect the user’s existing design, accessibility and performance constraints; ordinary clear behavior is valid, and this skill is optional.
- **Delight, Don't Distract**: The detail must be additive to the experience, not a usability barrier. It should feel expensive and highly crafted.
- **Quality Execution**: A broken or janky "spell" is worse than none. Ensure the implementation is high-performance, GPU-accelerated, and avoids unexpected layout shifts, supports keyboard/touch, and respects prefers-reduced-motion.

## Example

**User request:**

> Polish a finished feature to actively add a "wow" factor.

## Limitations
- Reference designs are inspiration, not permission to copy protected assets or add packages automatically. Keep core actions usable without animation/hover/easter eggs; do not hide essential affordances behind decorative interactions.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
