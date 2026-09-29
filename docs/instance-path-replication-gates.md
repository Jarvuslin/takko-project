# Instance path and client visibility gates

The pipeline now rejects the preserved nonexistent dummy paths before committing a task or repair. The proposed KeyframeSequence non-replication cause was not reproduced. In scratch Play, all three sequences existed on both server and client, and the unchanged controller registered and played the selected clip after only the two dummy paths were corrected by hand.

This does not invalidate the user's recorded failure. It establishes a contradictory reproduction that must be preserved. The original project and export remain unchanged. No new paid generation confirmed model behavior.

## Evidence and primary sources

Input is attachment abe92c8a-3dbd-4049-a566-115c32e2d141, including the user's verbatim warnings. The earlier drag-parts report is withdrawn and was not used as evidence. Original fixture: docs/results/approved-reference-finish-20260927/terminal-project.json, six generated sources and game.rbxlx. Second real output: benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/final-project.json.

Current official sources checked:

- [KeyframeSequence](https://create.roblox.com/docs/reference/engine/classes/KeyframeSequence) describes temporary registration for localized testing. Its class metadata does not mark it NotReplicated.
- [RegisterKeyframeSequence](https://create.roblox.com/docs/reference/engine/classes/KeyframeSequenceProvider#RegisterKeyframeSequence) provides a temporary ID for Studio testing, unsuitable outside Studio. Documentation does not establish that a server registration ID will work in a separate client runtime. No such assumption was introduced.
- [ServerStorage](https://create.roblox.com/docs/reference/engine/classes/ServerStorage) and [ServerScriptService](https://create.roblox.com/docs/reference/engine/classes/ServerScriptService) describe server-only contents.
- [Camera](https://create.roblox.com/docs/reference/engine/classes/Camera) has a class-level NotReplicated tag. Property-level tags must not be treated as class replication rules.

The raw official creator-docs YAML was checked as well as Creator Hub. The KeyframeSequenceProvider service's NotReplicated tag is not a tag on KeyframeSequence.

## Generic implementation

`src/generation/instance-path-check.ts` reads the actual exporter XML, including scene nodes, runtime script names and merged retained component XML. It uses the Luau AST to resolve literal WaitForChild/FindFirstChild chains, local aliases, namespace config arrays and path strings. Missing targets fail with a nearest real hierarchy path. Comments do not create lookups.

The checker propagates client execution through static require dependencies. It rejects paths under documented server-only containers and through the documented non-replicating Camera class. The centrally defined sets cite their sources. KeyframeSequence is deliberately not on this list, because doing so would contradict both the documentation checked and the actual scratch observation.

`src/generation/engine.ts` runs these checks inside task submission validation after compilation, inside repair response validation before commit, and in the final checks before ready_to_test. Standard builders and OpenCode submissions share the task validator. Review context receives the structured checks. An unexportable existing artifact becomes failed evidence in repair context instead of throwing before the correction loop. Invalid submissions leave previous artifact and completed tasks intact. Spending limits and retry policy were not changed.

`src/generation/retained-animation.ts` retains same-context local registration, with explicit documentation, Studio-only lifetime, client-presence requirement, bounded-wait guidance and prohibition on assuming cross-runtime ID availability. No new animation transport was invented to address an unconfirmed cause.

Static limits are explicit. This is bounded analysis, not a complete Luau interpreter. Computed names, arbitrary function-return paths, conditional creation and runtime timing cannot all be proved. Recognized runtime-created instances are pending, never inserted into the exported hierarchy or marked statically present. A static path pass is not a client replication, streaming, permission, registration or gameplay pass.

## Real-output replay

`docs/results/instance-path-replication-20260928/real-output-replay.json` contains checks for all six original generated files, the two hand-corrected scratch sources and the second real game's output.

The old DummySetup produces two missing-path failures. The old PunchConfig produces one. Both point to the actual retained hierarchy without Imported. The old PunchController's selected sequence path passes and resolves on the scratch client. Therefore the requested claim that all three old files were rejected would be false. No rejection was fabricated to satisfy that expectation.

The hand-corrected scratch source pair produces zero missing-path failures. The original Butter Crunch output also produces zero failures. Its regression tests remove the producer's actual CrunchCount node and require both affected real lookups to fail. Additional fault-injection tests move real client targets to server-only storage or change the target hierarchy class to Camera. These transformations are tests, not claims that the preserved original had those defects.

## Scratch Play procedure and findings

Used only the already open scratch .forge/visual-scratch-20260928/Takko-Before-Scratch.rbxlx, Studio connection 4af0c536-39b7-42ed-96f7-fb4d711a5483, PID18552. Announced before starting Play and before editing. PIDs6604 and41900 and the original export were not modified.

Unmodified scratch Play reproduced DummySetup's infinite-yield warning. Both server and client inspections found all three KeyframeSequences under their original AnimSaves parents. No animation infinite-yield warning appeared in this reproduction. Workspace.StreamingEnabled was false.

Hand corrections only: remove the nonexistent Imported step from DummySetup and PunchConfig. No controller or animation-source change. In Play, positioned the test character within the existing server's hit range, installed disposable observation listeners, and sent two real F-key presses through the Studio input tool. This bypassed walking to the target, not the input controller, remote, server hit validation or HUD update.

Observed: two temporary-ID animation tracks, each length about 0.6s, IsPlaying true and TimePosition about 0.154s after starting. Server-confirmed counts 1 then2 and HUD Hits:2. Dummy model pivot (0,3,15), identity rotation, all BaseParts anchored. A client sound playback event fired, and the selected sound subsequently loaded with duration about1.529s. Audible speaker output was not verified. The corrected session console was empty.

Scratch scripts were restored to their exact original source after stopping Play. Play-only listeners and character changes were discarded with the session. No persistent probe scope or imported content was added. A repeat native verification after the first complete check, while the frozen-source final check ran, is recorded separately below.

## Verification

The final frozen-source `npm run check` passed with exit 0. Verification is recorded in docs/results/instance-path-replication-20260928/verification-final.json. The initial full run stopped at Vitest with3 failures and1640 passes. Two failures concerned ordering of compiler diagnostics, corrected by running the task path gate after compilation. The repair-limit fixture now expects the existing bounded correction retry when malformed repair output is rejected before commit. A focused68-test rerun passed. Another regression proves an unexportable artifact can reach repair context.

No paid inference, no new trial or project resume. No Takko app restart. $0 spent. Last verified balance remains account$7.133167908/key$5.625646434 at2026-09-27T23:52:52.242Z, not refreshed. All paid runs remain paused.

## Untouched work

Earlier items still pending: baseplate/default world, physical integrity analysis for retained props, source-pack destination, explicit multi-clip selection and relevance evidence, consequential planner questions, and after-base-world lighting comparison. The only earlier item implemented here is the instance-path validation gate. This work does not make a claim of overall game quality or a successful new generated game.

## Additional native verification

After one complete check passed and while the frozen-source final check ran, repeated the same two scratch corrections. The R15 client produced counts1,2,3 and HUD Hits:3. On the second and third punches the selected sound was loaded, IsPlaying true, with TimePosition0.128 and duration1.52884s. This establishes native playback state, not independently heard speaker audio. The dummy stayed at pivot(0,3,15), identity rotation, with no unanchored BaseParts. Console empty.

The initial shoulder probe returned empty arrays because this actual R15 avatar uses AnimationConstraint joints rather than Motor6D shoulders. That failed measurement remains in final-play-client.json. A further scratch Play measurement sampled actual arm/hand BasePart CFrames relative to HumanoidRootPart. RightHand moved about3.484studs by track time0.3125s. Other arm poses also changed. This supports actual native animation movement, without a visual-quality judgment. See limb-motion.json and limb-motion-summary.json. Controller source was unchanged throughout.

Stopped scratch Play, restored both original script strings with equality assertions, and restored the baseline Edit camera. No persistent probe objects remain. Read-only state checks found both protected original places in Play mode. They were not stopped because the user expressly prohibited touching PIDs6604 and41900. Asked whether the user will stop them or authorizes stopping Play only. Do not claim all Studio places are in Edit until that conflict is resolved.

## Final checks and preservation

| Stage | Actual result |
|---|---|
| Build | TypeScript and Vite passed |
| Vitest | 1,644 passed across 115 files |
| Offline Luau | 6 scenarios passed, 4 sample sources compiled |
| Plugin mocks | 14 groups passed, plugin plus 8 injected sources compiled |
| Guards | 6 expected-outcome cases passed |
| CSS | 0 errors, 556 warnings |
| Desktop | 14 tests passed |
| Production smoke | HTML, bundle, API and unknown-route checks passed |
| Browser | 171 passed, 1 existing mobile pointer-resize test skipped |

No stage skipped. The earlier complete check passed 1,643 unit tests before the last repair-context regression was included. The final complete run includes it. No real paid generation was performed. Native scratch observations remain separate from offline tests.

All 385 source files in the final manifest are unchanged after the final check. All 14,005 prior evidence files match their initial hashes. Each check pass overwrote 31 existing test artifacts, which were archived separately and restored. Protected project JSON and original export hashes also match. No source or generated project edits occurred during final attestation.

At 2026-09-28T02:53:50Z there were no listeners on 4318, 4319, 4320, 4324, 4335 or 4336. Studio PIDs 6604, 41900 and 18552 remained running. Scratch PID18552 is restored and in Edit mode. Both protected places remain in Play mode, untouched. The pending user question about stopping those places was unanswered. Their no-touch restriction takes precedence over assuming permission to stop them. Cleanup of those two user-controlled sessions is the only outstanding mode requirement.