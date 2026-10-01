# Working in Takko

Read README.md and docs/README.md for setup and the source map. Takko is desktop-only.

- Use one agent per working copy. Use isolated worktrees for explicitly requested parallel work.
- Keep changes focused. Commit finished work with a clear message. Push only when requested.
- Run focused tests while working, then `npm run check` before reporting completion. Do not describe partial checks as a full pass.
- Preserve regression coverage. Use actual producer contracts and retained input fixtures for integration bugs.
- Keep diagnosis documents, run summaries, reports and historical research out of this repository. Keep only durable setup documentation, source and necessary test fixtures. Generated check output belongs in ignored `test-artifacts/`.
- Commit before deleting tracked files. Check references before removing source or assets. Never delete unknown local workspaces, exports, settings or encrypted vaults.
- Do not kill, restart or replace a running Takko or Studio session without user approval. Check process ownership and listening ports before starting services.
- Desktop user data belongs in `%APPDATA%/Forge Desktop`. Package into `.forge/update-stage/app`. Replace an installed delivery only after approved shutdown and retain one rollback until verified.
- Never print, log or commit provider keys. Do not persist plaintext credentials. `.env.example` is the only committed environment file.
- No paid inference without explicit authorization for the specific run and a spending cap. Account for every call and failed attempt. Never silently retry a paid trial or expand its budget.
- Preserve `FORGE_*`, the `Forge Desktop` storage directory and `plugin/Forge.plugin.luau` identifiers.
- The app stops at ready to test. Compilation, contracts and model reviews do not prove a working game. Native Studio verification is separate.
- Build inside the generated namespace. After Studio tests, remove probes, restore scripts, stop test-owned services and leave Studio in Edit mode.
- On Windows, do not launch bare `python`, `python3` or `py`. They may invoke Microsoft Store aliases.
- Keep generated exports in `.forge/exports/` or a user-selected location.

Fresh checkout: `npm ci`, `./scripts/setup-luau.ps1`, `npx playwright install chromium`, then set `LUAU_BIN_DIR` to `.forge/tools/luau`.

`npm run check` runs build, Vitest, Luau tests, plugin tests, guards, CSS lint, desktop lifecycle tests, production smoke, browser journeys and Electron journeys. Tests use mocked inference. Report the actual result and any skipped stages in the conversation, without creating a report file.
