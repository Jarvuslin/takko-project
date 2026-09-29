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

The read-only live check during final screenshots found additional evidence: targetDummy's query was `fighting animation`, its current 29 listings no longer contained the saved Spider-Man, and punchAnimation's query was `target dummy`. The saved IDs had not changed. The old search had replaced the result page without retaining the saved listing. Initialization now recovers the actual cached listing when this happens. A regression uses that captured discovery and the real 12 KB cache record. It restores the amber warning without inspection, inference or changing choices. This is evidence of missing listing context, not proof of the user's precise replacement click.

## Focused verification

Part 1 browser run: 180 passed, one outdated focus-color assertion failed, one existing skip. After correction, focused typography, surgical UX and UI-polish runs passed 21 with that one skip. Final typography run passed 4.

Part 2 focused server checks: 91 passed across four files. Updated UI coverage: 30 passed and two build-button failures, then the corrected complete picking sequence passed all 10 desktop/mobile cases. The other migrated browser cases passed in the preceding runs. Earlier failed runs remain in `test-artifacts/takko-refresh/`; setup, origin proxy, duplicate listing names, layout and draft synchronization failures were corrected.

All fixture provider/model calls are offline mocks. These tests do not establish native Studio gameplay, publishing rights, or a working generated game. The live project has not been changed by these tests. Task cost: $0.

## PC default

New projects record a PC keyboard/mouse decision. Explicit mobile/touch, console/gamepad and VR requests record their requested targets. Ambiguous wording opens a free platform question with an Other answer. A project chip shows the saved choice. Existing projects without that field are unchanged, including c8550a5b and its saved click/tap answer.

Planner and builder context includes the decision. The real c8550a5b planner output is a regression fixture: its click/tap and mobile/console additions fail for a fresh PC project. PC source checks reject touch/gamepad enums and handlers and ContextActionService bindings whose touch-button flag is not literal false. Checks run inside builder submission/correction and final validation. An offline engine test observes the invalid response, correction feedback, and accepted second response. This bounded source check cannot prove absence of dynamically assembled bindings.

Part 3 focused checks passed 11. Part 4 focused checks passed 192 across seven files, and all 14 desktop/mobile picking/platform cases passed. The initial platform-focused run had 86 passes and one old synthetic producer using Tap where the new default requires Click. That producer was corrected without changing the test's purpose.

## Final review

The first full check passed build, then stopped at 1,735 unit passes and 16 failures. Nine failures were missing Luau binaries in the isolated checkout. Five were an authored keyboard/touch benchmark requirement that contradicted its PC request. One exposed overly broad platform ambiguity detection in a real authored brief. One was an unused status flag changing an exact API contract. Those were corrected and 42 focused tests passed. The explicit touch benchmark remains explicit touch. Ordinary action alternatives and Controller script names no longer turn it into an ambiguous platform request.

Screenshot review also found paragraph wrapping overriding the one-line purpose and minimum grid widths pushing status pills outside narrow cards. Browser assertions now cover those properties. The asset card waits for a proposal, specification, saved discovery or approved brief before initialization, preserving the concept flow. Final focused recovery checks passed 12 and picking/concept browser checks passed 20.

Desktop before/after/mockup comparisons: [open gallery](../test-artifacts/takko-refresh/comparison.html). Before uses commit `1df6507`. After uses the new frontend with an isolated copy of the current live project and cached listings. It shows Spider-Man amber, sound Ready and animation Not chosen. The all-green flow is separately exercised using recorded listing/clip fixtures. Screenshots omit remote thumbnails in those offline fixtures. They do not claim the user has selected a new dummy or animation on port 4340.

The second full run passed 1,752 unit tests and all non-browser stages, then finished with 176 browser passes, 15 failures and one existing skip. Eight failures came from Express rejecting SPA fallback paths beneath the hidden `.codex` checkout directory. The final checkout is `D:\RobloxProjects\Takko-refresh-check`. Two concept and four attachment failures exposed early picker initialization. One mobile seek assertion observed an offscreen renderer, which intentionally stops drawing.

The third run passed 1,753 unit tests and non-browser stages. It was interrupted after 27 browser passes and nine failures because legacy picker fixtures needed to enter through their existing Approve brief action. The short-window regression also needed a minimum conversation height with a shrinking composer. The seek test now brings its canvas back into view before asserting the rendered frame. The final focused legacy-picker, evidence and chat run passed all 18 desktop/mobile cases. These failed and interrupted logs remain preserved. None is described as a passing full check.

The fourth full run passed all non-browser stages and finished with 189 browser passes, two failures and one existing skip. Both failures were the same legacy server-revision case: an older brief approval still needs to allow free asset browsing. That condition was corrected and all 34 focused picking, platform, revision and keyboard-flow cases passed. The final full run uses that committed correction.

## Final result

`npm run check` passed in full, exit 0, against source commit `30e0eab`. No source changed afterward. Log: `test-artifacts/takko-refresh/check-passed.log`.

| Stage | Result |
|---|---|
| TypeScript and Vite build | Passed |
| Vitest | 1,753 passed in 130 files |
| Luau | 6 offline scenarios passed, generated scripts compiled |
| Plugin | 15 mock scenarios passed, plugin and 8 injected sources compiled |
| Guards | 6 matched expected outcomes |
| CSS | 0 errors, 266 warnings |
| Desktop | 14 passed |
| Production smoke | HTML, bundle, API and unknown route passed |
| Browser | 191 passed, 1 existing mobile skip |

No native Studio verification was performed. No Studio session or test service was left running. Only the original app on 4340, PID 26772, remains. Restart and live acceptance still await the user's permission and picks. Cost: $0. Nothing was pushed.
