# Improvement plan

Fix generation first using the two saved failures. Validate chat and asset continuity next, then own StudioMCP child lifetimes. Inventory and migrate workspaces last, preserving projects, settings and encrypted keys. Commit and report after each phase.

## Scope

- In: direct generation, recoverable format errors, no-code spending stop, chat/asset regression tests, StudioMCP ownership, stable delivery/workspace migration and a current-rate acceptance estimate.
- Out: paid calls without specific approval, ending existing orphan processes without approval, restarting the user's running app without approval, mobile layouts and unrelated redesign.

## Ordered phases

- [x] Reproduce both saved planning failures and validate a compact contract derived from the actual approved proposal and selected assets.
- [x] Start one direct coding session, recover tool-envelope mistakes through validation feedback and pause further requests after the no-code spending threshold. Commit phase 1.
- [x] Exercise actual proposal/asset API results through chat tests covering replace/remove/skip, contained audio, retained picks, visible activity and Stop. Commit phase 2.
- [x] Close only StudioMCP processes owned by the exiting Takko service. Inventory existing processes and list confirmed/possible orphans for explicit termination approval. Commit phase 3.
- [x] Inventory workspace project IDs, collisions, settings and vault locations without exposing credentials. Implement and test staged migration and stable package output. Commit phase 4. Cutover remains gated on restart approval.
- [ ] Run the full offline check once after implementation and record exact results and remaining native limitations.
- [ ] Read the actual active preset and refresh its model's public rates. Show input, output, cache assumptions, review allowance and conservative request reservations before proposing a run. Replace the old $2/$3 estimate rather than reusing it.
- [ ] Request approval for one capped dummy/punch/counter run, then a separately authorized Studio test. No automatic paid retry or resumption of paused projects.

## Verification record

Phase 1 is committed after 58 focused tests across six files and TypeScript checking passed. The full check is reserved for the end. Build, Luau, plugin, guards, CSS, desktop, production, browser and Electron stages have not yet run for these changes. Work continues on later phases. No paid inference or existing-process termination has occurred. The running delivery remains unchanged until an approved update.

Phase 1 uses preserved project snapshots `6e6ffc7f` and `07a88f8e`, plus the original final worker response for the requirement overflow. The earlier duplicate-asset failure already has a production-response replay test. New tests consume the actual store migration, approved-asset linking, proposal API and billing gateway producers.

Initial focused checks caught a legacy mock that returned no files for a task with dynamically assigned paths, and a spending-stop fixture whose synthetic price exceeded its configured reservation. Both failures are preserved in the task transcript. The fixture now authors a namespaced file for that producer contract and uses conservative rates that cover its synthetic receipt. Legacy multi-task replay remains explicitly tested.

The no-code threshold is the smaller of $0.50 and one quarter of the generation allowance. It is checked before the next request after settled spend reaches the threshold. A single in-flight call can cross it, but still requires the existing conservative project/generation reservation. Explicit continuation starts a new observation window without erasing charges or expanding caps.

Offline checks do not establish live Sonnet behavior, animation playback, physical assembly or a playable exported place. The rate-based estimate and paid acceptance remain pending.

Phase 2: 64 focused tests in seven files passed, plus two new Electron journeys against the direct backend. The journeys preserve replacement and contained-sound choices through approval, and Stop/Continue preserves the same picks. Desktop build/typecheck passed. Native providers and Studio are doubled. The initial anchored test filter selected no tests, then the corrected filter ran both journeys. The full suite remains pending.

Phase 3: 28 focused Studio client/connection tests passed, including a real owned Node child whose owner exits without explicitly closing the client. Takko now tracks child process objects and closes them on normal process exit, desktop shutdown/lease expiry and server SIGINT/SIGTERM. It never enumerates processes by executable name for termination. Forced OS termination of the service cannot run JavaScript exit hooks and remains outside this guarantee. Early test attempts used the wrong client method and an invalid executable override, corrected before the passing run.

## Existing StudioMCP inventory

Read-only process ancestry inspection on 2026-09-30 UTC found no confirmed Takko orphan. Ancestor creation times were checked to exclude reused parent PIDs. All six had live application owners through cmd.exe:

| StudioMCP PID | Parent cmd PID | Live owner |
| --- | --- | --- |
| 36712 | 1372 | Codex, codex.exe PID 14540 |
| 32628 | 27276 | Codex, codex.exe PID 14540 |
| 43536 | 17996 | Codex, codex.exe PID 14540 |
| 34804 | 44688 | Codex, codex.exe PID 14540 |
| 42064 | 29572 | Claude, claude.exe PID 44624 |
| 22076 | 20780 | Claude, claude.exe PID 44624 |

None was ended. These are live-owned integrations, not proven orphans. Ending any of them needs explicit approval and a fresh PID/start-time check. The initial attribution of these six processes to old Takko builds is not supported by this inventory.

## Workspace migration

Phase 4: 11 focused migration/provider-connection tests and TypeScript checking passed. Tests cover conflicting projects, preset/profile ID remapping, source overlap, source edits invalidating a stage, real Windows DPAPI encryption and key restoration through a fresh Configuration. The synthetic conflicting-key case retains the active connection without changing either source.

`npx tsx scripts/stage-workspace.ts` staged seven distinct projects from active chat-clean (one), original AppData (five) and fresh-desktop (one). No source was changed. The staged vault reopened successfully with one encrypted connection and zero key conflicts. Active settings remain selected, other profiles/presets are retained. 191 cached-asset, preference or bridge conflicts retain the earlier source, with file paths recorded in the local migration receipt. Project/history/trace conflicts would stop staging. All original versions remain in their source workspaces.

`npm run desktop:package` now stages in `.forge/update-stage/app` by default and refuses overwriting an existing bundle. The intended one installed app is `release/Takko-win32-x64/Takko.exe`, with default `%APPDATA%/Forge Desktop` data and no workspace-switch shortcut argument.

Cutover procedure, pending approval: close the current Takko normally, verify both source and stage fingerprints with `npx tsx scripts/stage-workspace.ts --verify`, and restage if anything changed. Preserve original AppData as an explicit rollback sibling before installing the staged workspace. Install the staged app at the stable release path and retarget the Desktop shortcut. Launch once and verify all seven projects, active preset and encrypted connection restoration, then close and relaunch to verify persistence. Keep the previous working delivery and source workspaces until that passes. Never resume a project or call a paid provider during migration verification. Studio stays open. No cutover has happened yet.
