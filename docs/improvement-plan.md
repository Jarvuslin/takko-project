# Improvement plan

Fix generation first using the two saved failures. Validate chat and asset continuity next, then own StudioMCP child lifetimes. Inventory and migrate workspaces last, preserving projects, settings and encrypted keys. Commit and report after each phase.

## Scope

- In: direct generation, recoverable format errors, no-code spending stop, chat/asset regression tests, StudioMCP ownership, stable delivery/workspace migration and a current-rate acceptance estimate.
- Out: paid calls without specific approval, ending existing orphan processes without approval, restarting the user's running app without approval, mobile layouts and unrelated redesign.

## Ordered phases

- [x] Reproduce both saved planning failures and validate a compact contract derived from the actual approved proposal and selected assets.
- [x] Start one direct coding session, recover tool-envelope mistakes through validation feedback and pause further requests after the no-code spending threshold. Commit phase 1.
- [ ] Exercise actual proposal/asset API results through chat tests covering replace/remove/skip, contained audio, retained picks, visible activity and Stop. Commit phase 2.
- [ ] Close only StudioMCP processes owned by the exiting Takko service. Inventory existing processes and list confirmed/possible orphans for explicit termination approval. Commit phase 3.
- [ ] Inventory workspace project IDs, collisions, settings and vault locations without exposing credentials. Implement and test reversible migration and stable staged updates. Do not switch a running app until restart approval. Commit phase 4.
- [ ] Run the full offline check once after implementation and record exact results and remaining native limitations.
- [ ] Read the actual active preset and refresh its model's public rates. Show input, output, cache assumptions, review allowance and conservative request reservations before proposing a run. Replace the old $2/$3 estimate rather than reusing it.
- [ ] Request approval for one capped dummy/punch/counter run, then a separately authorized Studio test. No automatic paid retry or resumption of paused projects.

## Verification record

Phase 1 is committed after 58 focused tests across six files and TypeScript checking passed. The full check is reserved for the end. Build, Luau, plugin, guards, CSS, desktop, production, browser and Electron stages have not yet run for these changes. Work continues on later phases. No paid inference or existing-process termination has occurred. The running delivery remains unchanged until an approved update.

Phase 1 uses preserved project snapshots `6e6ffc7f` and `07a88f8e`, plus the original final worker response for the requirement overflow. The earlier duplicate-asset failure already has a production-response replay test. New tests consume the actual store migration, approved-asset linking, proposal API and billing gateway producers.

Initial focused checks caught a legacy mock that returned no files for a task with dynamically assigned paths, and a spending-stop fixture whose synthetic price exceeded its configured reservation. Both failures are preserved in the task transcript. The fixture now authors a namespaced file for that producer contract and uses conservative rates that cover its synthetic receipt. Legacy multi-task replay remains explicitly tested.

The no-code threshold is the smaller of $0.50 and one quarter of the generation allowance. It is checked before the next request after settled spend reaches the threshold. A single in-flight call can cross it, but still requires the existing conservative project/generation reservation. Explicit continuation starts a new observation window without erasing charges or expanding caps.

Offline checks do not establish live Sonnet behavior, animation playback, physical assembly or a playable exported place. The rate-based estimate and paid acceptance remain pending.
