# Component validation

Machine-readable classification is in `tools/config/maintenance-policy.json`; the [maintenance contract](maintenance-contract.md) specifies authority and full release verification.

| Profile | Work |
| --- | --- |
| editorial | Documentation consistency/references and docs security |
| catalog | Global schema, warning budget, source credits, ephemeral indexes, references, catalog integrity, docs security |
| runtime | Catalog checks plus runtime, installer and packaging tests |
| web | Catalog checks plus web coverage/build |
| distribution | Exact prepared snapshot, schema/references/security/plugin/bundle/catalog integrity; full product validation on immutable candidate |
| full | Global checks, complete script tests and web coverage/build |

Unknown, mixed, operational skill, executable/link/mode, policy, workflow, generator or shared-dependency changes are full. A complete ordered receipt must contain every planned successful check. PR workflow required names remain unchanged; no path-filtered required workflow is introduced.

Use `npm run pr:preflight -- --base origin/main --head HEAD` from a committed source head. The helper validates a clean isolated copy. Direct `maintenance:validate` execution rejects a dirty checkout or different HEAD. Generated previews are temporary development state; tracked distribution snapshots may intentionally lag source main.

Measure whole cycles separately from individual command timings. See the maintenance contract for controls, raw timestamp evidence and manual intervention accounting.
