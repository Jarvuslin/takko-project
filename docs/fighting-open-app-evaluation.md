# Fighting game evaluation in the user's open Takko

The live run failed before generating any game code or scene. Increasing the model deadline allowed planning to finish. The next blocker was the approved Marketplace adapter returning unrelated approved assets for every decorative backdrop query, combined with a fallback rule that would not permit skipping those candidates without importing one for inspection.

Run date: 2026-09-23 UTC. Evidence and accounting: [RESULTS](results/fighting-open-app/RESULTS.md). Project: `c7540d7b-8984-49fc-af34-fc36876784f1`, revision 6, scope `Forge_c7540d7b8984`.

## What was actually exercised

The test began in the user's native Takko executable, service `http://127.0.0.1:64808`. Later UI interactions used a Playwright browser connected to that same service and saved project, without launching a second Takko server or changing the user's desktop focus. The requested game included Marketplace fist fighting, a practice dummy, hit VFX/SFX and an exact hit counter. The current Studio place was used only for temporary candidate preview probes. There is no generated game to playtest.

The user's existing $4.40 evaluation cap includes the earlier $0.024778 failed truncation trial. A new paid retry was explicitly approved after the 120-second timeout. No retry was started after the subsequent build failure.

## Findings from the live run

1. **Concept approval deadlock.** Four valid concept responses kept adding unresolved issues, even after the user choices were resolved. The final issue demanded asset verification before brief approval, while the UI required brief approval before asset approval. Each response retained properly paired playtest actions and outcomes. The previous structural error and hidden 2,000-token cap did not recur. A disclosed manual workaround used the supported project API to consolidate the original request and confirmed decisions into a direct brief. This was not an autonomous successful concept flow. Original responses and failure snapshot are preserved.

2. **Timeout, not truncation, stopped the first combat planning worker.** The default request deadline was 120 seconds. Through the existing Models API, only this profile's request timeout was changed to 600,000ms. The configured 32,768 output-token allowance and provider-default reasoning were preserved. After explicit retry approval, saved outline, arena and dummy assignments were reused. Combat completed with 17,382 output tokens. Effects and HUD planning followed, including one structured-output correction. The timeout change is persisted in the user's model profile. It is not a guarantee against provider limits or future truncation.

3. **Planning produced seven systems and seven connections, but it is not complete evidence of implementation coverage.** The plan describes server attack validation, dummy range/facing checks, animation replication, client hit effects and server-owned counter updates. It contains 27 requirements and 11 tasks. It assigns no client script to capture attack input even though InputController is a required architecture node. The plan also assumes the selected embedded punch keyframe clip can resolve to an Animator-playable animation ID. Preview evidence does not establish that. The build failed too early to show whether the coordinator would repair either gap.

4. **The approved-asset adapter is the immediate build blocker.** `src/marketplace/approved-adapter.ts` overrides `search` and filters approved candidates by kind alone. It ignores query and role. Three distinct backdrop queries returned the same Training Dummy, R15 Punching Animations and Hit VFX references. The underlying Marketplace search was not called for those queries. The worker correctly refused to use them as scenery. `src/generation/asset-pipeline.ts` requires a native inspection whenever any optional visual candidates were offered, so it withheld the `reject` action. With retries exhausted, only select/escalate remained. Escalation stopped the whole build even though this backdrop was optional. The artifact has zero files and zero scene objects. The model did not merely fail to understand a simple combat request.

5. **The small-window composer can consume the conversation.** At 844×575 browser content size, the chat panel was 483px high but its attached-asset composer forced the conversation scroll area down to 16px. Content extended beyond the panel's hidden overflow. Four editable asset cards are rendered unbounded inside the composer. The screenshot and DOM measurements reproduce the issue on the live service. No document-level horizontal overflow was measured, which by itself clearly does not establish a usable layout.

6. **Connection wording conflates two transports.** The header's Studio connection uses Marketplace MCP discovery. Applying builds and running the app's test bridge require the separate Takko plugin connection. Thus “Studio connected” and “Connect Studio to apply and test” appeared in the same project. The setup details explain this distinction, but the primary status does not. Studio MCP was callable throughout the candidate checks. The Takko apply/test plugin bridge was not connected, and no actual apply operation was attempted.

## Marketplace and preview evidence

| Selection | Observed | Still unverified |
| --- | --- | --- |
| Dummy 1245720733 | Real search result, static scan accepted, web geometry preview, full native model preview | Integration with generated hit detection |
| R15 animation pack 12061946559, clip `1/1/18/1` | Three embedded clips, selected punch visibly changes pose while playing/scrubbing | Published AnimationId, permissions and actual R15 Animator playback |
| Punch Impact 1 audio 132504023010884 | Native sound loaded, duration 0.61993s, playback time advanced and PlaybackLoudness became nonzero | Audibility and suitability. Process-scoped recordings were effectively silent |
| Hit VFX 86089736228455 | Native particle emitter produced a visible white burst in a temporary isolated preview | Triggering once per actual generated-game hit and runtime cleanup |

The initially considered dummy 8767186735 was blocked by a computed-access static-scan finding in its Animate script. This is an unresolved screening finding, not evidence of maliciousness. It was not used. Web previews omitted unsupported custom geometry in both dummy candidates. The VFX chooser does not simulate particles and the audio chooser only links to Creator Store. These are preview coverage gaps.

The temporary native VFX probe moved the emitter away from an opaque dummy because it was initially occluded. That correction belongs to the probe, not generated game logic. Audio was captured only from the Studio process tree, without microphone or unrelated application capture. All near-silent recordings remain in the evidence.

## Changes and verification limits

No product source was changed during this live evaluation. The only persistent application configuration change was the selected model's 10-minute timeout. The test project, approvals, saved plan, costs and failed worker receipts remain in the user's actual profile. No user's Takko process was restarted or killed.

Regression results are recorded in RESULTS.md. Offline mocks and browser regressions cannot prove the generated game works. Native candidate previews do not prove native animation integration, gameplay, hit counting or the app's apply/test bridge.

All temporary Studio preview scopes and imported fixtures were removed. Studio was returned to Edit mode. Workspace contained only Terrain, Baseplate, SpawnLocation and Camera. ServerScriptService, ReplicatedStorage, StarterGui and ServerStorage were empty, matching the original baseline. Original scripts were not changed.

## Recommended corrections before another paid build

Keep approved references tied to their explicit roles. Separate reuse of approved assets from discovery of new optional decoration, and send genuinely new candidates through user review. A repeated fixed approved pool should not consume three model-funded search decisions. The optional-asset policy needs a bounded path for rejecting semantically unrelated candidates without importing them just to satisfy an inspection counter.

Add plan coverage checks for player input and runtime animation availability, then route those gaps to a focused correction before specification approval. Concept readiness must not depend on an asset approval step that itself requires concept/brief readiness.

Bound the composer attachment area or collapse it to a compact summary, keeping a usable conversation height and reachable actions. Present Marketplace and build-plugin connection states distinctly. These recommendations are diagnosed follow-up work, not delivered fixes in the open executable.
