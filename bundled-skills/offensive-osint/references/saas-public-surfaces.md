# Public SaaS Collaboration Surfaces

> **AAS adaptation:** Read the authorization gate in [the skill](../SKILL.md) before any target request, credential use, or data collection. These are reference examples, not an instruction to run a sweep. Select only explicitly approved targets and techniques; set request, time, byte and concurrency limits and stop on errors or scope changes. Preserve TLS verification. Treat discoveries, pattern matches and historical provider claims as leads, not verified ownership, permission or severity. Minimize personal data and redact credentials before reports; do not send private evidence to public services. Prices, quotas, API shapes and tool availability require current official documentation. Changes and original source hashes are recorded in [the notice](../UPSTREAM-NOTICE.md).


> Reference content for the `offensive-osint` skill. Originally §24 + §25 + §26 of the monolithic SKILL.md (refactored 2026-05-02 for size/load efficiency).

## 24. Postman Public Workspace Universal Search

Postman's public-search endpoint is a historical web-search implementation, not a supported API contract or completeness guarantee.

**Historical endpoint example (verify current official support and permitted use first):**

```bash
curl -sS -m 15 \
  "https://www.postman.com/_api/ws/proxy" \
  -H 'Content-Type: application/json' \
  -H 'X-Entity-Team-Id: 0' \
  -d '{
    "service":"search",
    "method":"POST",
    "path":"/search-all",
    "body":{
      "queryIndices":["collaboration.workspace","runtime.collection","runtime.request"],
      "queryText":"acme.com",
      "size":100,
      "from":0,
      "clientTraceId":"",
      "queryAllIndices":false,
      "domain":"public"
    }
  }' | jq '.data[]'
```

This proxies through Postman's web app to their internal search service. Pagination via `from` (0, 100, 200, ...).

**If the proxy shape changes** (it has historically): inspect a real search request from the Postman web UI:
1. Open `https://www.postman.com/explore` in a browser.
2. Open DevTools → Network tab.
3. Search for any term.
4. Find the request to `_api/...` — copy as cURL — adapt.

**Per-workspace walk:**

For each matching workspace ID:

```bash
WS_ID="<workspace-id>"
# Workspace metadata (name, description, team, visibility)
curl -sS -m 10 "https://www.postman.com/_api/workspace/$WS_ID" | jq .

# List collections + environments + monitors in workspace
curl -sS -m 10 "https://www.postman.com/_api/workspace/$WS_ID/collection" | jq '.[].id'
curl -sS -m 10 "https://www.postman.com/_api/workspace/$WS_ID/environment" | jq '.[].id'

# Per-collection: full content (requests, headers, scripts, env vars)
COL_ID="<collection-id>"
curl -sS -m 10 "https://www.postman.com/_api/collection/$COL_ID" | jq '.collection.item[]'
```

**Ownership scoring signals:**
- Creator/team name mentions target domain or brand → strong.
- Workspace name/description mentions target → strong.
- Request URLs contain `*.target.com` → candidate association only; examples, third-party workspaces and impersonation can mention the same URLs.

**Run secret catalog (§17) over every text blob extracted** from the requests, env vars, pre-request scripts, and test scripts.

---

## 25. Stack Exchange OSINT Sweep

Stack Exchange and its sister sites collect code paste-ins from developers — many include secrets, internal hostnames, and proprietary code excerpts.

**Sites to query (8 with highest signal):**
```
stackoverflow.com
serverfault.com
dba.stackexchange.com
devops.stackexchange.com
security.stackexchange.com
superuser.com
sharepoint.stackexchange.com
salesforce.stackexchange.com
```

**API:**
```
GET https://api.stackexchange.com/2.3/search/advanced
   ?site=<site>
   &q=<target>
   &filter=withbody
   &pagesize=100
```

**Code block extraction regex:**
```regex
<pre><code>([\s\S]*?)</code></pre>
```
(Stack Exchange wraps code in `<pre><code>` HTML.)

**Pipeline:**
1. Search each site for the target name, brand, root domain.
2. Extract code blocks from `body` HTML.
3. Run secret catalog (§17) over each block.
4. Cross-reference post author email (where exposed in profile) against email_osint discoveries — is only a lead; verify identity and employment independently, minimize personal data and do not infer authorship from a name/email match.
5. Extract hostnames from code blocks → upsert as `subdomain` assets.

**Quota:** Stack Exchange API returns quota and may return backoff fields; consult current official API limits and obey response-directed backoff. A fixed two-second delay is not a quota guarantee.

---

## 26. Public SaaS Collaboration Surfaces

Many SaaS collaboration tools allow public sharing. Dork them like search engines.

**Platforms with public-sharing features (no incident-rate claim):**
```
trello.com
notion.so / notion.site
*.atlassian.net           (Jira / Confluence)
miro.com
asana.com
clickup.com
airtable.com
```

**Dork template:**
```
site:{platform} "{target-keyword}"
```

**Run via search-engine adapter** (DDG default; Bing / Brave / Yandex / SerpAPI optional). The same classification logic from §18.7 applies.

**Common findings:**
- Public Trello board with credentials in card titles or attached config files.
- Public Notion page with internal SOPs, API keys in code blocks, customer data.
- Public Confluence space with onboarding docs containing seed creds.
- Public Miro board with architecture diagrams revealing internal hostnames.

---
