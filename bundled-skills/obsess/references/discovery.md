# Find one worthwhile target

`find <scope>` is read-only. Use the named scope or an actual selected artefact. It doesn't authorise a later edit. Read relevant repository instructions before inspecting it.

Spend at most 5 active-session minutes and consider at most 4 possible targets. Prefer evidence close to the user's concern. Don't scan an entire repository because one button was mentioned. Don't execute unfamiliar scripts before checking what they do.

For each plausible target, note the observed issue and the smallest way to verify a fix. Distinguish a reproduced defect from a suspicion. Consider verification cost as well as user impact; a tiny inspectable improvement may be a better starting point than a speculative redesign.

Return one recommendation. Name the relevant file or component and explain the observation. State whether a proposed run would be polish or optimise, with the necessary tool limitations. Other findings can remain a short backlog; they aren't permission to work on every item.

A useful recommendation might be a toggle whose reversal visibly snaps, or a button label that clips in a constrained parent. These are examples, not observations about the user's project.

Don't use invented numeric scores to rank subjective issues. If no justified opportunity is found, say so. Lack of browser access may limit discovery to source-level hypotheses. A new `run` needs the user's editing authorisation for that target.
