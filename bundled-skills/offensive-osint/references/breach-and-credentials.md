# Breach Data, Email-Pattern Inference, Email Harvest

> **AAS adaptation:** Read the authorization gate in [the skill](../SKILL.md) before any target request, credential use, or data collection. These are reference examples, not an instruction to run a sweep. Select only explicitly approved targets and techniques; set request, time, byte and concurrency limits and stop on errors or scope changes. Preserve TLS verification. Treat discoveries, pattern matches and historical provider claims as leads, not verified ownership, permission or severity. Minimize personal data and redact credentials before reports; do not send private evidence to public services. Prices, quotas, API shapes and tool availability require current official documentation. Changes and original source hashes are recorded in [the notice](../UPSTREAM-NOTICE.md).


> Reference content for the `offensive-osint` skill. Originally §15 + §11 + §12 of the monolithic SKILL.md (refactored 2026-05-02 for size/load efficiency).

## 15. Breach & Leak Data

- [Have I Been Pwned](https://haveibeenpwned.com/) — breach lookup; Pwned Passwords API (k-anonymity).
- [Dehashed](https://dehashed.com/) — credential search (paid).
- [IntelX](https://intelx.io/) — data intelligence.
- [LeakCheck](https://leakcheck.io/), [Snusbase](https://snusbase.com/), [BreachDirectory](https://breachdirectory.org/), [Scattered Secrets](https://scatteredsecrets.com/), [Phonebook](https://phonebook.cz/), [LeakPeek](https://leakpeek.com/).
- [Cavalier (Hudson Rock)](https://cavalier.hudsonrock.com/) — historical infostealer-log lookup reference; verify current access, costs and lawful purpose before use.

### 15.0.1 HudsonRock Cavalier — direct API recipe

The web UI wraps a historical JSON API shape. Verify current official access rules; use only an authorized identifier and minimize returned personal data:

```bash
# By domain (canonical first call)
curl -sS -m 30 "https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-domain?domain=target.com" | jq .

# By email (single-account check)
curl -sS -m 30 "https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-email?email=alice@target.com" | jq .

# By URL (when target's app is the breach victim)
curl -sS -m 30 "https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-url?url=https://app.target.com" | jq .
```

PowerShell:
```powershell
$hr = Invoke-RestMethod -Uri "https://cavalier.hudsonrock.com/api/json/v2/osint-tools/search-by-domain?domain=$D" -TimeoutSec 30
"Employees: $($hr.employees) | Users: $($hr.users) | Third-party: $($hr.third_parties) | Total: $($hr.total)"
$hr.data.employees_urls | Sort-Object -Property occurrence -Descending | Select-Object -First 20
$hr.data.clients_urls   | Sort-Object -Property occurrence -Descending | Select-Object -First 15
```

**Top-level JSON fields:**
- `total` — total stealer entries touching this domain.
- `totalStealers` — global stealer-log corpus size (context only).
- `employees` — count of `<*>@<domain>` accounts found.
- `users` — count of accounts where the domain appeared as a *visited* URL (customers/vendors).
- `third_parties` — accounts touching adjacent domains in the org.
- `data.employees_urls[]` — `{occurrence, type, url}` — internal apps where employees were logging in when stolen. **Subdomain hits here = recon gold.**
- `data.clients_urls[]` — same shape; user-facing apps (often reveals undocumented public portals).
- `data.stealer_families[]` — `{_key, _value}` → which stealer (RedLine / Lumma / StealC / Vidar / Raccoon).
- `data.dates_compromised[]` — `{_key, _value}` → temporal distribution.

**Historical provider caveats (not verified current guarantees):**
- Subdomain hostnames in `data.*_urls[]` past the first few are **redacted with asterisks** (`*****.target.com`). Pivot to paid Cavalier tier or other sources for unredacted.
- Free endpoint returns counts + sample URLs only. Cleartext passwords + emails are **never** in the free response.
- Rate limit ~1 req/sec/IP; 429 on burst. Sleep 1s between calls.
- For unredacted creds + bulk enumeration → paid Cavalier portal.

**Severity mapping (per §15.1 + §15.2):** Counts prioritize owner review only. Neither ten entries nor a historical mail migration proves current compromise, password reuse or active SSO access.

### 15.1 Domain-Level Breach Severity Mapping

When you query a breach corpus by domain, map the result to severity like so:

| Stat | Severity |
|---|---|
| ≥ 10 historical employee matches | Owner-review priority; impact unconfirmed |
| 1–9 historical employee matches | Owner-review priority; impact unconfirmed |
| ≥ 1 historical end-user match | Verify identity, timestamp and relevance |
| Domain seen in breach with 0 named accounts | **INFO** |

**Employees vs end-users distinction:** a target-domain address is a candidate association, not proof of current employment. A customer-associated address is not proof of password reuse — useful for credential-stuffing risk awareness but not directly compromising the target's identity fabric.

### 15.2 SSO_EXPOSURE finding

When a discovered SSO tenant (Entra GUID / Okta slug / Google Workspace domain) intersects with the breach corpus on its domain → candidate historical-exposure correlation, severity pending owner confirmation of current impact. Evidence: tenant ID + product + employee count + per-account source attribution.

**Legacy-mail-decommissioned pattern (high-value variant):**

If `mail.<domain>` / `webmail.<domain>` returns **NXDOMAIN today** but HudsonRock/HIBP corpus still has historical employee credentials against it AND `autodiscover.<domain>` resolves to Microsoft IPs (M365) or `aspmx.l.google.com` MX (Workspace), migration is a hypothesis requiring independent evidence. Historical credentials do not prove password reuse, current liveness, employee identity or MFA bypass. Report dated historical exposure; ask the owner to check rotation, session revocation and MFA, without trying leaked passwords.

Concrete triggers (all three together):
1. `Resolve-DnsName mail.<domain> -Type A` → NXDOMAIN (legacy gone)
2. HudsonRock corpus has employee URLs against the *old* host (e.g. `mail.<domain>/names.nsf` for Lotus Domino, `mail.<domain>/owa/` for Exchange, `mail.<domain>/iwaredir.nsf` for iNotes, `mail.<domain>/zimbra/` for Zimbra)
3. Current MX → M365 / Google Workspace / Zoho cloud (DNS suggests current mail hosting, not migration or password reuse)

Evidence pack: tenant GUID + breach count + 3+ legacy URLs from corpus + autodiscover Microsoft IPs + current MX. Recommend forced password rotation + MFA audit + Conditional Access review.

---


## 11. Email-Pattern Inference (TENTATIVE candidates)

Given a `(first_name, last_name, domain)`, generate these 8 candidate addresses for breach pre-hits, phishing list curation, and downstream enrichment. Mark as **TENTATIVE** confidence until corroborated.

```
{first}.{last}@{domain}        # john.doe@example.com
{first}{last}@{domain}         # johndoe@example.com
{first}@{domain}               # john@example.com
{first[0]}{last}@{domain}      # jdoe@example.com
{first}.{last[0]}@{domain}     # john.d@example.com
{last}@{domain}                # doe@example.com
{first}_{last}@{domain}        # john_doe@example.com
{first}-{last}@{domain}        # john-doe@example.com
```

Lowercase before lookup. Strip diacritics for ASCII fallback. If the org uses a known pattern (e.g., Hunter.io shows `{first}.{last}` is dominant), prioritize that pattern, but keep each unverified individual address TENTATIVE.

---

## 12. Email-Harvest Source Stack

Select the authorized sources; deduplicate by address while retaining source, date and confidence. Do not automatically query all providers:

1. **IntelX phonebook API** — 2-step search + poll. Largest single source for breach-era addresses.
2. **Hunter.io** — domain-search endpoint. Verify current quotas and the provider’s meaning of “verified”; provider labels are not independent employee confirmation.
3. **crt.sh** — extract X.509 SAN extensions. Many certs include admin/contact emails.
4. **DuckDuckGo SERP scrape** — HTML scrape of `"@{target-domain}"` results.
5. **Bing SERP scrape** — same query, complementary index.
6. **Wayback CDX** — historic snapshots of the target's homepage / contact / about pages often contain emails removed from the live site.

**Email regex:**
```regex
\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b
```

**Noise filter (reject numeric-only locals):**
```regex
^[0-9]+$
```
Do not discard numeric-only local parts automatically: they are valid addresses. Treat this as an optional noise heuristic with an explicit exclusion log.

---
