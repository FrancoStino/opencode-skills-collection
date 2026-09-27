## Context

PR FrancoStino/opencode-skills-collection#127 edita `bundled-skills/` (rigenerato ogni notte, mai da mergiare) e va chiusa senza merge. Il fix vero appartiene a `sickn33/agentic-awesome-skills` (upstream del nightly sync): la sua copia `skills/unified-ai-gateway/SKILL.md` dice fifteen in description ma ha Version Note vecchia ("both v0.4.9"), setup a 15 contro immagine pinnata 0.4.9 da nove, Tool Map fermo a nove. L'origine `happy520ai/unified-ai-system` è già coerente (setup a nove, step 8 chiarito, Tool Map a 15 voci marcate per versione). End state: PR aperta da fork `FrancoStino/agentic-awesome-skills` verso `sickn33:main` con revendor completo, validazioni verdi, #127 chiusa con link.

## Approach

1. Prepara workspace fuori dal working tree e fissa gli SHA base (sola lettura).
   - `mkdir -p /tmp/revendor && cd /tmp/revendor`.
   - `FORK_HEAD=$(gh api repos/FrancoStino/agentic-awesome-skills/git/ref/heads/main --jq .object.sha)`; `UP_HEAD=$(gh api repos/sickn33/agentic-awesome-skills/git/ref/heads/main --jq .object.sha)`.
   - Scarica tarball del fork: `curl -fsSL https://github.com/FrancoStino/agentic-awesome-skills/archive/$FORK_HEAD.tar.gz -o fork.tgz && tar xzf fork.tgz`. Se il file `skills/unified-ai-gateway/SKILL.md` nel fork differisce da quello sickn33 (confronta con `gh api repos/sickn33/agentic-awesome-skills/contents/skills/unified-ai-gateway/SKILL.md --jq .sha` decodificando), vedi Assumptions.
2. Riscrivi `skills/unified-ai-gateway/SKILL.md` come revendor completo dall'origine.
   - Rileggi fresca l'origine: `curl -fsSL https://raw.githubusercontent.com/happy520ai/unified-ai-system/master/skills/unified-ai-gateway/SKILL.md -o /tmp/revendor/upstream.md`. Se differisce dallo snapshot verificato il 2026-09-26 (description fifteen, Version Note v0.8.0-vs-0.4.9, setup nove, Tool Map 15 voci marcate), usa la versione fresca e segnalalo nel riepilogo.
   - Corpo del file: copia byte-identica del body upstream (incluse le righe `grep -RInHE`/`grep -RInE` semplificate e lo step 8 "nine of the fifteen names").
   - Frontmatter: NON copiare il blocco `metadata:` nidificato di happy520ai; converti in formato flat sickn33 (obbligatorio: CI source-validation rifiuta chiavi sotto `metadata`). Frontmatter esatto, top-level: `name: unified-ai-gateway`, `description:` (quella fifteen upstream), `category: ai-ml`, `risk: critical`, `source: https://github.com/happy520ai/unified-ai-system/tree/master/skills/unified-ai-gateway`, `source_repo: happy520ai/unified-ai-system`, `source_type: official`, `date_added: "2026-08-01"` (invariato, skill non nuova), `author: happy520ai`, `tags: [ai-gateway, codex, mcp, self-hosted, governance]`, `tools: [codex]`, `license: Apache-2.0`, `license_source: https://github.com/happy520ai/unified-ai-system/blob/master/LICENSE`.
   - Non toccare mai `CATALOG.md`, `skills_index.json`, `data/*.json` (Source-Only PR).
3. Valida nel tarball estratto con gli script reali del repo (nomi da confermare in `package.json` del tarball; attesi per prassi repo: `validate`, `security:docs`, `validate:references`).
   - `python3 -m venv .venv && .venv/bin/pip install pyyaml` poi gli script npm del repo. Tutti devono uscire 0; se un nome script non esiste, usa l'equivalente trovato in `package.json` e annotalo; se una validazione fallisce, STOP senza aprire la PR e riporta l'errore.
