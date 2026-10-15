---
name: check-identity-pack
description: Run an AFP 100-point or AUSTRAC safe-harbour identity check over a set of documents, and report exactly what's missing. Use when the user asks to check identity documents, verify someone's ID for onboarding, or assess whether a document pack satisfies Australian identity requirements.
category: document-verification
risk: critical
source: community
source_repo: Sketchjar/stipple-agent-skills
source_type: community
date_added: "2026-08-31"
author: Sketchjar
tags: [document-verification, fact-checking, stipple, authenticity]
tools: [claude, cursor, gemini, codex]
license: "Apache-2.0"
license_source: "https://github.com/Sketchjar/stipple-agent-skills/blob/main/LICENSE"
---

# Check Identity Pack

Run an AFP 100-point or AUSTRAC safe-harbour identity check over a document set. Reports the points attained, per-document status, and **exactly what's missing** — so the user can request only the absent documents and re-run. Uses an external Stipple API; verify current access, costs and data-processing terms before uploading.

## When to use

- Onboarding employees, tenants, contractors, or customers in Australia
- KYC flows needing AFP 100-point or AUSTRAC safe-harbour compliance
- "Do these documents satisfy the 100-point check?"

## Instructions

1. **Get the documents.** Multiple file paths or URLs (PDF/images): passport, driver's licence, medicare card, bank statement, utility bill, etc.

2. **Choose the scheme:**
   - `afp_100_point` — the provider’s AFP checklist mode; it is not a universal Australian onboarding rule
   - `austrac_safe_harbour` — a provider mode name, not proof of current AUSTRAC due-diligence compliance

3. **Run the check.** POST the document set (multipart, multiple `files` parts):

   ```bash
   curl --fail --show-error --silent --max-time 30 -X POST "https://www.stipple.sh/v1/identity-check?scheme=afp_100_point" \
     -F "files=@passport.pdf" \
     -F "files=@medicare-card.jpg" \
     -F "files=@bank-statement.pdf" \
     -H "Authorization: Bearer $STIPPLE_API_KEY"
   ```

4. **Interpret the response.**

   - `status` — complete / incomplete / failed
   - `points_total` — points attained (e.g. 95/100)
   - `checks[]` — per-document: type detected, point value, status
   - `missing[]` — **exactly what is missing** (e.g. "evidence of current residential address within last 3 months")

5. **Report with the gap list front and centre.** The product here is the *exactly-what's-missing* list — the user's onboarding UX can loop on it: request only what's absent, re-run, done.

6. **Important caveat.** Document consistency checking proposes an identity association — it does NOT answer *is this document genuine*. A forged passport that matches the name scores points. For genuineness, pair with the `verify-document` skill on each document first.

## Output format

```
AFP 100-point check: incomplete

  points attained: 95/100
  - passport: 70 pts — ok
  - medicare_card: 25 pts — ok

  exactly what is missing:
    -> evidence of current residential address within last 3 months
```

## Limitations and Safety

- This workflow uploads identity and address documents to a hosted third-party
  service. Obtain the user's explicit approval before transmission, minimize the
  files and fields sent, and confirm the provider's current retention, residency,
  access, and deletion terms for the intended jurisdiction.
- A points result is an aid to review, not a legal KYC/AML determination. Verify
  scheme rules against current AFP, AUSTRAC, and organizational requirements and
  keep a qualified human reviewer responsible for the onboarding decision.
- Never treat a passing score as proof that a document is genuine or that the
  named person controls it; run independent authenticity and liveness checks where
  the decision warrants them.

## Notes

- Costs/allowances are provider-specific and mutable; check current pricing rather than assuming two credits or free checks
- Use the actual applicable scheme/version and document acceptance rules; do not sum generic type weights without duplicate, category, expiry, address and identity-consistency rules. The 70+25=95 example is arithmetic only, not a completed legal decision. See [AFP’s checklist](https://www.afp.gov.au/sites/default/files/PDF/NPC-100PointChecklist-18042019.pdf) and [current AUSTRAC customer due diligence](https://www.austrac.gov.au/industry-and-business/obligations-and-guidance/your-amlctf-program/customer-due-diligence).
- The check maps documents to the scheme and reports gaps — it does not verify document authenticity (use `verify-document` for that)
- Free key at https://www.stipple.sh for metering beyond the anonymous allowance
