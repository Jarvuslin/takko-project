# Final evaluation results

**Failed to produce a playable demo.** Five paid attempts reached no accepted game artifact. The sixth planned attempt was cancelled before inference because its audio environment was already known to be unavailable. This is a product reliability failure, not a clean ranking of the models' game-building ability.

Final reconciliation 2026-10-01T18:41:33.397Z. Authorized aggregate cap: $5. Actual provider usage increase: **$0.92562963**. Remaining allowance: **$4.07437037**, not authorization for another batch. Key balance: **$11.0939799**. The host ledger rounds individual calls upward to $0.925641. All 29 calls have provider billing receipts. Assistant usage is separate and unmeasured.

## What changed

- The game worker now receives the retained component's reviewed dependencies, configuration values, script locations, execution/security state and integration obligations alongside full sources. This exposes existing producer evidence rather than manufacturing compatibility.
- Added the local `POST /api/projects/:id/native-acceptance` API. It exports through the real exporter with retained components, opens a fresh uniquely named Studio place, checks the expected hierarchy and sources, requires a real client and server, executes a caller-supplied frozen acceptance plan, and records each attempt separately. Runtime checks can use actual keyboard input. The export bytes, plan and artifact identities are retained.
- A concrete native failure can enter the existing Engine repair route once, then the resulting export is reopened and tested again. Environment failures do not trigger automatic paid repair. Stale artifacts cannot receive the result. The runner restores Edit mode and keeps the truthful `ready_to_test` product label even when scoped checks pass.
- Added aggregate admission across projects using production pending reservations, recorded charges and a fresh provider balance before every dispatch. The evaluation allowed 20 calls per case, one attempt per structured request, no model fallbacks, the existing bounded static repair and at most one native repair cycle. OpenCode remained in place.

This is source/API functionality. It is not installed in the user's running Takko release and has no new desktop button. It does not add a universal script-relocation engine or cure upstream source-review decisions.

## Why the paid cases stopped

| Case | Observed failure | Classification |
| --- | --- | --- |
| Luna combat | Source reviewer asked for appearance/physics evidence about an imported dummy. The workflow sent that to adaptation. Luna proposed an empty adaptation, which was rejected. | Evidence requests routed into a code-edit contract |
| Luna NPC | On asset 89414880720155, the five source-review rows were correctly identified, but the requirement's sourceHashes list contained one invented composite hash. | Structured output bookkeeping failure |
| Luna audio | Acquired radio 15876467320, inspected its content and began OpenCode integration. Extracted audio verification then refused to run with multiple connected Studio instances. | Environment preflight failure, not a gameplay verdict |
| Sonnet combat | Inspected and adapted target 110933673720505. The next acquisition stopped on Windows EPERM while atomically renaming project JSON. | Persistence failure, not a gameplay verdict |
| Sonnet NPC | On the same NPC as Luna, collapsed eight distinct AnimationId bindings into one value. Seven captured values no longer matched. | Structured output bookkeeping failure |
| Sonnet audio | Cancelled through the product API before any provider dispatch. | Known environment blocker, not scored as a model failure |

The NPC hash/media comparison is preserved in `contract-diagnosis.json`. Original pipeline errors remain unchanged in `results.json`. The cancellation is explicitly recorded as an external intervention. No model-generated game source was externally corrected.

The EPERM cause is not established. Direct PowerShell reads of active project files and a cancellation watcher were present during the run, so evaluator file-lock interference cannot be ruled out. Do not attribute that interruption to Sonnet or claim it independently proves a production-only defect. The evaluation should have checked the single-Studio audio requirement before paying for that case.

## Decision

The bounded patch did not solve Takko's reliability problem. There is no demonstrated cost reduction for a successful game, and cost per accepted game is undefined because none was accepted. These cases do not establish that Luna or Sonnet cannot implement the mechanics when given an adequate environment and contract.

The strongest next architecture change would be to stop asking models to copy authoritative hashes and media inventories. Let the host bind those identities and let the model describe semantic findings against stable handles. Route requests for missing visual, physical or playback evidence to observation tools, not automatically to source adaptation. Preflight audio/Studio capabilities before inference and isolate evaluation monitoring from the atomic-save path.

