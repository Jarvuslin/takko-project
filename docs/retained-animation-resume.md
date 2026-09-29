# Retained animation integration and reviewer resume

Export failed with HTTP 409 because final review left three failed checks. The animation task was regenerated and final review completed without truncation. No playable place or gameplay pass was produced. One existing-project resume was authorized under attachment `94e7f8fc-4ab8-46c8-a57f-b1393f2df944`, with an additional $4 cap.

## Changes

The acquired animation was retained, but the generated PunchController assigned the Marketplace pack ID to Animation.AnimationId. The prior builder context mixed supported local playback with publishing limitations. The task correction callback did not reject this invalid assignment.

Retained component context now exposes destinationPath and rootName explicitly as local content. It resolves the approved clip against the retained capture and supplies a concrete lookup, RegisterKeyframeSequence call, unchanged returned ID assignment, and Animator load pattern. The generated deliverable is a Studio place for testing. Publishing limitations remain in project coverage. No asset ID or game genre is hard-coded in production logic.

The task and repair correction callbacks validate the merged candidate before saving it. The guard uses acquisition provenance to identify retained raw KeyframeSequences, then examines Luau AST assignments, including local constant aliases. Comments and unrelated string literals do not trigger rejection. This is a bounded static check, not a general Luau interpreter. A rejection names the source file, need and retained destination.

An optional execution policy applies reasoningEffort only to the final game reviewer. Changing the saved reviewer profile would change the acquisition context hash, so the dispatch policy copies the routed profile without mutating acquisition-bound configuration. Planner, builder, decisions, model identity and maximum output stay unchanged.

## Offline evidence

Evidence is under `docs/results/animation-resume-20260927/`. The real terminal-project and PunchController from runtime-diagnostics are the regression inputs. The test drives the real resume and task submission path. Rejected patches preserve the artifact and ledger. An accepted correction consumes the actual component context pattern and leaves the other four files unchanged.

The initial missing-module test failure, missing-context assertions, incorrect synthetic-profile binding, and test schema import typo are preserved. Those fixture problems were corrected using the saved acquisition profile, not by changing its provenance. The source fix also covers merged candidates so omitting the invalid file cannot silently retain its wiring.

The final `npm run check` exited 0. It passed 1,628 unit tests in 113 files, six offline Luau scenarios and four sample compiles, 14 plugin groups plus the plugin and eight injected source compiles, six guard expectations, TypeScript/Vite, 14 desktop tests, production smoke, and 171 browser tests with one existing skip. CSS reported zero errors and 556 existing warnings. The earlier final-check attempt had 170 browser passes and a Chromium ERR_NO_BUFFER_SPACE navigation failure. The unchanged-code rerun passed, including that test. Both logs and the failure trace are preserved. An earlier intermediate full check also passed.

The three final pinned-CLI replays passed at $0, with 28/22/20 exchanges, 13/10/9 tasks and 7/4/5 synthetic source files. Earlier replay batches are also retained. Focused tests passed 17/4 files before the merged-candidate refinement and six/two files afterward. Offline mocks and compilation do not prove Studio gameplay.

All 13,688 pre-existing result files were hash-checked and restored after separately archiving changed check artifacts. The provider balance before dispatch was $10.224550608 for the account and $8.717029134 for the key at 2026-09-27T20:57:24.356Z. No paid calls were made before the final full check and replays passed.

## Explicitly unchanged

The sound candidate measured about 1.53 seconds against the planner's 0.2–0.5 second requirement. Selection had no duration signal and reported about 0.87 confidence. The honest audio gap remains. The previous five relevance passes and 165 calls remain recorded and were not redesigned. No publishing, asset replacement, place binding or bridge delivery is included.

## Live result

Project 8a81efe9-b8ed-44bc-a21a-5aad132813ac, revision 1. Only punch_input_client was reopened. OpenCode run 7ec00c77-3271-4762-8382-8b53091e866e ran from 20:57:46.733 to 21:03:34.850 UTC, 348.117 seconds, 25 exchanges, exit 0 and signal null. It submitted twice. The first patch was rejected for changing the original acquisition record, and the second was accepted. Both attempts remain in the trace. All six tasks are complete.

The original proposal, spec, asset choices, complete acquisition pipeline, scene, generation budget/cycle and 219 prior charge records compare equal to the pre-resume snapshot. Four source files are byte-identical. Only PunchController changed. Its new code registers a retained KeyframeSequence, assigns the returned string unchanged and loads it through Animator. It does not assign the pack ID as AnimationId.

Static inspection found an additional limitation: the controller searches for the first KeyframeSequence below the retained folder instead of traversing the exact supplied sequence path. The preserved capture contains three sequences (indices 149, 426 and 531). The approved clip is index 149, named punching animation. Which sequence the generated lookup selects in native gameplay was not observed. This is separate from the three reviewer failures below and remains unresolved.

Reviewer reasoning was medium, with the same Sonnet model and 32,768 output limit. The provider reported 76,005 input tokens, 13,059 output tokens including 6,375 reasoning tokens, leaving 6,684 non-reasoning output tokens. Finish reason was stop, not truncation. Low reasoning was not needed. This setting was applied by the owned service's reviewer-only execution policy, not by changing the acquisition-bound saved profiles.

## Failed checks, verbatim

These are the accepted review's recorded findings, not observed Studio test results.

