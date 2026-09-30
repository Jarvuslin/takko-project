# Repository cleanup

Completed 2026-09-30 UTC. Removed about **38.21 GB (35.58 GiB)** of inactive bundles and duplicate evidence. Cleanup did not fix generation, migrate workspaces or update the running app. Paid cost: **$0**.

## What changed

- Removed 24 inactive bundles, leaving only `release/takko-chat-clean-20260929`.
- Removed 149,876 byte-identical backup files under `.forge`, each compared against its retained counterpart in `docs/results`. Preserved all 30 unmatched files.
- Removed 147 superseded top-level task reports after committing a recovery checkpoint. Reduced top-level documentation from 157 Markdown files to 13, including the new map, cleanup report and improvement plan.
- Rewrote the README, research index, old TODO checklist and duplicated agent state into current entry points. Retained factual research, original run evidence and test fixtures.
- Updated `AGENTS.md` and desktop guidance to prohibit dated delivery workspaces, copied evidence trees and multiple reports per small task. New exports belong outside the source root.
- Corrected `C:/Users/7474g/OneDrive/Desktop/Takko.lnk`, which pointed to the obsolete September 23 bundle. It now selects the current bundle and existing chat-clean workspace. Target and arguments were read back and verified without launching the app.

## Removal accounting

| Category | Files removed | Logical bytes removed |
| --- | ---: | ---: |
| 24 inactive generated app bundles | 2,546 | 9,560,779,839 |
| Identical evidence copies | 149,876 | 28,648,201,524 |
| Total generated/duplicate output | 152,422 | 38,208,981,363 |
| Historical task reports, retained in Git | 147 | 1,367,445 |

These are summed file lengths, not a measurement of filesystem allocation or net drive free-space change. New test output and small replacement documents are excluded. Files were deleted, not moved to another archive. Git history was not pruned.

The removed bundles were every immediate directory under `release/` except `takko-chat-clean-20260929`. Duplicate cleanup covered these `.forge` directories:

| Directory | Identical files removed | Unmatched files kept |
| --- | ---: | ---: |
| `approval-stall-evidence-before` | 14,428 | 0 |
| `evidence-backup-animation-resume-20260927` | 13,688 | 0 |
| `evidence-backup-approved-reference-finish-20260927` | 13,906 | 0 |
| `evidence-backup-asset-selection-20260926` | 5,534 | 28 |
| `evidence-backup-demo-export-20260927` | 5,794 | 0 |
| `evidence-backup-fresh-generation-fixes-20260928` | 14,112 | 0 |
| `evidence-backup-instance-path-replication-20260928` | 14,005 | 0 |
| `evidence-backup-planner-recovery-run13-20260927` | 5,929 | 0 |
| `evidence-backup-planner-sweep-20260927` | 6,078 | 0 |
| `evidence-backup-question-modal-20260928` | 14,348 | 2 |
| `evidence-backup-run13-live-20260927` | 5,962 | 0 |
| `evidence-backup-runtime-diagnostics-20260927` | 6,288 | 0 |
| `evidence-backup-world-policy-20260928` | 14,240 | 0 |
| `scope-answer-reuse-evidence-before` | 15,564 | 0 |

## Preserved by request

The user explicitly chose to keep the uncertain files and workspaces:

- Both root `Takko-Fighting-Review-20260927*.rbxlx` exports and their source folder.
- `.forge/refresh-before-checkout` and older runtime workspaces. `.forge` now has 213 immediate directories, down from 225. A name alone is not proof that a workspace is disposable.
- The 28 unmatched asset-selection backup files: 26 screenshots plus `guard-evaluation.json` and `production-smoke.json`.
- The two differing question-modal backup records at `world-policy-20260928/live/COSTS.md` and `RESULTS.md`.

All project/settings directories, encrypted vaults, retained original evidence, deny-dispatch flags and paid-run records remain. The 66 scripts remain because many are test imports or native diagnostics. The 32 top-level research Markdown files retain distinct findings. No plaintext key was read, copied or printed.

## App and workspace

The retained executable is `release/takko-chat-clean-20260929/Takko-win32-x64/Takko.exe`. The desktop shortcut and existing `Start Takko Clean.lnk` select `.forge/chat-clean-20260929`.

Original `%APPDATA%/Forge Desktop` remains separate, with five project JSON files and its encrypted vault. Chat-clean and fresh-desktop each contain one project JSON. Cleanup does not claim those workspaces are consolidated or that key restoration has been retested.

At the final check, Takko main PID 29192 and service PID 45400 remained on port 64119. Studio PID 45456 remained open. No existing app or Studio process was stopped or restarted. Six StudioMCP processes remained from the seven observed initially. This task did not stop any of them. Test port 4319 was released. Ports 4318, 4324, 4335, 4336, 4340 and 62514 were also free. No native Studio session was performed.

## Verification

One complete `npm run check` passed with exit code 0. No stages skipped or reruns required:

- Build and TypeScript checks passed.
- 1,782 Vitest tests in 136 files passed.
- Six offline Luau combat scenarios and 16 plugin groups passed.
- Six guard evaluations produced their expected baseline/mutation outcomes.
- CSS lint: 274 existing warnings, zero errors.
- 14 desktop tests passed.
- Production smoke passed.
- 106 desktop browser tests and eight Electron journeys passed.

Log: ignored `test-artifacts/cleanup-check.log`. A local-link audit of 16 entry/retained documents found no broken local Markdown links. Historical links resolve through the pre-cleanup Git snapshot. No application source or test implementation changed.

These checks do not prove live model output quality, provider-key restoration, native animation playback or a playable exported game. No paid inference, provider balance query or native Studio verification occurred.

## Product issues remain

| Reported issue | Cleanup finding or evidence boundary |
| --- | --- |
| A, B, F: planning failures and cost | Prior source/run diagnosis in research report 31 identifies area-planning overhead and fatal output validation. Cleanup does not fix those paths or measure a cheaper run. |
| C: broken exported game | Root exports and native evidence are retained. The animation contradiction and full user-game behavior remain unresolved. |
| D: chat/assets/Studio | Latest implementation report retained. No new live acceptance claim. The desktop shortcut did point to an older build and was corrected. Existing StudioMCP processes were left alone. |
| E: green tests versus failed use | The improvement plan requires real-input regression tests and an authorized Studio acceptance run. |
| G: clutter | Dated bundles, copied evidence trees, per-task reports and duplicated state documentation accumulated. Cleanup removed redundant copies and simplified entry points. Workspace migration remains pending. |

## Recovery and next work

Pre-cleanup source/report snapshot: `4622b0f`. Pre-deletion checkpoint: `c2b9dc4`. Documentation phase: `ed8fd94`. Nothing pushed. Recover an old report with `git show 4622b0f:docs/<filename>.md`. List the removed reports with `git diff --name-only --diff-filter=D c2b9dc4 ed8fd94 -- docs`.

Follow [the concise improvement plan](improvement-plan.md). The next step is offline reproduction and workspace design. After implementation, propose one R6 dummy/punch/counter acceptance run at about $2 expected cost with a provisional $3 hard cap, subject to rate/reservation preflight and explicit approval. No paid run is authorized now.