4. Crea commit via GitHub API sul fork (SafeGuard blocca `git clone/push`: flusso git-less obbligatorio).
   - Branch: `revendor-unified-ai-gateway`. Unico file: `skills/unified-ai-gateway/SKILL.md`.
   - `BLOB=$(python3 -c "import base64,json,sys;print(json.dumps({'content':base64.b64encode(open('skills/unified-ai-gateway/SKILL.md','rb').read()).decode(),'encoding':'base64'}))" | gh api repos/FrancoStino/agentic-awesome-skills/git/blobs -X POST --input - --jq .sha)` (JSON via stdin, mai base64 in argv: E2BIG oltre ~96KB).
   - Tree con `base_tree=$FORK_HEAD`, commit con `parents=[$FORK_HEAD]` messaggio `Revendor unified-ai-gateway from upstream: fifteen tools, 0.4.9 stays pinned`, ref `refs/heads/revendor-unified-ai-gateway` sul fork. Tutto via `gh api ... --input -` con JSON da stdin.
5. Apri la PR verso sickn33 e chiudi la #127.
   - `gh pr create --repo sickn33/agentic-awesome-skills --head FrancoStino:revendor-unified-ai-gateway --base main --title "Revendor unified-ai-gateway from upstream: fifteen tools, 0.4.9 stays pinned"` con body = template `.github/PULL_REQUEST_TEMPLATE.md` compilato: Skill PR spuntata, Quality Bar Checklist spuntata sulle voci applicabili (Standards, Metadata, Risk Label critical, Triggers, Limitations, Safety scan via security:docs, Skill Review, Manual Logic Review, Local Test, Source-Only PR, License provenance Apache-2.0+license_source), più nota che description/index erano già fifteen e che questo allinea Version Note/setup/Tool Map. Abilita "Allow edits from maintainers" (verifica via web se il flag non è esposto da CLI).
   - Commenta `FrancoStino/opencode-skills-collection#127` con link alla nuova PR e chiudila senza merge (`gh pr close 127 --repo FrancoStino/opencode-skills-collection --comment "..."`).
   - Pulisci `/tmp/revendor` e `.venv` solo a PR aperta e verificata.

## Critical files & anchors

- `skills/unified-ai-gateway/SKILL.md` in sickn33: regioni da sostituire — Version Note "both v0.4.9", step 2 "If the 15 tools", step 8 "all 15 tools", Tool Map a nove voci (implementer rilegge prima di scrivere).
- `https://raw.githubusercontent.com/happy520ai/unified-ai-system/master/skills/unified-ai-gateway/SKILL.md`: sorgente del body, da rifetchare fresca.
- `.github/PULL_REQUEST_TEMPLATE.md` in sickn33: corpo PR obbligatorio con Quality Bar Checklist, Source-Only PR senza artefatti generati.
- `package.json` nel tarball sickn33: nomi reali degli script di validazione da usare al passo 3.
- Fork `FrancoStino/agentic-awesome-skills` (figlio di sickn33, già esistente): unico target di scrittura API.

## Verification

- `gh pr view <N> --repo sickn33/agentic-awesome-skills --json files`: un solo file `skills/unified-ai-gateway/SKILL.md`.
- Validazioni passo 3 con exit 0 (riporta output sintetico).
- `gh pr view 127 --repo FrancoStino/opencode-skills-collection --json state` = CLOSED, commento con link alla PR sickn33 presente.
- `diff <(body nuovo senza frontmatter) /tmp/revendor/upstream-body` vuoto a meno di frontmatter.

## Assumptions & contingencies

- Se il file nel fork differisce da sickn33:main sullo stesso file (fork stale con edit concorrenti): confronta le regioni; se il 3-way merge GitHub può risolvere (regioni diverse), procedi e segnalalo; se tocca le stesse righe, STOP e riporta il conflitto invece di forzare.
- Se `merge-upstream` fork→upstream via API ritorna 422 (manca scope `workflow` e upstream toccò workflow): ignoralo, una PR da branch stale va bene se non confligge (caso noto).
- Se l'origine happy520ai è cambiata rispetto allo snapshot 2026-09-26: usa la fresca e aggiorna i verdetti di conseguenza, non la vecchia.
- Se `npm run security:docs` segnala le righe docker/grep dello skill: usa i marker allowlist esatti con rule-id a fine riga (lo scanner copre tutti i file di testo, non solo SKILL.md).