For a commercial decision today, this is a no-go for continuing to promise general game generation from arbitrary Marketplace assets. A narrower pivot to tested asset packs and bounded Roblox integration tasks has a more defensible basis. This run does not establish that such a pivot will succeed.

## Verification and limits

The full `npm run check` passed once: build, 1,919 unit tests across 151 files, 6 offline Luau scenarios, 16 plugin checks plus plugin/8 generated-script compiles, 6 guards, CSS with 0 errors and 274 warnings, 21 desktop tests, production smoke, 108 browser tests and 10 Electron tests. No crash, rerun or skipped stage. Log: `test-artifacts/final-evaluation-full-check.log`. Focused checks passed 24 tests across the two relevant files. Initial focused failures exposed source-whitespace trimming and an unchanged mock repair response, both fixed before the full check and paid dispatch.

One separate $0 native preflight passed on the real exported default baseplate. It verified reopening, Edit/Play transition, a living client character and restoration to Edit. Mock tests exercised real Engine repair dispatch, stale-result rejection, wrong-export rejection and cleanup on thrown checks. **No paid generated game reached the native acceptance runner**, so model-driven native repair remains unproven in this batch. There was no multiplayer, visual-quality or audible-loopback acceptance pass. Proposals were fixed beforehand. Search queries and tests matched across models, but combat assets selected by the models differed. This is not a user-selected-assets comparison or a broad game-generation benchmark.

After the session, the inspection Studio was verified in Edit with zero scripts and two Workspace children, matching its original state. Temporary imports and owned scopes were removed. No original scripts were changed. The owned service on 4335 and the cancellation watcher stopped. Existing user Takko/Studio processes were not restarted or closed. Ten Electron test-created temporary directories remain because automatic approval review rejected their cleanup with “blocked by policy”. Previous retained cleanup items remain untouched.

## Recorded trials and receipts

Production Engine, asset adapter, OpenCode gateway and native acceptance API. Fixed approved specifications. This does not score proposal UX. Asset selection uses the real production search workflow. No external generated-code repairs.

| Trial | Model | Stage | Native | Host charge |
| --- | --- | --- | --- | --- |
| combat | openai/gpt-6-luna | failed | not run | $0.003258 |
| npc | openai/gpt-6-luna | failed | not run | $0.006816 |
| audio | openai/gpt-6-luna | failed | not run | $0.017835 |
| combat | anthropic/claude-sonnet-5.5 | failed | not run | $0.791698 |
| npc | anthropic/claude-sonnet-5.5 | failed | not run | $0.106034 |
| audio | anthropic/claude-sonnet-5.5 | interrupted | not run | $0.000000 |

Balance before: {"at":"2026-10-01T18:32:22.530Z","remaining":12.01960953,"usage":17.98039047,"limit":30}
Balance after: {"at":"2026-10-01T18:39:09.606Z","remaining":11.544607899999999,"usage":18.4553921,"limit":30}
Immediate provider usage delta: $0.475001630. This endpoint lagged billing. The later reconciliation above establishes $0.92562963. Host charge: $0.925641 after per-call upward rounding.

## Per-call receipts