```json
[
  {
    "id": "review:target_dummy",
    "status": "failed",
    "detail": "The retained Training Dummy component was never actually positioned or anchored in the scene bundle. No scene entries set Anchored=true or a CFrame near (0,3,15) on any part of Workspace/Forge_8a81efe9b8ed/Assets/dummy/dummy/Imported/'Training Dummy'. The integrationNotes for this component explicitly flagged this as remaining work ('set Anchored=true and position/orient parts at approximately (0,3,15)... not established by current evidence'), but no file or scene node in this artifact does it. Without this, the dummy retains whatever import-time position/anchoring it shipped with, so it may not stand upright at the required location, may not collide, and PunchValidator's distance check against its Head/Torso parts (which assumes it is at ~(0,3,15)) will be measuring against the wrong location. Additionally, the coverage entry for target_dummy contains copy-pasted text from the hit_sound rejection reasoning ('Audible confirmation that a punch has successfully landed on the dummy... 126976659766267...'), which is not a valid justification for blocking target_dummy and indicates a bookkeeping error that should be corrected regardless of the underlying placement gap."
  },
  {
    "id": "review:hit_sound",
    "status": "failed",
    "detail": "The required hit_sound requirement is completely unimplemented: PunchValidator.server.luau explicitly plays no Sound and no Sound instance exists anywhere in the artifact. The rejection rationale is that the user-approved asset (126976659766267, already present in assetChoices/selectedAssets as the user's chosen Sound Effects asset) has a ~1.53s native duration versus an inferred 0.2-0.5s constraint that appears only in the assetNeeds.constraints field (a worker-authored search constraint), not in any actual user statement. The user's request and clarifications only ask for 'a punch/hit sound when the player hits the dummy' with no stated duration limit. Per policy, user-approved asset choices are authoritative and 'Find later' language does not authorize dropping a user-approved reference; a duration mismatch against an inferred internal constraint is not the kind of import/capability limitation that justifies unilateral abandonment without escalation. The asset should have been loaded and played (trimmed via TimePosition/audio playback range if truly too long, or accepted as-is) rather than the requirement being left fully unmet with no Sound instance at all."
  },
  {
    "id": "review:punch_loop",
    "status": "failed",
    "detail": "punch_loop's acceptance criterion requires that 'when the swing connects the hit sound plays and the visible counter increments exactly once per successful swing.' Because hit_sound is entirely unimplemented (no Sound instance, no playback code in PunchValidator.server.luau), the confirmed-hit feedback loop is incomplete: only the animation and counter legs of the three-part feedback (animation + sound + counter) are wired up. This is a direct, uncorrected gap in the core requested loop, not an optional extra."
  }
]
```

No bounded repair was dispatched. Two failures require audio work that the latest user instruction explicitly excludes. Fixing dummy placement alone would still leave export blocked. No review finding was deleted or downgraded, no project stage was rewritten, and no exporter condition was bypassed. The unused allowance does not authorize a future run.

## Delivery and review

GET /api/projects/8a81efe9-b8ed-44bc-a21a-5aad132813ac/export returned 409 at 2026-09-27T21:08:13.842Z with Build and resolve checks before export. There is no .rbxlx to open and press Play. The requested source fallback is at D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927-Sources. Each file was independently compiled, five of five passed with empty stderr.

- [PunchConfig.module.luau](<D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927-Sources/ReplicatedStorage/Forge_8a81efe9b8ed/PunchConfig.module.luau>)
- [PunchRemotes.module.luau](<D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927-Sources/ReplicatedStorage/Forge_8a81efe9b8ed/PunchRemotes.module.luau>)
- [PunchController.client.luau](<D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927-Sources/StarterPlayer/StarterPlayerScripts/Forge_8a81efe9b8ed/PunchController.client.luau>)
- [PunchValidator.server.luau](<D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927-Sources/ServerScriptService/Forge_8a81efe9b8ed/PunchValidator.server.luau>)
- [HitCounterHUD.client.luau](<D:/RobloxProjects/Roblox Gen/Takko-Fighting-Review-20260927-Sources/StarterGui/Forge_8a81efe9b8ed/HitCounterHUD.client.luau>)

These five scripts alone are not an exported Studio place. The saved artifact describes a room with ground, ceiling, four walls, spawn and four point-light fixtures. The retained dummy is bound at Workspace/Forge_8a81efe9b8ed/Assets/dummy. Its required positioning/anchoring is disputed by the reviewer and has not been checked natively.

Once a place can be exported, open that .rbxlx directly in Studio and press Play. The intended check is to approach the dummy and use left click, F or controller R2, observe the animation, server-validated hits and counter increments. No sound is implemented because the selected 1.53 second candidate failed the existing 0.2–0.5 second fit constraint. This session did not observe animation playback, hit detection, dummy behavior or the counter in Studio.

## Cost and preservation

26 new paid calls: 25 coding calls costing $0.971575 and one reviewer call costing $0.282600. Rounded receipt total $1.254175. Actual provider account delta $1.254162900, with $0.000012100 rounding difference. Account $8.970387708, key $7.462866234 at 2026-09-27T21:08:15.962Z. Zero active reservations and zero unknown new billing holds. The prior cumulative ledger and generation limit were preserved. See COSTS.md and ledger.json for every call and reservation.

Owned service PID 6216 on port 4335 was stopped after the terminal result. No user app was restarted. No Studio API was called, no bridge apply occurred and place 122588481889475 was not modified. This session created no Studio scripts, imports or probes to restore or remove. Studio PID 6604 remained running. Its current Edit/Play mode was not re-inspected, and no new native evidence is claimed.

Preserve .forge/runtime-diagnostics-profile-20260927, the original runtime directory C:/Users/7474g/AppData/Local/Temp/takko-opencode-3bS6XG, all previous failure artifacts, and docs/results/animation-resume-20260927. No further paid dispatch is authorized.
