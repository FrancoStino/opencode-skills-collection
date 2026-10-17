# Measured optimisation protocol

Use this only when the primary objective has a reproducible scalar evaluator. For non-scalar work use [polish](polish.md), even when the target is code. Defaults are engineering choices, not research-established optima.

## Freeze a compact contract

Use [contract.example.json](../assets/contract.example.json) as a field guide. Keep the primary objective separate from hard constraints. Record the target and authorised paths, then the baseline snapshot and comparison conditions. Choose the evaluator revision and minimum meaningful improvement before seeing candidate results.

Default ceiling: 12 candidate attempts and 30 active-session minutes. Explicit limits replace those defaults. `--lite` lowers either mode to at most 2 attempts and 5 active-session minutes, with no extra reviewers. Read [recovery](recovery.md) for cumulative accounting.

## Establish the baseline

Run the untouched version under the chosen conditions. Keep raw results and the evaluator's identity. A new candidate mustn't change the benchmark workload or weaken expected outputs.

If required baseline gates fail, don't use the scalar helper to optimise an ineligible baseline. First establish a bounded repair contract, or explicitly distinguish pre-existing unrelated failures with the user's approval. A repair target may legitimately start out failing; the original failure must remain visible in the record.

For noisy metrics, measure baseline variability and choose the repetition procedure in advance. Alternate or randomise baseline/candidate runs under comparable conditions. Retain all relevant observations, not the single fastest run. The helper's scalar threshold isn't a statistical-significance test.

Tests produced by the proposing agent aren't independent evidence just because they pass. Anchor expected behaviour to the specification or an existing trusted reference. A changed evaluator requires a new comparison epoch and re-evaluation of both versions; don't mix incompatible receipts.

## Protect each candidate

Prefer an isolated copy that includes relevant user work. Don't assume a clean Git worktree contains uncommitted inputs. Never reset, stash or clean the user's working tree. A worktree isn't a security sandbox.

Where a small supervised in-place change is appropriate, apply the snapshot and conflict checks from [polish](polish.md). Preserve the original and incumbent separately. Restore only run-owned changes; external edits cause a stop, not an overwrite.

Before editing, increment `experiments_started`. Save a candidate ID and parent ID. Record a falsifiable hypothesis and one observation that would count against it. A coherent multi-file edit is allowed when the same hypothesis requires it.

## Evaluate before promoting

Run cheap validity checks before the costly evaluator. All fixed constraints must pass and the primary improvement must be positive and meet the agreed threshold. A tie or an inconclusive result leaves the incumbent unchanged. Reject regressions even if another metric improves.

The [scalar gate](../scripts/gate.py) compares supplied receipts. It checks matching contract/evaluator identifiers and mandatory results, then a scalar delta. It doesn't execute tests, read evidence files or authenticate measurements. Only a subset of the contract is machine-checked. Never invent favourable receipts and describe the helper as verification.

A fresh-context review is optional when supported and worth the cost; it isn't required for lite. Give a reviewer the contract and evidence rather than the author's sales pitch. The same model in another role isn't an independent truth source.

Save a recoverable checkpoint before promoting the candidate. Append one [attempt record](../assets/experiment.template.json), including its lesson. Public decision summaries are enough; don't record private chain-of-thought. Keep raw logs on disk and only relevant summaries in the working context.

## Exploration and stopping

Consult previous lessons before generating another candidate. At most 4 recoverable alternatives may be retained outside lite mode. They remain separate from accepted output and mustn't violate mandatory constraints. Combining alternatives is a new attempt that needs fresh evaluation. Lite keeps only the active candidate and best checkpoint.

After 4 consecutive evaluated candidates without acceptance, use one changed approach for up to 2 remaining attempts. If neither produces a gain, stop with `plateau`. This pivot never increases the total budget. Clear the no-gain count after an acceptance.

Stop earlier for a verified terminal goal or when no testable improvement remains. Stop for cancellation, missing evaluation or exhausted resources. An environment failure permits one diagnosis and one retry within the original allowance, not repeated retries or another provider used to bypass a limit. Crashed and invalid attempts still consume the attempt budget.

## Final verification

Reserve roughly one fifth of the time allowance for final checks and reporting; this is a heuristic. Use host timeouts where available, but don't imply that Markdown can enforce process termination.

Compare the selected version with the original baseline under the unchanged contract. Use genuinely held-out data when available. A holdout consumed during selection is no longer held out. Don't try several finalists against it and call the winner an unbiased confirmation.

If a holdout fails, report that failure. Return an eligible checkpoint with its actual verification level; don't label a fallback as holdout-verified unless it was. A later development run needs a new untouched holdout. Without a holdout, label the result as checked on the available development cases only.

The final report names the actual stop reason and distinguishes observed gains from unsupported claims. See [evaluators](evaluators.md) for further evidence limits.
