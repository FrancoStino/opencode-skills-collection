# Run state and recovery

These conventions make a session recoverable. They don't provide an autonomous runner or tamper-proof accounting.

## Minimal run directory

```text
.obsess/<run-id>/
  run.md
  state.json
  experiments.jsonl
  snapshots/
  evidence/
```

Use a unique, filesystem-safe run ID and an authorised alternate directory when required. Resolve the location safely; never accept a run ID that escapes the run directory. Don't store secrets or commit run data by default. Keep paths in notes relative when practical.

A small polish run doesn't need a JSON contract in addition to `run.md`. The note still freezes the target and acceptance checks. Scalar optimisation can use `contract.json` because the receipt helper consumes it.

The working tree may hold a provisional candidate while the accepted snapshot remains elsewhere. Record `working_tree_status` and the active candidate explicitly so a later session doesn't confuse them.

## Cumulative accounting

Increment `experiments_started` before the first candidate edit. An interrupted or invalid candidate consumes that attempt. Increment `experiments_evaluated` when evaluation completes, including a rejection. Don't double-count an existing candidate when finishing an interrupted evaluation. A materially new candidate consumes another attempt.

Record cumulative active-session elapsed time. Setup and tool waits count, as do final checks. A deliberately closed/paused session doesn't consume inference time, but mustn't reset used minutes when resumed. If elapsed time can't be measured, store null with `elapsed_time_measured: false`, disclose the limitation and enforce the finite attempt cap as an instruction.

A wall-clock timeout cannot be guaranteed by an instruction-only skill. Host process limits are separate. A requested AUD budget can only be treated as enforced when the host actually provides current pricing and hard accounting; otherwise say the limit can't be guaranteed.

`remaining_experiments` is derived from the authorised cap minus started attempts. Don't trust a stale saved value. Only one writer should own a run. Save `state.json` atomically when possible and keep the attempt log append-only.

## Status

`status <run-id>` reads the stored state and evidence without editing target files or starting candidates. Report the last observed status, recorded usage and known remaining budget. State that the data is saved progress, not a live process. Don't fabricate missing evidence from notes that merely claim it exists.

## Resume

Read the note and state, then the relevant attempt summaries. Check actual contents against the saved baseline and incumbent. Reconcile interrupted work rather than assuming it completed. Checkpoint references and evidence must exist before relying on them.

If files have changed externally, stop and explain the conflict. Don't roll the user's work backwards. Reuse the frozen goal and checks. A changed objective requires a new run, not an unrecorded extension of the old one.

Retain all spent attempts and measured time. An exhausted allowance needs new explicit budget authorisation. Don't launch another run automatically to evade a cap. If persistence is missing, offer an in-session review but no durable resume promise.

## v0.1 migration

A v0.1 run remains an optimise-mode run under its original contract. Don't retrofit new polish limits or silently enable lite. Preserve the original snapshots and receipts.

v0.1 state recorded `experiments_evaluated` rather than `experiments_started`. Reconstruct started attempts from its append-only records, including an unfinished candidate. If the count is uncertain, stop for reconciliation rather than assuming unrecorded work was free. Retain measured elapsed time; a false measurement flag means a numeric placeholder isn't trustworthy.

Existing v0.1 scalar receipt schema remains supported. The v0.2 state schema is a record format, not an automatic migration tool.
