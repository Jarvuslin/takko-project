# Takko look, picking and platform refresh

The new look and asset picker are implemented. Live activation on port 4340 still requires the user's restart permission. No paid inference or live build was dispatched.

## Look and picking

The mockup supplies the cool gray/lime palette, bundled Geist and Geist Mono, status colors, borders, radii, chat bubbles, header budget and composer. Local WOFF2 files and OFL licenses are under `src/web/fonts/`. Styles now import only `tokens.css` and `styles.css`.

Removed sheets: `asset-choices.css`, `conversation.css`, `focus.css`, `game-concept.css`, `grok-theme.css`, `marketplace-connection.css`, `marketplace-polish.css`, `model-library.css`, `settings-workspace.css`, `studio-connection.css`, `ui-polish.css`, `workspace-native.css`.

Part 1 assertion changes: six Segoe UI checks now expect Geist. The font test explicitly loads both bundled faces and still asserts zero external font requests. The keyboard-focus color assertion now expects the lime token, RGB 220/245/66. No functional browser assertions changed in that commit.

The chat card replaces `AssetChoices.tsx` and `AssetPreviewDialog.tsx`. Manual browsing uses the exact typed query and preserves the recorded Creator Store v2 order. Only the chosen listing is inspected or captured. Each click and clip key is server persisted. Warnings require Keep it. Disconnected Studio, blocked inspection and missing clips keep building gated. Choose for me requires a short-lived cost quote and explicit confirmation, uses the existing relevance model on the first page, excludes rejected user IDs, and retains normal cap accounting. No relevant match leaves the row empty. Cached structured evidence is supplied when it still matches the listing.

## Lost selection: confirmed facts and limits

The old `choose()` at commit `96dcdb9` wrote React state and sessionStorage under a key containing both project ID and revision. It made no server request. The approval action was the durable save. A later revision could therefore load the older server choice and a different session key. A manual search also cleared that group's local selection. These are confirmed code paths, not a reconstruction of the user's precise clicks.

Preserved records for c8550a5b show:

- `docs/results/question-modal-20260928/live-project-before.json`, revision 1: only the sound was selected. The relevance run at 2026-09-28T18:02:51.583Z rejected Spider-Man 108353927891814 at 0.93 confidence and recommended 92960550414449 at 0.85. Spider-Man was the first listing, not the model's recommendation.
- `docs/results/single-punch-recovery-20260928/project-before.json`, revision 3: Spider-Man was already the saved dummy.
- That directory's `project-after.json`, revision 4, and `docs/results/scope-answer-reuse-20260929/live-after.json`, revision 5: the same dummy and sound remained.

There is no preserved browser click trace or replacement dummy ID proving exactly when the later choice was lost. The local-only save and revision-key behavior explain how the reported outcome can happen. The new regression consumes the preserved project and real v2 listing producer, replaces the saved Spider-Man, then checks a fresh disk reader, another search and a revision change. It also preserves the recorded answers and sound choice. The click is saved before verification and attachment reconciliation, including failures, so a failed check cannot silently restore the prior dummy.

## Verification so far

Part 1 browser run: 180 passed, one outdated focus-color assertion failed, one existing skip. After correction, focused typography, surgical UX and UI-polish runs passed 21 with that one skip. Final typography run passed 4.

Part 2 focused server checks: 91 passed across four files. Updated UI coverage: 30 passed and two build-button failures, then the corrected complete picking sequence passed all 10 desktop/mobile cases. The other migrated browser cases passed in the preceding runs. Earlier failed runs remain in `test-artifacts/takko-refresh/`; setup, origin proxy, duplicate listing names, layout and draft synchronization failures were corrected. CSS has zero errors and 266 warnings, including the separate design lab. Full end-to-end check and final counts will be recorded after the platform part.

All fixture provider/model calls are offline mocks. These tests do not establish native Studio gameplay, publishing rights, or a working generated game. The live project has not been changed by these tests. Task cost: $0.

## PC default

New projects record a PC keyboard/mouse decision. Explicit mobile/touch, console/gamepad and VR requests record their requested targets. Ambiguous wording opens a free platform question with an Other answer. A project chip shows the saved choice. Existing projects without that field are unchanged, including c8550a5b and its saved click/tap answer.

Planner and builder context includes the decision. The real c8550a5b planner output is a regression fixture: its click/tap and mobile/console additions fail for a fresh PC project. PC source checks reject touch/gamepad enums and handlers and ContextActionService bindings whose touch-button flag is not literal false. Checks run inside builder submission/correction and final validation. An offline engine test observes the invalid response, correction feedback, and accepted second response. This bounded source check cannot prove absence of dynamically assembled bindings.

Part 3 focused checks passed 11. Part 4 focused checks passed 192 across seven files, and all 14 desktop/mobile picking/platform cases passed. The initial platform-focused run had 86 passes and one old synthetic producer using Tap where the new default requires Click. That producer was corrected without changing the test's purpose. Full `npm run check` remains the final step.