| UTC | Model | Phase | Input | Output | Reserved USD | Charged USD | Billing |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-01T18:32:27.281Z | openai/gpt-6-luna | builder | 6508 | 189 | 0.032743 | 0.000908 | provider |
| 2026-10-01T18:32:40.334Z | openai/gpt-6-luna | reviewer | 6321 | 1317 | 0.032636 | 0.001291 | provider |
| 2026-10-01T18:32:47.552Z | openai/gpt-6-luna | builder | 5712 | 690 | 0.031711 | 0.001059 | provider |
| 2026-10-01T18:32:51.042Z | openai/gpt-6-luna | builder | 6242 | 192 | 0.032488 | 0.000877 | provider |
| 2026-10-01T18:33:53.745Z | openai/gpt-6-luna | reviewer | 18439 | 7268 | 0.041914 | 0.005939 | provider |
| 2026-10-01T18:33:57.841Z | openai/gpt-6-luna | builder | 6105 | 212 | 0.032266 | 0.000870 | provider |
| 2026-10-01T18:34:14.162Z | openai/gpt-6-luna | reviewer | 6369 | 1471 | 0.032722 | 0.001311 | provider |
| 2026-10-01T18:34:21.145Z | openai/gpt-6-luna | builder | 2586 | 16 | 0.027706 | 0.000332 | provider |
| 2026-10-01T18:34:23.503Z | openai/gpt-6-luna | builder | 5395 | 62 | 0.031285 | 0.000409 | provider |
| 2026-10-01T18:34:24.761Z | openai/gpt-6-luna | builder | 8112 | 51 | 0.034915 | 0.000420 | provider |
| 2026-10-01T18:34:26.144Z | openai/gpt-6-luna | builder | 9993 | 22 | 0.037255 | 0.000328 | provider |
| 2026-10-01T18:34:27.606Z | openai/gpt-6-luna | builder | 12804 | 60 | 0.040840 | 0.000482 | provider |
| 2026-10-01T18:34:29.033Z | openai/gpt-6-luna | builder | 15367 | 46 | 0.044218 | 0.000472 | provider |
| 2026-10-01T18:34:57.189Z | openai/gpt-6-luna | builder | 15591 | 3921 | 0.044479 | 0.002143 | provider |
| 2026-10-01T18:35:28.433Z | openai/gpt-6-luna | builder | 18592 | 4645 | 0.047540 | 0.002854 | provider |
| 2026-10-01T18:35:47.735Z | openai/gpt-6-luna | builder | 21544 | 3294 | 0.050867 | 0.002203 | provider |
| 2026-10-01T18:36:17.326Z | openai/gpt-6-luna | builder | 24623 | 4391 | 0.053960 | 0.002797 | provider |
| 2026-10-01T18:36:21.120Z | openai/gpt-6-luna | builder | 6765 | 169 | 0.032977 | 0.000931 | provider |
| 2026-10-01T18:36:24.995Z | openai/gpt-6-luna | builder | 6251 | 260 | 0.032505 | 0.000912 | provider |
| 2026-10-01T18:36:38.384Z | openai/gpt-6-luna | builder | 6382 | 1146 | 0.032607 | 0.001371 | provider |
| 2026-10-01T18:36:45.174Z | anthropic/claude-sonnet-5.5 | builder | 11523 | 330 | 0.458344 | 0.026346 | provider |
| 2026-10-01T18:37:21.700Z | anthropic/claude-sonnet-5.5 | reviewer | 55836 | 3499 | 0.798004 | 0.146662 | provider |
| 2026-10-01T18:37:41.682Z | anthropic/claude-sonnet-5.5 | builder | 53942 | 1945 | 0.773080 | 0.127334 | provider |
| 2026-10-01T18:37:58.660Z | anthropic/claude-sonnet-5.5 | reviewer | 66136 | 1449 | 0.893244 | 0.146762 | provider |
| 2026-10-01T18:38:16.834Z | anthropic/claude-sonnet-5.5 | builder | 65170 | 1935 | 0.879296 | 0.149690 | provider |
| 2026-10-01T18:38:34.430Z | anthropic/claude-sonnet-5.5 | reviewer | 77418 | 1373 | 0.994536 | 0.168566 | provider |
| 2026-10-01T18:38:41.134Z | anthropic/claude-sonnet-5.5 | builder | 11334 | 367 | 0.457080 | 0.026338 | provider |
| 2026-10-01T18:38:46.852Z | anthropic/claude-sonnet-5.5 | builder | 10989 | 388 | 0.454260 | 0.025858 | provider |
| 2026-10-01T18:39:09.026Z | anthropic/claude-sonnet-5.5 | reviewer | 30253 | 1967 | 0.605088 | 0.080176 | provider |

Raw projects, candidate receipts, native exports and attempts remain in .forge/final-evaluation. The committed report preserves failures and charges. Native animation/audio checks observe playback state, not perceived quality or audio loopback. Neither native acceptance nor static tests establish all game types or multiplayer correctness.
