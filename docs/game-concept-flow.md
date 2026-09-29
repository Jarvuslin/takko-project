# Game concepts before full planning

2026-09-20. Implemented a compact concept step in the existing Takko workflow. It helps a creator choose a direction before asking the planner for a complete specification. An isolated preview is available at http://127.0.0.1:4346 with a separate workspace. The existing app on 4345 was not restarted and its memory-only keys were not touched.

## What changed

The Brief page offers **Shape my idea**. This calls only the configured planner, with a separate compact JSON contract and a response cap of 2,000 tokens or the profile's lower limit. It does not run reference research, asset discovery, builders or reviewers at this step.

The resulting card contains a title, player experience, visual direction, visible suggested defaults, up to three consequential questions and a proposed first-playtest guide. Each question supplies two or three concrete answers, a custom answer field and **Choose for me**. Delegation is stored as the explicit answer “Choose a sensible default for me.” The model is instructed to apply that choice and expose the resulting default.

**Update my concept** saves the answers and their question context, then requests a revised concept. **Use this concept & plan** becomes available when no concept questions remain. An edited request, answer or asset selection disables this handoff until the concept is refreshed. After planning, a collapsed first-playtest guide links to the existing Studio steps.

The existing full specification, requirements validation, approval and build stages remain in place. Concept summaries are proposed interpretations, never fabricated user quotations. The planner receives the original user sources alongside the concept. A first-playtest guide does not authorize removing other requested mechanics or reducing the approved scope.

## Narrow integration

- `src/generation/concept.ts` defines the compact schema and instructions.
- `schema.ts` adds an optional revision-bound concept. Existing saved projects need no migration.
- `engine.ts` reuses the existing planner route, conservative reservations, charge reconciliation, cancellation and bounded format/fallback handling. Answer-only concept refinement retains the same generation allowance, including earlier concept charges. Changing the request or attached assets still follows the existing new-cycle policy.
- The server exposes `POST /api/projects/:id/concept` and advertises availability in `/api/status`. The existing `/plan` endpoint remains compatible for projects that have not entered the concept flow.
- `GameConcept.tsx` and a small stylesheet render the card. `App.tsx` connects it to existing project revisions and settings. Follow-ups on concept projects return to the concept stage.

The full browser run exposed a completion-display delay in the existing polling path. A completed project waited for a full project-library refresh before reaching React. The failing trace had about 1,950 saved test projects and a two-second library request, while server planning itself had already completed. Poll completion now updates the current project and its sidebar row directly. It retains the existing stale-response guard. A new regression checks that a failed extra library scan cannot hide a completed concept.

The API refuses full planning while the current concept has unresolved choices or a stale revision. Schema validation limits field lengths, question count and duplicate question IDs. Repeating an already answered question ID fails validation. A model could still rephrase the same question under a different ID, so this is not a semantic completeness guarantee.

## Verification

Focused API/engine run: **10 passed**. Covers the new HTTP action, compact output schema, planner-only execution, mocked accounting, unresolved-choice blocking, custom and delegated answers, saved question context, shared allowance, storage reload, planner handoff, revision invalidation, legacy direct planning, invalid output, budget rejection, cancellation and concurrent mutation rejection.

Focused browser run: **6 passed**, three scenarios on desktop and mobile. Covers suggestions, delegation, custom answers, explicit save and handoff, saved concept reload, stale input blocking and an older backend without the capability flag. The concept card passed the focused axe accessibility check and horizontal overflow checks. Screenshots were inspected. Selected-option contrast was tightened before the full check's frontend build and browser stages.

The first focused unit run failed all 10 tests in setup because the new fixture omitted the existing mandatory builder, reviewer and repair route arrays. Corrected the fixture and retained the failure record. No production behavior was exercised in that failed run.

Final **`npm run check` passed, exit 0**, with no skipped stages or retries within the final run:

