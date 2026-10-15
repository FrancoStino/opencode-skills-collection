---
name: lightning-architecture-review
description: Review Bitcoin Lightning Network protocol designs, compare channel factory approaches, and analyze Layer 2 scaling tradeoffs. Covers trust models, on-chain footprint, consensus requirements, HTLC/PTLC compatibility, liveness, and watchtower support.
risk: safe
source: community
date_added: '2026-03-03'
---

## Use this skill when

- Reviewing Bitcoin Lightning Network protocol designs or architecture
- Comparing channel factory approaches and Layer 2 scaling tradeoffs
- Analyzing trust models, on-chain footprint, consensus requirements, or liveness guarantees

## Do not use this skill when

- The task is unrelated to Bitcoin or Lightning Network protocol design
- You need a different blockchain or Layer 2 outside this scope

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.

The declared community implementation at `8144225309/SuperScalar` returned HTTP 404 on 2026-10-14. Do not treat it as a verified production implementation, funded-mainnet deployment, 400-test suite or audited watchtower. The original [SuperScalar proposal](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143) is a protocol source, not proof that a similarly named repository implements it correctly.

## Purpose

Expert reviewer for Bitcoin Lightning Network protocol designs. Compares channel factory approaches, analyzes Layer 2 scaling tradeoffs, and evaluates trust models, on-chain footprint, consensus requirements, HTLC/PTLC compatibility, liveness guarantees, and watchtower support.

## Key Topics

- Lightning protocol design review
- Channel factory comparison
- Trust model analysis
- On-chain footprint evaluation
- Consensus requirement assessment
- HTLC/PTLC compatibility
- Liveness and availability guarantees
- Watchtower breach detection
- Explicitly defined exit transaction count, state/update depth, timelocks and fee assumptions

## References

- SuperScalar project: https://github.com/8144225309/SuperScalar
- Website: https://SuperScalar.win
- Original proposal: https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143

## Example

**User request:**

> Review Bitcoin Lightning Network protocol designs or architecture.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## Review evidence

Distinguish proposal properties from a specific implementation revision. Trace funding ownership, required signers, offline/liveness assumptions, timelock ordering, old-state invalidation, recovery artifacts, fee/bump behavior and unilateral exit under congestion. Define what N measures before stating complexity. Verify HTLC/PTLC and watchtower compatibility with actual protocol versions and test vectors; a claim of no consensus change does not establish deployability or safety. Use an isolated regtest fixture; signing, funding or broadcasting with real funds needs separate explicit authorization.
