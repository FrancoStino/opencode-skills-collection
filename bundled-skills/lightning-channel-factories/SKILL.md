---
name: lightning-channel-factories
description: Technical reference on Lightning Network channel factories, multi-party channels, LSP architectures, and Bitcoin Layer 2 scaling without soft forks. Covers Decker-Wattenhofer, timeout trees, MuSig2 key aggregation, HTLC/PTLC forwarding, and watchtower breach detection.
risk: safe
source: community
date_added: '2026-03-03'
---

## Use this skill when

- Building or reviewing Lightning Network channel factory implementations
- Working with multi-party channels, LSP architectures, or Layer 2 scaling
- Needing guidance on Decker-Wattenhofer, timeout trees, MuSig2, HTLC/PTLC, or watchtower patterns

## Do not use this skill when

- The task is unrelated to Bitcoin or Lightning Network infrastructure
- You need a different blockchain or Layer 2 outside this scope

## Instructions

- Clarify goals, constraints, and required inputs.
- Apply relevant best practices and validate outcomes.
- Provide actionable steps and verification.

The declared community implementation at `8144225309/SuperScalar` returned HTTP 404 on 2026-10-14. Do not treat it as a verified production implementation, funded-mainnet deployment, 400-test suite or audited watchtower. The original [SuperScalar proposal](https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143) is a protocol source, not proof that a similarly named repository implements it correctly.

## Purpose

Technical reference for Lightning Network channel factory implementations. Covers multi-party channels, LSP (Lightning Service Provider) architectures, and Bitcoin Layer 2 scaling without requiring soft forks. Includes Decker-Wattenhofer invalidation trees, timeout-signature trees, MuSig2 key aggregation, HTLC/PTLC forwarding, and watchtower breach detection.

## Key Topics

- Channel factory implementation in C
- MuSig2 (BIP-327) and Schnorr adaptor signatures
- Encrypted Noise NK transport protocol
- SQLite persistence layer
- Watchtower breach detection
- HTLC/PTLC forwarding
- Regtest, signet, testnet, and mainnet support
- Actual implementation tests, vectors and reproducible exit behavior

## References

- SuperScalar project: https://github.com/8144225309/SuperScalar
- Website: https://SuperScalar.win
- Original proposal: https://delvingbitcoin.org/t/superscalar-laddered-timeout-tree-structured-decker-wattenhofer-factories/1143

## Example

**User request:**

> Build or reviewing Lightning Network channel factory implementations.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## Review evidence

Distinguish proposal properties from a specific implementation revision. Trace funding ownership, required signers, offline/liveness assumptions, timelock ordering, old-state invalidation, recovery artifacts, fee/bump behavior and unilateral exit under congestion. Define what N measures before stating complexity. Verify HTLC/PTLC and watchtower compatibility with actual protocol versions and test vectors; a claim of no consensus change does not establish deployability or safety. Use an isolated regtest fixture; signing, funding or broadcasting with real funds needs separate explicit authorization.
