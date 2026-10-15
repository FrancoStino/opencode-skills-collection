---
name: emblemai-crypto-wallet
description: "Crypto wallet management across 7 blockchains via EmblemAI Agent Hustle API. Balance checks, token swaps, portfolio analysis, and transaction execution for Solana, Ethereum, Base, BSC, Polygon, Hedera, and Bitcoin."
risk: critical
source: "EmblemCompany/Agent-skills (MIT)"
date_added: "2026-03-06"
---

# EmblemAI Crypto Wallet

Use the provider only for explicitly authorized wallet operations. The chain/endpoint list is historical reference, not a live capability or custody guarantee; verify current official provider documentation and account permissions before use.

## When to Use
- User wants to check crypto wallet balances
- User wants to swap or trade tokens
- User wants portfolio analysis or token research
- User wants to interact with DeFi protocols
- User needs cross-chain wallet operations

## Setup

This AAS entry is an integration index; the full external references/scripts are not bundled. If installation is requested, review an immutable source/version and its dependency/signing behavior before activating it:

```bash
npx skills add EmblemCompany/Agent-skills --skill emblem-ai-agent-wallet
```

Or install the npm package directly:

```bash
npm install @emblemvault/agentwallet
```

## Supported Chains

| Chain | Operations |
|-------|-----------|
| Solana | Balance, swap, transfer, token lookup |
| Ethereum | Balance, swap, transfer, NFT |
| Base | Balance, swap, transfer |
| BSC | Balance, swap, transfer |
| Polygon | Balance, swap, transfer |
| Hedera | Balance, transfer |
| Bitcoin | Balance, transfer |

## API Integration

Base URL: `https://api.agenthustle.ai`

Authentication requires an API key passed as `x-api-key` header.

### Core Endpoints

- `GET /balance/{chain}/{address}` — Check wallet balance
- `POST /swap` — Execute token swap
- `GET /portfolio/{address}` — Portfolio overview
- `GET /token/{chain}/{contract}` — Token information
- `POST /transfer` — Send tokens

## Key Behaviors

1. **Exact transaction authorization** — before signing/submitting, show chain/network, verified token/asset address, source wallet, recipient, amount, fees, slippage, minimum received, approvals/allowance, spender, expiry and actual simulation result; obtain confirmation for that exact transaction. A quote/portfolio request does not authorize a swap or transfer
2. **Check balances first** before attempting swaps or transfers
3. **Verify asset identity** independently using authoritative chain/explorer/project sources; a third-party rugcheck score is advisory and cannot prove legitimacy
4. **Report gas estimates** when available
5. **Protect credentials and verify custody** — never send private keys or seed phrases through chat, logs or unapproved APIs. Provider claims about server-side vault signing need verification; do not guarantee custody architecture from this index

## Links

- [Full skill with references](https://github.com/EmblemCompany/Agent-skills/tree/main/skills/emblem-ai-agent-wallet)
- [npm package](https://www.npmjs.com/package/@emblemvault/agentwallet)
- [EmblemAI](https://agenthustle.ai)

## Limitations
- If signing, broadcasting or confirmation times out, preserve the transaction/idempotency reference and reconcile actual chain state before retrying; do not risk a duplicate transfer. Finality, failed execution, quote expiry and rejected simulation must be reported distinctly.
- A balance/quote is read-only advice, not transaction authorization; approvals and unlimited allowances are separate risky actions. No wallet, account, provider call or transaction was executed during content review.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
