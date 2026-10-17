# UI recipes

These are risk-based starting points, not mandatory exhaustive audits. Use only the recipe relevant to the request. Test the actual product rather than building an unrelated demo. The checks below don't certify WCAG compliance.

## Toggle: “make the transition super smooth”

**Goal:** improve continuity during switching while preserving correct state changes.

Inspect the current interaction before choosing a duration. Use the product's motion conventions rather than a universal “perfect” easing curve. Slower isn't automatically smoother.

| Risk to inspect | Candidate check |
|---|---|
| Motion appears to snap when interrupted | Switch on and off, then reverse while motion is still running; inspect a recording when available |
| Visual state lags behind actual state | Assert the underlying state after repeated input and inspect the endpoint |
| Cosmetic changes damage interaction | Test keyboard activation and disabled behaviour; confirm the accessible state and label |
| Motion ignores a user preference | Exercise the reduced-motion path separately and confirm state is still clear |

Prefer focused CSS transitions where they fit. Consider transform/opacity rather than layout-affecting animation, but measure actual behaviour before claiming a performance gain. Avoid adding an animation library for one toggle without a clear need. The rendering guidance comes from Google's [animation performance guide](https://web.dev/articles/animations-guide).

Keep the widget's established semantics. A switch should remain keyboard-operable with the appropriate checked state; Space is the required switch-pattern activation key, while Enter is optional. Don't accidentally fire an action twice by duplicating native keyboard handling. Refer to the [WAI-ARIA switch pattern](https://www.w3.org/WAI/ARIA/apg/patterns/switch/).

Respect the user's motion preference instead of equating “super smooth” with “more animation”. The [`prefers-reduced-motion` media feature](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion) provides that signal. Reduced-motion support still needs a behaviour check.

**Honest result:** “The captured reversal no longer visibly snaps in the tested browser; state assertions passed.” Only say this if that evidence was actually inspected. With source-only feedback, say “The patch changes the transition mechanism; rendered smoothness wasn't verified.”

## Button: “obsess over the responsive design”

**Goal:** retain a usable action when its available space changes.

Identify the component's real parent layout. A narrow grid cell can fail even in a wide viewport. Don't fix overflow with page-wide clipping or by hiding meaningful label text.

| Risk to inspect | Candidate check |
|---|---|
| Narrow layouts clip or overflow | Use a constrained parent and the smallest supported viewport; inspect the label and boundaries |
| Content changes break sizing | Try a long label and existing icon variants where present |
| Text enlargement loses content | Exercise supported text enlargement or zoom and confirm that the action remains available |
| Responsive rules change behaviour | Check keyboard focus and activation; confirm the existing disabled/loading states where present |

Begin with the project's documented support range. Without one, use 320 and 390 CSS-pixel viewports as narrow examples, plus an existing desktop layout and a constrained parent. These are starting checks, not complete device coverage. Also inspect around a changed breakpoint when relevant.

The 320 CSS-pixel case is informed by W3C's [reflow explanation](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html). Passing these local checks isn't a full accessibility assessment. Record browser zoom separately from viewport emulation; they aren't interchangeable tests.

Don't shrink text or remove focus visibility merely to make the button fit. Preserve the existing semantic button rather than replacing it with a clickable generic element. See the [WAI-ARIA button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) when custom behaviour needs review.

**Honest result:** name the exact layouts checked and what stopped clipping. Don't claim “responsive on every device”. A unit test that finds a CSS class doesn't prove that the rendered label fits.

## Spacing or other visual detail

Use the existing design tokens and compare the affected region under matching content. Preserve nearby layout behaviour. A visually preferred alternative may be useful without being objectively “more correct”.

Stop when the requested discrepancy is resolved and the relevant checks pass. Don't expand a spacing adjustment into a new component system.
