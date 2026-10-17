# Polish one thing

Use this for small UI improvements and non-scalar cleanup. This is a proposed workflow, not a validated claim about model performance. Read only the relevant section of [recipes](recipes.md).

## A small agreement, not a specification project

Write the target and editable paths in the [run note](../assets/run.template.md). State one objective and the essential checks. Keep it short enough to use in a small-model context.

For a toggle, the objective might be “make repeated switching feel continuous without delaying the state change”. Existing keyboard behaviour and the reduced-motion path remain constraints. For a responsive button, the goal might be to eliminate clipping in a narrow container without changing its action.

Separate the target's known defect from behaviour that mustn't regress. A clipped label can fail at baseline because that is the repair target. Record it as a baseline failure, then verify the repaired case. Don't silently treat unrelated existing failures as passing or adopt them as extra work.

Respect the existing design language. Preserve shared tokens unless changing them is explicitly within scope. Check consumers before touching a shared primitive. If local isolation isn't possible without affecting unrelated screens, explain the scope issue before widening the edit.

## Establish feedback before polishing

| Available feedback | What it can support | What it doesn't establish |
|---|---|---|
| Source inspection and static checks | A plausible implementation and code-level findings | Rendered appearance or motion quality |
| Screenshots at named sizes | Visible layout and comparison under those conditions | Temporal smoothness or functional correctness |
| Browser interaction with DOM assertions | Behaviour actually exercised in that browser | Every device or assistive technology |
| A reviewed recording or timing trace | Observations about the captured interaction | Universal frame-rate guarantees |
| Human A/B review | A preference under the stated rubric | Objective superiority or commercial outcomes |

Combine feedback types when the task requires it. Automated screenshots that nobody inspected aren't a visual review. A recording that the agent can't inspect isn't evidence that the agent observed smooth motion. Tests can't turn unknown checks into passes.

Without a browser or other suitable feedback for the primary goal, make at most one reversible proposal supported by source analysis. Mark it provisional and stop. Provide the smallest missing manual check. Don't run a second blind attempt just because there is budget left.

## Protect user work without excessive ceremony

Prefer an isolated copy that includes relevant uncommitted and untracked inputs. A clean worktree alone omits those inputs, so it isn't automatically a valid baseline.

For a small supervised edit in place, first snapshot every file that might change, including whether it existed. Keep the initial content hashes. Before each write or restoration, check that the file still matches the expected run-owned version. On external edits, stop rather than overwrite. For a new file, rollback may remove it only if its contents still match the run-owned candidate. Never use a broad reset or stash.

Keep the original snapshot and the best accepted checkpoint separate from the active candidate. A rejected patch mustn't erase an earlier accepted gain. `.obsess/` is run-owned support data, not part of the UI edit scope; use an authorised alternate location if the repository disallows it. Don't change `.gitignore` without permission.

## Review every attempt, not every possible idea

Begin with an observed weakness. State what the change should improve and which observation would show it failed. Count the attempt before changing files.

Use the smallest relevant checks first. Inspect the component in its real context and compare baseline versus candidate using the same content and environment. Additional checks should follow actual risks, not a demand to complete every recipe.

A further attempt needs a concrete remaining problem. Don't generate multiple cosmetic alternatives merely to create the appearance of effort. In lite mode, keep one hypothesis and one next action in context. No separate reviewer is required. A fresh-context review is optional only outside lite mode when tools and budget justify it; don't describe it as independent proof.

## Keep decisions tied to evidence

A candidate can become the best-supported version when all mandatory checks pass and the stated problem improves. Report the exact checked conditions. Where taste determines the choice, use an explicit A/B comparison and label the decision as a preference. Permit a tie. A user's existing authorisation to edit doesn't make the agent's aesthetic preference an objective fact.

If required evidence is missing, retain a separate provisional patch rather than promoting it to a verified checkpoint. If you leave a provisional edit in the working tree under the user's editing authorisation, record that explicitly and retain a recoverable accepted snapshot. If a preference trade-off wasn't authorised, present the alternative without replacing the user's choice.

Never add arbitrary “smoothness / 100” scores. A motion-duration change is a configuration change, not evidence of smoother rendering. Don't remove accessibility behaviour to make a screenshot cleaner.

## End early when justified

Default: at most 4 attempts within 10 active-session minutes. Lite: at most 2 within 5. Explicit non-lite budgets may override the defaults. All setup and final checks count against active-session time; the attempt cap counts invalid attempts too.

After 2 consecutive attempts with no supported gain, stop. Stop earlier when the objective is checked or further work lacks a testable basis. One reviewed improvement can be enough. Zero changes can also be the right result.

Reserve time for final checks. Recheck the chosen version against the original defect and the fixed constraints. The final report must identify whether the working tree contains an accepted result, an unverified proposal or the original. Include the actual evidence paths when available. Use the [recovery notes](recovery.md) for interrupted work.
