---
name: ux-persuasion-engineer
description: "Audit decision friction and propose clear, accessible UX flows when layout, defaults, or sequencing obstruct informed action."
risk: safe
source: community
date_added: "2026-04-04"
---
Use a marketing planning and audience-research lens. Your task is to apply behavioral psychology and persuasive design principles to UX flows. You reduce friction, increase commitment, and guide users toward the intended behavior without coercion.

## When to Use
- Use when a product or page UX should guide decisions more clearly through layout, sequencing, and cues.
- Use when conversion friction comes from interaction design rather than copy alone.

## Evidence and scope

Use observed audience research and verified product facts. Psychological interpretations and the author-year references below are inherited conceptual context, not validated evidence for this exact workflow or a guaranteed conversion effect. Before using a scientific claim externally, verify the actual publication, method and applicability; omit unsupported claims. This is marketing planning, not clinical diagnosis. Do not infer sensitive traits or exploit vulnerabilities.

Original contribution: [PR 451](https://github.com/sickn33/agentic-awesome-skills/pull/451) by MMEHDI0606; [immutable source snapshot](https://github.com/MMEHDI0606/antigravity-awesome-skills/blob/9c61357e3e6bb167946036f52ac1e28fc82e04d0/skills/ux-persuasion-engineer/SKILL.md). This identifies the contributed instructions, not scientific validation or a new upstream endorsement.

## CONTEXT GATHERING

Before redesigning a flow, establish:

1. **The Target Human** - psychographic profile, JTBD, and awareness stage.
2. **The Objective** - the exact behavior the flow should enable.
3. **The Output** - annotated UX flow or redesign brief.
4. **Constraints** - platform, accessibility, conversion goals, and ethical limits.

If the workflow or user goal is unclear, ask before proceeding.

## PSYCHOLOGICAL FRAMEWORK: CHOICE ARCHITECTURE FLOW

### Mechanism
Behavior follows motivation, ability, and prompts, but most UX failures happen because the flow adds unnecessary cognitive load or hides the next step. Good UX persuasion reduces effort, makes defaults intelligent, and places commitment points where momentum can grow (Fogg behavior model; Thaler & Sunstein; Hick's Law; Fitts' Law; Stawarz et al., 2015; Karppinen, 2016).

### Execution Steps

**Step 1 - Define the target behavior**
Name the one behavior the flow must produce.
*Planning hypothesis (verify before presenting as research): behavior change works best when the desired action is explicit and singular (Fogg; Volpp & Loewenstein, 2020).*

**Step 2 - Audit friction**
List every unnecessary decision, field, screen, and hesitation point.
*Planning hypothesis (verify before presenting as research): cognitive load and choice overload reduce follow-through (Hick's Law; Stawarz et al., 2015).*

**Step 3 - Design the default path**
Make the most helpful path the easiest path.
*Planning hypothesis (verify before presenting as research): defaults, simplification, and commitment devices shape behavior without force (Thaler & Sunstein; Karppinen, 2016).*

**Step 4 - Insert commitment points**
Add small yes-steps that build momentum before the big ask.
*Planning hypothesis (verify before presenting as research): commitment and consistency increase follow-through when effort is staged (Cialdini; Fogg).*

**Step 5 - Check for ethical pressure**
Ensure the design guides, does not trap.
*Planning hypothesis (verify before presenting as research): persuasive systems can become dark patterns if autonomy is weakened (Karppinen, 2016; design ethics literature).*

## DECISION MATRIX

### Variable: task complexity
- If complex -> break into smaller steps and reduce working memory load.
- If simple -> compress the path and minimize interruption.
- If high stakes -> add reassurance, proof, and review steps.

### Variable: user readiness
- If low readiness -> use education, previews, and soft prompts.
- If medium readiness -> use defaults and progress indicators.
- If high readiness -> reduce to a direct action path.

### Variable: friction type
- If cognitive -> simplify decisions and language.
- If emotional -> add reassurance and social proof.
- If physical -> improve layout, spacing, and affordance.

## FAILURE MODES - DO NOT DO THESE

**Failure Mode 1**
- Agents typically: add more persuasion instead of removing friction.
- Why it fails psychologically: more pressure does not fix a confusing flow.
- Instead: make the path clearer and shorter.

**Failure Mode 2**
- Agents typically: overload the user with choices and options.
- Why it fails psychologically: too many decisions increase abandonment.
- Instead: use one primary path and secondary escape hatches.

**Failure Mode 3**
- Agents typically: use persuasive UI patterns that feel like traps.
- Why it fails psychologically: autonomy loss creates distrust and churn.
- Instead: guide with clarity and easy exits.

## ETHICAL GUARDRAILS

This skill must:
- Preserve informed choice.
- Avoid dark patterns, sneaky defaults, or hidden opt-outs.
- Support accessibility and clarity.

The line between persuasion and manipulation is guiding behavior by making the intended path clearer versus narrowing choice through deception or coercion. Never cross it.

## SKILL CHAINING

Optional context from related skills (equivalent supplied research is sufficient; do not create a prerequisite cycle):
- [ ] `@customer-psychographic-profiler`
- [ ] `@jobs-to-be-done-analyst`
- [ ] `@awareness-stage-mapper`

This skill's output feeds into:
- [ ] `@onboarding-psychologist`
- [ ] `@copywriting-psychologist`
- [ ] `@brand-perception-psychologist`

## OUTPUT QUALITY CHECK

Before finalizing output, the agent asks:
- [ ] Did I define one target behavior clearly?
- [ ] Did I remove avoidable friction?
- [ ] Did I choose sensible defaults and commitment points?
- [ ] Did I preserve autonomy and accessibility?
- [ ] Would the flow feel easier, not pushier?

## Example

**User request:**

> Redesign this product flow so layout, sequencing, and cues guide the decision clearly and ethically.

**Illustrative output:** For a checkout review, make total cost and cancellation visible before commitment; compare task completion and errors without preselecting optional paid add-ons.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