| Stage | Result |
| --- | --- |
| Unit/API | 1,311 tests in 79 files passed |
| Offline Luau | 6 combat scenarios passed, sample scripts compiled |
| Plugin | 14 mock groups passed, plugin and 8 injected sources compiled |
| Guards | All 6 fixtures produced their expected outcomes |
| Build | TypeScript and Vite passed |
| Desktop | 10 tests passed |
| Production | HTML, bundle, API and unknown-route smoke checks passed |
| Browser | 82 tests passed across desktop and mobile |

The corrected completion regression also passed **2/2** focused desktop/mobile checks before the final full run.

First full `npm run check`: exit 1. All stages through production smoke passed. Browser tests finished **79 passed, 1 failed**. The desktop legacy provider-adapter workflow timed out waiting for approval controls while the completed project was held behind the library refresh. The original log, trace, error context and completed server project are preserved.

A formatter invocation also hit a transient Windows file-open error on `App.tsx`. The file remained intact and the next formatting invocation succeeded.

After the polling fix, a focused browser regression run passed 7 of 8 checks, including the previously failing provider-adapter workflow on both desktop and mobile. The remaining failure was in the new test: it expected the desktop project sidebar on mobile, where the existing UI uses a project dropdown. Corrected that assertion to inspect the selected mobile dropdown option. This failure and its trace are preserved separately.

Evidence:

- [Initial fixture failure](results/concept-initial-fixture-failure.txt)
- [Focused unit log](results/concept-focused-unit.txt)
- [Focused browser log](results/concept-focused-browser.txt)
- [First full check log](results/concept-full-check.txt)
- [Final full check log](results/concept-full-check-final.txt)
- [First check artifacts and failure trace](results/concept-check-first-artifacts/)
- [Polling regression log](results/concept-polling-regression.txt)
- [Polling regression artifacts](results/concept-polling-artifacts/)
- [Corrected completion regression](results/concept-polling-regression-final.txt)
- [Desktop concept](results/concept-choices-desktop.png)
- [Mobile concept](results/concept-choices-mobile.png)
- [Tested source hashes](results/concept-source-manifest.json)

Preserved 122 pre-existing root result files before the full check. Archived and restored 26 changed files after the first run, 2 after the focused polling run and 27 after the final check. Final artifacts are in `results/concept-check-artifacts`, with the restoration list recorded there. Earlier failure evidence remains unchanged.

## What this does not establish

The provider responses in these tests are offline fixtures. They establish application behavior, not whether a real model asks good questions or saves tokens. The 2,000-token response cap bounds each concept response, not the whole conversation. Existing format repair and fallback calls can consume more of the same allowance. Clear requests may cost more than direct planning because the concept is an additional call.

Answers are persisted when **Update my concept** is clicked. Unsaved answer drafts are not persisted across reloads. This change does not generate alternative visual previews, build an early partial game, perform selected-object edits, add Clicky automation or implement the missing native Studio production receiver. The first-playtest card is a proposed manual guide, not a test result.

No paid inference, Studio operations, publishing, commit or push occurred. No generation goal was resumed. Actual external cost: **$0**, paid calls: **0**. Last known key balance remains **$1.528618224 at 2026-09-20T18:01:25.793Z**, not refreshed.

## Activation

The isolated preview is **4346/PID 27260**, launched from `.forge/concept-ui-preview.mts` with data in `.forge/concept-ui-preview`. It copies public model/preset settings only. No credentials or projects were copied. The source app reported no configured model profiles, so models still need configuring in the preview before paid generation. The new server reports `concepts: true`. Its HTML returned 200 and its home page was opened and inspected in the in-app browser.

Vite logged that its auxiliary websocket port 24678 was already occupied. The preview's HTTP API and browser page loaded successfully. The existing websocket owner was not changed.

The previous app is **4345/PID 30804**. The older app is **4343/PID 31044** and the static mock is **4342/PID 28132**. None was restarted. The frontend hides the concept action when an older running backend does not advertise support. Enabling the feature in the old 4345 workspace still requires explicit permission to restart that process and will discard keys entered in its Models UI, as documented in `AGENTS.md`. The separate preview avoids that restart.
