# Takko state snapshot

**Captured 2026-09-19. This goes stale fast. Always re-read `research/notes/continuation.md` before acting on anything here.**

## Git

- Updated 2026-09-29: all work through that date is committed on branch `codex/marketplace-asset-library` (snapshot `eb046db` plus the workflow cleanup commit after it). Agents commit their own finished work from now on.
- Nothing has been pushed since the initial commit. Be careful with any destructive git operation.

## Last recorded work, 2026-09-17

Marketplace drop truncation fix. Real asset drops were failing with a generic invalid-request error. Root cause was native inspection JSON truncating at 100K and being parsed as a string, then mislabeled as a user-input Zod error. Fix added 32 KiB hex transfer pages, canonical arrays, full SHA-256 offset and length checks, a 4 MiB aggregate bound, and explicit upstream-stage errors.

Result: the 1,722-node walk animation model now captures and drops successfully. Oversized captures report a proper incomplete-inspection review instead of a generic failure.

Checks: 43 focused tests plus tsc. Full check 1,267 unit/API + 10 desktop and all pre-browser stages. Browser 40/42 initially with two timing failures, last-failed rerun 2/2 passed with no code edits. A Windows sleep event explains a 10.6 hour logged elapsed time, it was not continuous testing.

Report: `docs/marketplace-transfer-fix.md`.

## Runtime state as last recorded

- Preview server on **4336** restarted with the fix, exec session 61733, PID 39460. The user was actively using it. Do not reset their draft.
- Original app on **4324** untouched and holding its in-memory keys.
- Verify both before touching either. These numbers come from the log, not from a live check.

## Budget

Last verified official key balance: **$1.529256456 remaining** at 2026-09-16 22:44 UTC. Conservative carry-forward reservations were 9,111,115 micros. Nothing paid has run since.

## What is paused

The raw diverse whole-game generation goal is paused and stays paused until the user says otherwise.

## What is still unfinished

Do not describe any of these as done:

- **No complete accepted game has ever been produced.** Not by any model, not on any trial.
- Cheap versus premium model quality has never been compared under controlled conditions. There is no basis for claiming cheap models match Astra.
- Animation search is not supported by the adapter. It searches Model, MeshPart, Audio and Image only.
- Rig-aware asset previews are not implemented.
- A complete Studio context index is not implemented. The adapter builds in its own namespace and does not index arbitrary existing games.
- Model-generated tests can still be weak.
- Marketplace static inspection is limited screening, not a safety guarantee.
- Worker repair quality is unproved. The repair workflow is tested, a successful worker repair is not.
- Human gameplay and visual review are still required for anything to count.

## Model observations on record

From `research/results/model-screen-20260916/` and surrounding runs. Single samples, not a benchmark.

- **Sonnet** strongest on isolated native controller checks, 15/15.
- **Luna** 14/15 with a completion defect, and a separate run with broken overlapping-press code. Cheap review candidate.
- **Qwen** retrieval succeeded, returned a real Roblox API error (`Vector3:Clone`).
- **Kimi** is thinking-only, exhausted its reasoning allowance, result inconclusive.
- **Composer** has never been tested.
- **GPT-5.6 Sol** stronger than Gemini 3.7 Flash on requested-behavior discovery in six planner probes. One sample each.

## Where to read more

- `research/notes/continuation.md`, always first
- `docs/marketplace-transfer-fix.md` latest fix
- `docs/marketplace-asset-library.md` the marketplace feature
- `docs/production-readiness.md` the honest assessment of what is not production ready
- `docs/generation-failure-diagnosis.md` the original failure diagnosis that redirected the whole project
- `research/23-agent-architecture-comparison.md` and `research/27-superbullet-installed-architecture.md` competitor teardowns
