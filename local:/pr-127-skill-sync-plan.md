## Context

PR FrancoStino/opencode-skills-collection#127 ("Align our vendored skill copy with upstream: fifteen tools today, 0.4.9 stays the pinned review", autore happy520ai, stato OPEN) modifica un solo file generato, `bundled-skills/unified-ai-gateway/SKILL.md`: front-matter `description` da "nine" a "fifteen governed MCP tools" e riscrittura della sezione "Version Note" per distinguere release corrente (`v0.8.0`, quindici tool) da immagine pinnata e revisionata (`0.4.9`, nove tool). L'autore stesso ha revertato nel secondo commit la prima idea (cambiare i "nine" nei passi di setup) perché quei passi descrivono l'immagine pinnata `0.4.9`. I bot di review (cubic, greptile, coderabbit-skipped, sonarqube-passed) hanno sollevato 5 finding; il repo non ha issue aperte (`gh issue list` vuoto), quindi "le issues" sono questi finding. End state: un verdetto valid/invalid per ogni finding, radicato nel pipeline reale (sync → index → vault → pointer → patch), e l'azione corretta per la PR (merge/close/convert), senza modifiche al working tree in questa fase.

## Approach

1. Inventariare i finding della PR con citazione esatta e stato.
   - Raccogliere dal thread PR 127: cubic review 1 (commit `bfa4bb0`: description/Tool Map incoerenti a 15 vs 9), i due commenti `greptile_outside_diff` (descrizione indice `skills_index.json` ferma a nine; comando `node tools/verify-image-roster.mjs 0.8.0` non eseguibile dal repo), cubic review 2 (commit `c67d837`: hand-edit di file generato spazzato dal nightly sync; Version Note che dice "9 dei quindici nomi" mentre Tool Map/Workflow elencano `knowledge_readiness`, `workflow_health`, `workflow_actions`), più il commento chiarificatore dell'autore (2026-09-26T13:55Z) e il Quality Gate Sonar passato. Nessuna modifica: solo lettura via `gh pr view 127 --comments` e `gh pr diff 127`.
