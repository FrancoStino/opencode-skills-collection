---
name: animejs-animation
description: Advanced JavaScript animation library skill for creating complex, high-performance web animations.
risk: safe
source: community
date_added: "2026-03-07"
---

# Anime.js Animation Skill

[Anime.js](https://animejs.com/) is a lightweight but extremely powerful JavaScript animation engine. It excels at complex timelines, staggering, and precise control over DOM, CSS, and SVGs.

## Context

This skill is used for creating high-fidelity, jaw-dropping web animations that go far beyond simple CSS transitions. It's the tool of choice for awards-caliber interactive sites.

## When to Use
Trigger this skill when:

- Creating complex, multi-stage landing page orchestrations.
- Implementing staggered animations for revealing grids, text, or data visualizations.
- Animating SVG paths (morphing shapes, drawing dynamic lines).
- Building highly interactive, kinetic UI elements that respond fluidly to user input.

## Execution Workflow

1. **Identify Targets**: Select the DOM elements or SVGs to be animated.
2. **Define Properties & Easing**: Specify values to animate. **Crucially**, utilize advanced easing functions (e.g., custom `cubicBezier`, `spring`, or `elastic`) instead of basic `linear` or `ease-in-out` to make the motion feel expensive and natural.
3. **Orchestrate Timelines**: Inspect the installed major version first. This example targets Anime.js v3; use `anime.timeline()` to sequence complex choreography. Master the use of timeline offsets (relative `'-=200'` vs absolute) to create seamless overlapping motion.
4. **Implement**:
   For a bundler with Anime.js v3 installed, `import anime from "animejs";` supplies the `anime` binding. The selectors must exist in the rendered DOM.

   ```javascript
   const tl = anime.timeline({
     easing: "spring(1, 80, 10, 0)",
     duration: 1000,
   });
   tl.add({
     targets: ".hero-text",
     translateY: [50, 0],
     opacity: [0, 1],
     delay: anime.stagger(100),
   }).add(
     { targets: ".hero-image", scale: [0.9, 1], opacity: [0, 1] },
     "-=800",
   );
   ```

## Motion and Compatibility

- **Scope**: Use motion when it serves the product brief and user task. Respect the existing design system; simple transitions and static states are valid choices.
- **Staggering**: Leverage `anime.stagger()` extensively to add organic rhythm to multiple elements.
- **Performance**: Monitor main thread usage; use `will-change: transform, opacity` where appropriate for GPU acceleration.

## Example

**User request:**

> Create complex, multi-stage landing page orchestrations.

## Limitations
- The code above uses the v3 API. Anime.js v4 uses imported `createTimeline()` and a different target/parameter signature; do not mix major-version examples. Consult [official timeline documentation](https://animejs.com/documentation/timeline/) for the installed version.
- Respect `prefers-reduced-motion`: provide a static final state, avoid scroll hijacking, and keep focus/keyboard interactions immediately usable. Dispose animations when their component unmounts.
- `will-change` is a temporary optimization hint, not a guarantee of GPU acceleration; measure real frames and avoid leaving it on every element.
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
