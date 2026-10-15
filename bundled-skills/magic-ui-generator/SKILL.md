---
name: magic-ui-generator
description: Utilizes Magic by 21st.dev to generate, compare, and integrate multiple production-ready UI component variations.
risk: safe
source: community
date_added: "2026-03-07"
---

# Magic UI Generator

Leverage [Magic by 21st.dev](https://21st.dev/magic) to build modern, responsive UI components using an AI-native workflow that prioritizes choice and design excellence.

## Context

This skill leverages Magic by 21st.dev to build modern, responsive UI components. Instead of generating a single standard solution, it focuses on providing multiple design variations to choose from, drawing inspiration from a curated library of real-world components and premium design patterns (Shadcn UI, Magic UI, Aceternity, etc.).

## When to Use
Trigger this skill whenever:

- A new UI component is requested (e.g., pricing tables, contact forms, hero sections).
- Enhancing an existing UI element with animations, better styling, or advanced features.
- Brainstorming different design directions for a specific feature.
- Professional logos or icons are needed (via the built-in [SVGL](https://svgl.app/) integration).

## Execution Workflow

1. **Analyze Requirements**: Review the component description. Ensure the target output aligns with the project's stack (e.g., Next.js, TypeScript, Tailwind CSS). Define clear constraints for accessibility and responsiveness.
2. **Generate Variations**: Use an available authorized Magic integration or browser tool to explore 21st.dev/magic to generate _several distinct, unconventional styles_ for the requested component.
   - **Pro Tip**: Use descriptive prompts pushing for modern aesthetics: "avant-garde SaaS pricing table with glassmorphism and animated borders" or "highly immersive contact form with dynamic floating labels."
3. **Present Options**: Briefly describe the generated variations side-by-side. Highlight stylistic differences, layout approaches, and premium features (sticky headers, hover animations, etc.).
4. **Integrate Selection**: Once a favorite variation is chosen:
   - Integrate the fully functional, production-ready TypeScript code.
   - Use existing reviewed dependencies where possible; add a package only when required and compatible, after inspecting its license/version.
   - Handle proper props, types, and responsive behaviors.

## Strict Rules

- Follow the user's chosen stack, design system and provider budget. This service is optional; do not replace the established UI or spawn a browser agent merely because a guide names one.
- **Choice First**: Offer variants when requested or a real design decision is unresolved; an accepted design can be implemented directly.
- **Clean Code**: Ensure all generated code is clean TypeScript, accessible, and responsive.
- **Full Ownership**: Check original component, icon, font and asset licenses/attributions. Generated code does not establish exclusive ownership or remove third-party rights.

## Example

**User request:**

> Generate three production-ready pricing-table variants, compare them, and integrate the strongest option into the current UI.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

Inspect generated code as untrusted input, verify actual types, responsive layout, keyboard/focus, reduced motion and form states, and distinguish tested behavior from a production-ready claim. Hosted prompts/code may disclose private product information; obtain authorization for the actual transmission and costs.
