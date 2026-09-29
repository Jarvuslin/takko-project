# Current state

Updated 2026-09-29. This file is the live handoff. REPLACE its contents at the end of each task. Do not append history. Keep it under about 5 KB. The full log up to 2026-09-29 is in `archive/continuation-2026-09-13-to-2026-09-29.md`. Read that only when you need a specific past detail.

## Live now

- **Port 4340, PID 42308** runs `.forge/scope-answer-recovery-host.mjs` on store `.forge/world-policy-live-20260928`. It serves project **c8550a5b-5b9f-4b79-8a25-b7ee0827618c** ("Dummy Strike"), revision 5, draft. Do not restart or rerun the recovery helper without the user's permission. Its `live-attempt.json` enforces one attempt.
- The project is **waiting for the user**. They pick the punch animation, review the dummy and sound, and press Approve & build themselves. The attack style is single punch. No blocking questions remain. Pack 12061946559 is excluded.
- Known UI bug on that page: a false "You have unsaved brief changes" banner can disable asset search after server-side answer changes (App.tsx `conceptDirty`). Reloading the page should clear it. A proper fix is not implemented yet.
- No other Takko ports (4318, 4319, 4320, 4324, 4335, 4336) were listening at the last check. Verify before assuming.
- Studio: the user's Studio sessions are theirs. Ask before touching them. Scratch places under `.forge/visual-scratch-20260928/` and `.forge/fresh-fixes-scratch/` are for visual checks only.

## Money

- Project c8550a5b has an **$8 cumulative cap**. Spent $0.385091 on the ledger, retained reservation $0.002688, **remaining $7.612221**.
- Last reconciled 2026-09-29T00:26:25Z: key $15.240844430, account $16.748365904.
- The build itself is authorized only when the user presses Approve & build, within that cap, with no automatic retries or repair resumes. Anything else paid needs new explicit approval.

## Paused

- Every older generation goal and project, including 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Do not edit it or its evidence.
- Deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` stay in place.

## Next up (not started)

1. The user tests the build export in Studio. No hand-editing of generated output.
2. Fix the false unsaved-changes banner and make asset search queries broad and editable. The prompt is in the user's hands.
3. A visual reskin of the window and chat to Lemonade's feel, looks only. See `research/30-lemonade-flow-walkthrough.md`. The prompt is in the user's hands.

## Recent decisions

- 2026-09-29: all work was committed as `eb046db` on branch `codex/marketplace-asset-library`. Screen recordings, traces and npm caches in `docs/results/` are gitignored and stay on disk. `npm run check` now writes its outputs to `test-artifacts/` (gitignored), not `docs/results/`.
- Fresh projects start from the captured Baseplate template world. Builders must not add lights or change Lighting unless a requirement asks for it.
- Takko stays marketplace-first for assets. The UI reskin changes looks only, not the flow.
