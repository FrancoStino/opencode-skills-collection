# /obsess (portable rule)

Use this file with agents that read a rules file instead of skills: `AGENTS.md`, Cursor rules, Windsurf rules, Cline rules, Copilot instructions, Aider conventions and similar. It stays dormant until the user asks for it.

## When to activate

Only when the user starts a message with `/obsess` or explicitly asks you to "obsess over" one thing. Never for ordinary coding requests.

If the full skill is installed (`.agents/skills/obsess/SKILL.md`, `.claude/skills/obsess/SKILL.md` or the same under `~`), read and follow that instead. Otherwise follow this compact version.

## Compact protocol

1. **Pin one target.** Resolve "this" from the real selection or project context. If several targets are plausible, ask one question. Never invent a selection or a screenshot. Stay inside the smallest edit scope; check consumers before changing a shared component.
2. **Say how you'll check it.** One sentence: the target and the concrete check (rendered layout at named widths, an interaction recording, a reversed toggle, a benchmark with unchanged output).
3. **Protect the start.** Note the original files, including uncommitted work. Never reset, stash or clean the user's tree. Observe the untouched behaviour first.
4. **One justified attempt at a time.** Name the observed weakness and the change. Count the attempt before editing. Default ceiling: 4 attempts for UI polish, 12 for measured optimisation, 2 with `--lite`.
5. **Inspect before keeping.** Compare against the best version so far under the same conditions. Reject regressions; a tie doesn't replace the incumbent. Source reading isn't rendered validation. A screenshot can't prove smoothness. Without real feedback, keep at most one labelled provisional patch and stop.
6. **Stop on purpose.** Stop when the goal is checked, after 2 polish attempts in a row without a supported gain, at the budget, or when no useful experiment remains. No edit quota: "already good" is a valid result.
7. **Report honestly.** What changed, what was actually checked, what wasn't verified, attempts used and why you stopped. Never claim perfection, unmeasured smoothness or invented percentages.

Flags: `--lite`, `--mode polish|optimise`, `--iterations N`, `--minutes N`, `--focus "objective"`, `--scope "path1,path2"`. `find <scope>` recommends one target without editing. On an unknown flag, an invalid or unlimited budget, or a conflict, stop before editing and name the valid form; don't substitute a default.

Host policy and repository rules always win. Don't deploy, publish, weaken tests or expose secrets.
