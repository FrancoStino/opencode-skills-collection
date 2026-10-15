---
name: find-matching-tenders
description: Find open AU/NZ government tenders matching what a company does, ranked by fit with why and gap analysis. Use when the user asks to find tenders, bid opportunities, government contracts, or RFPs for their business (or a client's).
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

# Find Matching Tenders

Search live AU/NZ government tenders, rank them against what a company actually does (read from its website), and explain why each opportunity is relevant — including the capability gaps to prepare evidence for. The examples use the third-party Stipple API. Verify current access requirements, pricing and feed availability before relying on it.

## When to use

- Business development: "find tenders we could bid on"
- Market research: "what government work is out there for cybersecurity firms in NSW?"
- Bid pipeline maintenance: "check for new construction tenders this week"

## Instructions

1. **Get the company profile.** Ask for the company's website URL. If the user provides a description instead, skip resolution and use their description directly as capability context.

2. **Resolve the company** (optional but improves matching):

   ```bash
   curl --fail-with-body --connect-timeout 10 --max-time 30 -X POST https://www.stipple.sh/v1/companies/resolve \
     -H "Content-Type: application/json" \
     -d '{"query": "https://your-company.com"}'
   ```

   Returns the company's registered name, ABN, jurisdiction, and status.

3. **Search open tenders** (verify current access requirements):

   ```bash
   curl --fail-with-body --connect-timeout 10 --max-time 30 "https://www.stipple.sh/v1/tenders?q=construction&jurisdiction=AU&limit=10"
   ```

   Filters: `q` (keyword), `jurisdiction` (AU, AU-NSW, AU-VIC, NZ, ...), `limit`, `offset`.

4. **Rank against the company** (optional; verify cost and obtain authorization for any paid request):

   ```bash
   curl --fail-with-body --connect-timeout 10 --max-time 30 -X POST https://www.stipple.sh/v1/tenders/match \
     -H "Content-Type: application/json" \
     -d '{"url": "https://your-company.com", "jurisdiction": "AU", "limit": 5}'
   ```

   Returns ranked matches with `why[]` (why it fits) and `gaps[]` (capability evidence to prepare).

5. **Check data provenance** if results seem thin:

   ```bash
   curl --fail-with-body --connect-timeout 10 --max-time 30 "https://www.stipple.sh/v1/tenders/sources"
   ```

   Shows which government feeds are indexed and their freshness — explains why a search can be empty.

6. **Report honestly.** Match scores are *fit signals*, not win probabilities. Present `gaps[]` as "prepare evidence for this", not disqualification.

## Output format

The following is an illustrative format, not a live search result. Replace counts, dates and links with verified current results and include the retrieval time.

```
Found 403 open tenders matching "construction" (AU/NZ)

#1 [AU-NSW] Digital platform modernisation services
    buyer:  NSW Department of ...
    why:    matches 'cloud migration', 'API integration' from your services
    gap:    no evidence found for 'ICT security assessment'
    closes: 2026-09-15
    https://...

#2 [NZ] ...
```

## Limitations and Safety

- The hosted service receives the search terms and, for matching, the supplied
  company URL or description. Obtain approval before sending private capability or
  client information and do not include secrets or non-public bid strategy.
- Feed coverage and freshness can be incomplete. Confirm eligibility, scope,
  amendments, deadlines, and submission instructions on the issuing authority's
  primary tender page before investing time or submitting a bid.
- Match scores and gap analysis are triage signals, not procurement advice, an
  eligibility ruling, or a probability of winning.

## Notes

- Verify current pricing, quotas and authentication with the service; do not promise permanent free access.
- Configure recurring monitoring only when the user requests it, with an agreed schedule and notification policy.
- Data sources: NZ GETS, NSW eTendering, VendorPanel, and other government feeds
