# Codex skills installation and selection

Installed the requested Agentic Awesome Skills collection, removed 52 identical duplicate discovery entries, and configured automatic skill selection with explicit overrides. This changes local Codex configuration, not Takko application behavior.

## Installed files

Source: [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills), commit `3f81594cf0c0c497ecbd8bbb1cf47b1c94b9972f`. The checked-out package declares version 17.8.3. Installed from this pinned Git checkout using validation and copying functions from Codex's bundled skill installer. No upstream skill setup scripts were executed.

The existing `C:/Users/7474g/.agents/skills` installation contained 1,601 SKILL.md files. The upstream checkout contains 2,406. The merged installation has 2,488 discoverable entries, retaining old-only skills and supporting resources. Including local Codex and system skills, the search catalog contains 2,497 entries with unique names and paths.

The cleanup found 53 identical duplicate groups in the original installation. After updating, 52 remained identical and were removed from discovery by renaming redundant SKILL.md files to SKILL.redundant.md. Supporting files remain at their original relative locations. This avoids breaking bundled resources. Each removed entry has an identical retained name and content hash in the audit.

The remaining original duplicate name, `learn`, became two different workflows after the update. The tutoring skill retains `learn`. The project-learning workflow is now `gstack-learn`. Two community names also conflicted with Codex's built-ins. They are now `aas-skill-creator` and `aas-skill-installer`. Built-in skills retain their original names. Unique skills were preserved, including the two Roblox DBD skills. Plugin caches were not modified.

Backup: `C:/Users/7474g/.codex/skill-backups/20260920/agents-skills`. All 1,601 original SKILL.md hashes match the backup. The global AGENTS.md was originally empty and its prior state is recorded as AGENTS.md.before in the same backup folder. The immutable upstream checkout and installation audit are under `C:/Users/7474g/.codex/skill-sources`.

## Skill selection

The user's final preference is automatic selection with `$skill-name` overrides. It replaces the initially prepared ask-first preference.

`C:/Users/7474g/.codex/AGENTS.md` now instructs Codex to select the smallest relevant skill set, briefly name it, and proceed. An explicit skill name overrides automatic selection. The choice persists through follow-ups. `No skill` disables optional skill use for that task.

The new `C:/Users/7474g/.codex/skills/choose-skill/SKILL.md` supports searches across the complete installed catalog. Say `show skill choices` to request a short choice card. It does not pause ordinary prompts. This uses Codex instructions and existing question tools. It does not add a native dropdown or modify the desktop application binary. The global instruction update was reloaded into this task by Codex.

The search helper is `scripts/search.mjs` inside choose-skill. It ranks metadata keyword matches and returns real paths, names, and descriptions. Ranking is a discovery aid, not proof of suitability. The index can be regenerated with `scripts/rebuild-index.py` using the absolute bundled Python runtime documented in SKILL.md. Normal searches use Node and make no network or model calls.

[Codex's skill documentation](https://developers.openai.com/codex/skills/) describes skill instructions, explicit invocation, and invocation policy. Existing automatic invocation policies were preserved. The new chooser allows implicit invocation.

## Verification

Eight local Node tests passed, including exact-name ranking, case handling, real paths, empty and unmatched queries, repeated words, result limits, Unicode search, unique installed names and paths, and preservation of original skill identities. Log: `docs/results/codex-skills-selection-tests-final.txt`.

Codex's quick_validate.py passed for choose-skill. All 2,497 indexed skill frontmatters parsed as YAML and have string names and descriptions. The installation audit accounts for all 2,406 upstream entries and verifies the 1,601 original backup hashes. For intentionally renamed upstream entries, all remaining instruction text matches the original.

Full `npm run check` passed with exit 0. No stages skipped or retried. Exact results: 1,313 unit/API tests in 79 files, six offline combat scenarios, 14 plugin mock groups plus plugin and eight injected source compilations, six guard fixtures with expected outcomes, TypeScript/Vite build, 10 desktop tests, production smoke, and 82 browser tests. Log: `docs/results/codex-skills-full-check.txt`.

These checks establish file installation, structural validity, and search behavior. They do not establish the quality or compatibility of every third-party workflow. No fresh model-driven task has yet verified automatic selection or an override end to end. Takko's offline checks do not test Codex desktop skill routing or native Studio behavior.

## Cost and preserved state

Paid inference calls: 0. External inference cost: $0. Last recorded key allowance is $1.516651224 at 2026-09-20T20:46:57.154Z, not refreshed. Generation remains paused.

No existing Takko process was restarted or stopped. The existing listeners are 4346/PID 12300, 4345/PID 30804, 4343/PID 31044, and 4342/PID 28132. The full check's temporary 4319 service exited. No Studio session was opened and no Studio objects or mode were changed. No commit or push. Historical result files were backed up before testing, and overwritten results were archived under `docs/results/codex-skills-check-artifacts` before restoring the originals. The preservation manifest records exact counts and filenames.

Minor preparation failures were corrected without touching the installation: two incorrect documentation filenames, a missing PyYAML import, a hyphenated Python module import attempted with an underscore, and one PowerShell syntax error in a read-only duplicate scan. The corrected scan found zero byte-identical copies between user skills and the active Superpowers skill directory. PyYAML 6.0.3 was installed only under `C:/Users/7474g/.codex/skill-sources/validation-deps` for validation. No bare Python aliases were launched.
