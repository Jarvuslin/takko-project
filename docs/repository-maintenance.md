# Repository maintenance

Keep source, tests, dependency locks, build tools, research findings and real regression evidence in Git. Keep builds, runtime workspaces, credentials, downloaded third-party evidence and routine test output out of Git.

## Documentation

Start with `README.md`, `docs/README.md` and `research/notes/continuation.md`. Update an existing topical document when possible. Update `docs/cleanup.md` for repository maintenance results. Do not create a new implementation report, plan, handoff and state snapshot for every small task. Substantial distinct work may justify one concise report.

Git retains superseded reports. Before removing tracked files, commit outstanding work, inspect references from code and tests, and preserve any unique factual findings in current documents or an explicitly identified historical commit. The pre-cleanup report set is at `4622b0f`. Read a removed report with `git show 4622b0f:docs/<filename>.md`.

## App and workspace

The only retained bundle is `release/takko-chat-clean-20260929/Takko-win32-x64`. Its existing shortcut selects `.forge/chat-clean-20260929`. `%APPDATA%/Forge Desktop` and all other project-bearing workspaces remain intact.

Do not create a dated user-facing app or an empty delivery workspace for each task. The intended stable workspace is `%APPDATA%/Forge Desktop`, but migration must first reconcile projects/settings and validate encrypted-key access. Cleanup did not perform that migration. Until it is implemented, preserve the active bundle and workspace. App replacement requires explicit restart approval while running.

Packaging currently refuses to overwrite an existing bundle. Do not work around that by making another permanent dated delivery. Future update work must stage a build, validate it and replace the stable delivery only when safe. Test-only temporary workspaces must be isolated, clearly disposable and removed by their owner after use.

## Evidence and disk cleanup

- Never create `.forge/evidence-backup-*`, `*-check-before` or whole evidence-tree copies. Git is the backup for tracked files.
- Keep paid-run receipts, original failures, native observations, regression inputs and third-party originals. Do not delete a directory merely because its name says scratch or before.
- Remove inactive generated bundles only after checking live executable paths and confirming no user data is inside.
- Remove duplicate untracked evidence only after comparing it with a retained original. Keep unmatched files for review.
- Keep all projects, settings, vaults and uncertain exports until ownership and recovery are understood. Never inspect or copy a plaintext key.
- Put regenerable check output under ignored `test-artifacts/`. Existing test workspaces under `.forge/e2e-projects` are test-owned.
- Do not delete diagnostic scripts solely because `package.json` does not call them. Tests import some directly, and native investigations use others.

## Checks

Fresh Windows setup is in the root README. Run focused checks during implementation and `npm run check` once at the end. These are offline checks, not native gameplay verification. Record failures as well as reruns. No model spending, app restart or Studio session is implied by a cleanup request.
