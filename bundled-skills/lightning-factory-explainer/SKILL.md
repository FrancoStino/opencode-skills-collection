---
name: lightning-factory-explainer
description: Explain Bitcoin Lightning channel factories and the SuperScalar protocol — scalable Lightning onboarding using shared UTXOs, Decker-Wattenhofer trees, timeout-signature trees, MuSig2, and Taproot. No soft fork required.
risk: safe
source: community
date_added: '2026-03-03'
---

## Use this skill when

- Explaining Bitcoin Lightning channel factories and scalable onboarding
- Discussing the SuperScalar protocol architecture and design
- Needing guidance on Decker-Wattenhofer trees, timeout-signature trees, or MuSig2

## Do not use this skill when

- The task is unrelated to Bitcoin or Lightning Network scaling
- You need a different blockchain or Layer 2 outside this scope

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.

The declared community implementation at `8144225309/SuperScalar` returned HTTP 404 on 2026-10-14. Do not treat it as a verified production implementation, funded-mainnet deployment, 400-test suite or audited watchtower. The original [SuperScalar proposal](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143) is a protocol source, not proof that a similarly named repository implements it correctly.

## Purpose

Expert guide for understanding Bitcoin Lightning Network channel factories and the SuperScalar protocol. Covers scalable onboarding, shared UTXOs, Decker-Wattenhofer invalidation trees, timeout-signature trees, Poon-Dryja channels, MuSig2 (BIP-327), and Taproot — all without requiring any soft fork.

## Key Topics

- Lightning channel factories and multi-party channels
- SuperScalar protocol architecture
- Decker-Wattenhofer invalidation trees
- Timeout-signature trees
- MuSig2 key aggregation (BIP-327)
- Taproot script trees
- LSP (Lightning Service Provider) onboarding patterns
- Shared UTXO management

## References

- SuperScalar project: https://github.com/8144225309/SuperScalar
- Website: https://SuperScalar.win
- Original proposal: https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143

## Example

**User request:**

> Explain Bitcoin Lightning channel factories and scalable onboarding.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## Review evidence

Distinguish proposal properties from a specific implementation revision. Trace funding ownership, required signers, offline/liveness assumptions, timelock ordering, old-state invalidation, recovery artifacts, fee/bump behavior and unilateral exit under congestion. Define what N measures before stating complexity. Verify HTLC/PTLC and watchtower compatibility with actual protocol versions and test vectors; a claim of no consensus change does not establish deployability or safety. Use an isolated regtest fixture; signing, funding or broadcasting with real funds needs separate explicit authorization.