2. Tracciare ogni finding nel pipeline effettivo, funzione per funzione.
   - Index-vs-pointer: verificare in `src/skill-pointer/vault-installer.ts` (`loadSkillsIndex` preferisce `skills_index.json`) e `src/skill-pointer/pointer-generator.ts` (`buildPointerContent`/`generatePointers` usano `entry.description` dall'indice, mai il front-matter di `SKILL.md`) che il disallineamento descrizione indice/SKILL.md segnalato da greptile è reale e visibile nei pointer `ai-ml-category-pointer/SKILL.md`.
   - File generato: verificare in `.github/workflows/sync-skills.yml` (step `rm -rf bundled-skills` + `bunx agentic-awesome-skills` + `curl .../skills_index.json` da `sickn33/agentic-awesome-skills`) e in `AGENTS.md` ("destroyed and regenerated nightly") che qualunque hand-edit a `bundled-skills/` viene perso al sync, come sostiene cubic review 2.
   - Roster command: verificare che `tools/verify-image-roster.mjs` non esiste in questo repo (`ls`, `aft_search` per `verify-image-roster`) e che il comando è documentato per la root del repo upstream `happy520ai/unified-ai-system`, come dice il README upstream linkato dalla skill.
   - Patch runtime: verificare in `src/skill-pointer/index.ts` (`runSkillPointer`: `loadSkillsIndex` → `filterIndex` → `installSkillsToVault` → `applySkillPatches` → `generatePointers`) e in `src/skill-pointer/skill-patcher.ts`/`config-loader.ts` che l'unico override locale consentito per contenuto skill è `skillPatches[]` da `~/.config/opencode/skill-filter.jsonc`, senza costanti skill-specific hardcoded in sorgente (regola architetturale vigente).
3. Verificare il ground truth upstream senza fidarsi delle frasi nella PR.
   - Scaricare via HTTP (nessun clone): `https://github.com/happy520ai/unified-ai-system/blob/master/skills/unified-ai-gateway/SKILL.md` (o raw) e confrontare `description` e Version Note con la copia vendored; scaricare la voce `unified-ai-gateway` da `https://raw.githubusercontent.com/sickn33/agentic-awesome-skills/main/skills_index.json` e controllare se dice nine o fifteen. Se la rete lo consente, eseguire il comando di riproduzione dell'autore (`node tools/verify-image-roster.mjs 0.8.0` → 15, `0.4.9` → 9) da un clone depth-1 di `happy520ai/unified-ai-system` in `/tmp`, mai nel working tree.
4. Emettere il verdetto per ogni finding (valid/invalid, una riga di ragione + ancora di codice).
   - Verdetti attesi (da confermare al passo 3, non da assumere): (a) greptile index-sync VALIDO — i pointer mostrano la descrizione indice; (b) greptile roster-path VALIDO — lo script non è nel bundle; (c) cubic "generated file hand-edit" VALIDO e bloccante per il merge così com'è; (d) cubic review-1 (incoerenza 15 vs 9) SUPERATO dal secondo commit ma la tensione resta e va giudicata contro il roster reale di `0.4.9`; (e) cubic review-2 (Tool Map con tool post-0.5.0 sotto pin 0.4.9) da verificare contro il roster reale: se `0.4.9` espone davvero i nove nomi elencati nel Tool Map, il finding è INVALIDO, altrimenti VALIDO. Non aprire nuove questioni oltre queste cinque.
5. Decidere l'azione sulla PR e scriverla come raccomandazione operativa, senza toccare codice.
   - Se il passo 3 conferma che l'upstream `happy520ai` dice già fifteen e il pin `0.4.9` è corretto: raccomandare CLOSE senza merge della PR (hand-edit su file generato verrebbe spazzato dal sync) e spostare il fix dove appartiene — upstream `sickn33/agentic-awesome-skills` (voce indice + copia skill) oppure attesa del nightly sync se `sickn33` ha già recepito; in alternativa, solo se serve un override locale immediato, fornire all'utente uno snippet `skillPatches` per il suo `skill-filter.jsonc`, mai un commit in `bundled-skills/`. Non proporre costanti hardcoded in `src/`, non proporre modifiche a `pointer-generator.ts`, non proporre di committare `skills_index.json` a mano.

## Critical files & anchors

- `bundled-skills/unified-ai-gateway/SKILL.md` — il file generato toccato dalla PR (front-matter riga 3, Version Note righe 27-39, Tool Map righe 170-180).
- `src/skill-pointer/pointer-generator.ts` — `buildPointerContent`/`generatePointers`: i pointer usano la descrizione dall'indice.
- `src/skill-pointer/vault-installer.ts` — `loadSkillsIndex`: l'indice vince sul front-matter.
- `.github/workflows/sync-skills.yml` — step Sync skills + Download index: prova che `bundled-skills/` è rigenerato.
- `src/skill-pointer/skill-patcher.ts` + `config-loader.ts` — `applySkillPatches`/`SkillPatch`: unico override locale lecito.

## Verification

- `gh pr diff 127 --repo FrancoStino/opencode-skills-collection` mostra solo `bundled-skills/unified-ai-gateway/SKILL.md` (+18/-6 sull'ultimo commit).
- `python3 -c` su `skills_index.json`: voce `unified-ai-gateway` con `description` a nine mentre lo `SKILL.md` della PR dice fifteen → disallineamento indice/skill confermato.
- `aft_search({query: "verify-image-roster"})` nel repo dà zero risultati → comando roster non eseguibile dal bundle confermato.
- Confronto byte: `diff` tra `bundled-skills/unified-ai-gateway/SKILL.md` locale e `SKILL.md` raw upstream `happy520ai/unified-ai-system` mostra se la PR allinea davvero o diverge.
- Ogni verdetto del passo 4 cita file+simbolo che lo prova; la raccomandazione finale è una sola fra close / convert-to-upstream / convert-to-skillPatches-snippet.

## Verdetti (catena completa verificata 2026-09-26)

Anelli: (1) origine happy520ai/unified-ai-system SKILL.md = description fifteen + Version Note nuova (v0.8.0 quindici vs pin 0.4.9 nove) + setup nove + step 8 chiarito ('nine of the fifteen names') + Tool Map a 15 voci marcate (9 senza marca = 0.4.9, 3 marcate 0.5.0, 3 marcate 0.8.0). (2) intermedio sickn33/agentic-awesome-skills = description fifteen, index fifteen (totale 2472 voci), MA skill file incoerente: Version Note vecchia ('both v0.4.9'), setup a 15 ('If the 15 tools', 'all 15 tools') contro immagine pinnata 0.4.9 da nove, Tool Map fermo a nove. (3) questo repo = fermo a nine ovunque (SKILL.md + skills_index.json, totale 2008 voci): copia stale pre-fix. (4) runtime = loadSkillsIndex preferisce skills_index.json (vault-installer.ts:80-82), generatePointers usa entry.description (pointer-generator.ts:19-21): il disallineamento indice/skill e visibile nei pointer.

- cubic review-1 (commit bfa4bb0, setup a 15 incoerente): SUPERATO/STALE, autore ha revertato nel secondo commit.
- greptile P1 'Pinned Server Has Nine Tools': STALE per lo stesso revert (riferito al primo commit).
- cubic+greptile 'hand-edit di bundled-skills/': VALIDO e bloccante (sync-skills.yml:25-26 rm -rf + AGENTS.md generated).
- greptile 'Sync Discovery Tool Count' (indice nine vs skill fifteen): VALIDO come sintomo, ma il fix non e un commit a mano qui: sickn33 ha gia indice fifteen, basta il nightly sync.
- greptile 'Provide Runnable Roster Command': PARZIALMENTE VALIDO (script assente dal bundle), ma il comando arriva pari pari dall'origine: va contestualizzato upstream, non bundlando lo script qui.
- cubic review-2 'Tool Map con knowledge_readiness/workflow_health/workflow_actions sotto pin 0.4.9': INVALIDO. L'origine marca come 0.5.0 solo knowledge_retrieve/workflow_run/gateway_prompt_enhance_llm e come 0.8.0 i tre agent_governance_*: i nove senza marca includono esattamente knowledge_readiness, workflow_health, workflow_actions. Il bot confonde readiness/health con retrieval/execution.
- La PR (secondo commit c67d837) e un cherry-pick parziale dell'origine: porta description + Version Note ma NON step-8 chiarito ne Tool Map esteso ne grep semplificati. Mergiarla qui = snapshot parziale spazzato dal sync + nuovo disallineamento.

Azione: CLOSE senza merge della #127. Fix vero in sickn33 (revendor completo da happy520ai: Version Note, setup a nove, step 8, Tool Map a 15); l'indice sickn33 e gia a fifteen. Poi il nightly sync allinea questo repo (skill + indice). Nessun skillPatches locale, nessuna costante hardcoded.

## Assumptions & contingencies

- Assunzione: `sickn33/agentic-awesome-skills` è l'upstream di sync per skill e indice (dal workflow). Se durante l'esecuzione risulta che `unified-ai-gateway` arriva da un altro canale (es. `source_repo: happy520ai/unified-ai-system` vendored diretto), seguire il canale reale trovato nel workflow e nei log di sync invece di `sickn33`.
- Assunzione: il roster 15/12/9 per 0.8.0/0.7.0/0.4.9 dichiarato dall'autore è riproducibile. Se `verify-image-roster.mjs` non gira (rete/Docker assenti), marcare i verdetti dipendenti dal roster come `unverified — confirm first` invece di indovinare.
- Se upstream `sickn33` ha già recepito il fix mentre si esegue il piano, la raccomandazione diventa "chiudere la PR e lasciare fare al nightly sync" senza ulteriori azioni.
