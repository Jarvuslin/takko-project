# Current state

Updated 2026-09-29. This is the live handoff. Replace its contents after each task and keep it under about 5 KB. History through 2026-09-29 is in `archive/continuation-2026-09-13-to-2026-09-29.md`.

## Live now

- **Port 4340, PID 26772** runs `.forge/asset-search-host.mjs` using `.forge/world-policy-live-20260928`. Project **c8550a5b-5b9f-4b79-8a25-b7ee0827618c** (Dummy Strike) is revision 5, draft, with no active job. The old one-time scope-answer recovery helper must never be rerun.
- The asset-search fix is live after the user-approved restart at 2026-09-29T03:16:22Z. The replacement `.forge/asset-search-host.ts` / `.mjs` loads the existing store without recovery edits, enables free manual group searches and keeps automatic recommendations paused. Existing build approval, budget, profile and attempt restrictions remain. Future restarts still require permission.
- Restart preservation passed using `.forge/asset-search-preservation.mjs`: request, all five answers and question context, discovery and choices, attachments, proposal, revision and budget/charges are identical before and after. The live browser shows an editable query, enabled Search again button and no false unsaved banner. Screenshot: `test-artifacts/asset-search-live.png`.
- Post-restart checks confirmed five answers, selected dummy 108353927891814, selected sound 133175949071305, asset discovery, attachments, revision and ledger all match disk. Punch animation remains unselected. The user chooses it, reviews assets and presses Approve & build themselves. Single punch is the saved attack style. Pack 12061946559 stays excluded.
- After the full check, no other Takko ports (4318, 4319, 4320, 4324, 4335, 4336) were listening. The isolated test server stopped. Recheck listeners.
- Studio sessions belong to the user. None were changed in this task. Scratch places under `.forge/visual-scratch-20260928/` and `.forge/fresh-fixes-scratch/` remain visual checks only.

## Money

- Project c8550a5b has an **$8 cumulative cap**. Ledger spend $0.385091, retained reservation $0.002688, **remaining $7.612221**.
- Last provider reconciliation: 2026-09-29T00:26:25Z. Key $15.240844430, account $16.748365904. No new balance check or paid call in the asset-search task. Task cost $0.
- A build is authorized only when the user presses Approve & build within that cap. No automatic retry or repair resume. Any other paid run needs explicit authorization.

## Paused

- Every older generation goal and project, including 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Do not edit it or its evidence.
- Deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` remain.

## Next up

1. The user picks assets, approves the build and tests its export in Studio. No hand-editing of generated output.
2. The separately requested visual reskin remains unstarted. See `research/30-lemonade-flow-walkthrough.md`. Looks only, same flow.

## Recent decisions

- Asset search: incoming revisions sync untouched request/answers against the previous saved baseline. Key order is ignored. Actual local drafts remain. Manual group searches bypass brief dirtiness and model assessment. Queries are editable above smaller descriptions. Planner queries use 1-3 broad object/media keywords. Sparse listing matches also search a core word. This free heuristic does not prove semantic relevance.
- Focused verification: 49 unit/API tests plus 8 proposal tests, and 22 desktop/mobile browser tests passed. Initial browser run had 18 passes and 2 selected-label failures, then passed after correction. First full check stopped at 1 outdated fallback assertion (1,714 passed, 1 failed). Corrected. Final full check passed: 1,715 Vitest, 181 browser with 1 existing mobile skip, 14 desktop, 6 Luau, 15 plugin mocks, 6 guards, build/CSS/production smoke. See `docs/asset-search-brief-sync.md`.
- Fresh projects use the captured Baseplate template. Builders must not add lights or change Lighting without a requirement. Takko remains marketplace-first. Existing Forge identifiers stay unchanged.
