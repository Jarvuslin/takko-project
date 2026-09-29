# Marketplace animations and simpler playback

Implemented the current animation request while retaining Takko's workspace and style. Skills retained: concise-planning and 3d-web-experience. No paid inference or credential access.

## Behavior

The player now has play/pause, a timeline and fullscreen. Removed the Camera disclosure, orbit/zoom buttons, restart, playback speed and framing buttons. Direct orbit, pan and zoom remain. Keyboard left/right, +/-, and Home provide camera access without adding controls. Only the clip's actual rig badge appears.

Dropping a Roblox animation link or a model pack into an existing project's composer follows the Marketplace path and adds a persistent chat gallery. The same path supports Marketplace Add. A selector lists every discovered Animation, KeyframeSequence or unsupported CurveAnimation entry within the bounded pack. Only the selected playable clip mounts a renderer. Individual permission and format failures remain selectable with their errors. Repeating a drop does not create a duplicate card when its data is unchanged. Preview loading does not start generation or modify a game.

The server reads detached assets through Studio in Edit mode. It reads Animation references and embedded sequences, transfers deterministic JSON with chunk integrity checks, and clones cached keyframe sequences before destroying owned temporary objects. Native rig offsets support Motor6D and AnimationConstraint. The preview uses real rotations, translations, weights and native joint offsets with quaternion interpolation. Zero-duration pose assets remain still.

## What real means here

The WebGL environment is interactive and the Marketplace motion comes from Roblox clip data. It is a browser block-rig stage, not the live Studio environment, an imported custom avatar mesh, or a verified running game. Nonlinear easing uses standard approximations and may differ from Studio. Custom joints, curve animation playback, animation IDs created only by scripts, and catalog bundles are not supported. No retargeting or animation publishing was added.

Limits are explicit: 100 entries per pack, 10,000 non-clip container instances, 300 keyframes per clip, 30 seconds per clip, 8 MB of loaded clip data per pack, 16 saved packs and 16 MB of pack data per project. Packs outside the discovery limit return an error. Entries that fail individual loading are retained, not substituted with generic motion.

## Native observations

Read-only tests used Untitled Experience, place 122588481889475, Studio 9a2d384f-1a8f-4da1-890b-d06532c12ede. No imported objects were parented into the place and no user scripts were changed. Owned detached assets and rigs were destroyed. Studio remained in Edit mode. No native play session or native playback verification was performed.

- Roblox asset 507771019, R15Dance1A: 15 tracks, 405 pose keys, 15 native rig parts. Saved source data is the renderer regression fixture.
- Roblox asset 180426354, WalkLoopAnimation: six tracks, 132 pose keys, six native rig parts. The final HTTP endpoint returned 200, preserved revision 2, left jobId null and did not change charges.
- Creator Store model 14037816274, Throw Animation Pack: its embedded throw sequence loaded and visibly animated in the actual chat UI after using Marketplace Add. The saved clip has nine tracks and a full R15 preview rig.
- Model 16934259919, SPH Pistol Animation Pack: all 16 manifest entries were retained. References failed Roblox loading, while embedded weapon/custom-rig clips were outside the supported body-rig format. This is failure evidence, not a successful gameplay claim.
- Model 14879742898 exceeded discovery limits. The first attempt unnecessarily traversed every pose. Discovery now stops at clip boundaries, after which the pack still exceeded the explicit 100-animation limit. Both observations remain preserved.
- Model 10421592648 returned one playable R15 throw clip.

The first probe exposed that AnimationClipProvider returned a cached instance. Destroying that instance made later reads empty through that provider. The implementation now uses a private clone from KeyframeSequenceProvider and never destroys its returned cached source. No place scripts or objects were involved. The initial failure is preserved in native-first-failed files.

API references consulted: [KeyframeSequenceProvider](https://create.roblox.com/docs/reference/engine/classes/KeyframeSequenceProvider), [Pose](https://create.roblox.com/docs/reference/engine/classes/Pose), [PoseEasingStyle](https://create.roblox.com/docs/reference/engine/enums/PoseEasingStyle), and [AnimationConstraint](https://create.roblox.com/docs/reference/engine/classes/AnimationConstraint). These describe the public APIs, not evidence of another product's implementation.

## Verification

Final npm run check passed on the final source: 1,369 unit/API tests across 84 files, six offline Luau scenarios, 14 mocked plugin groups with plugin and eight injected-source compilations, six guard fixtures, TypeScript/Vite build, ten desktop tests, production smoke and 100 browser tests (50 desktop, 50 mobile). No required stage was skipped. The native data extraction and actual UI observations above are separate from these offline checks. The first full check passed 1,368 unit/API tests across 84 files, six offline Luau scenarios, mocked plugin checks, guards, build, ten desktop tests, production smoke and 100 browser tests. The final run includes the subsequent discovery and zero-duration fixes and their additional test.

Focused checks: initial 73/74 unit tests with a test assertion mistakenly calling Response.status as a function. Corrected run 74/74. The final focused animation suite passes 11/11, including executable offline Luau discovery/cleanup checks. Focused browser run passed eight tests across desktop and mobile. These mock pack responses and do not establish native integration. Separate real-asset observations above do.

Evidence: docs/results/marketplace-animation. Source snapshot: .forge/marketplace-animation-before. source-manifest.json separates this task's changes from the pre-existing dirty tree. Historical result files are restored after archiving their new versions. No commit or push.

## Preview and cost

Final isolated preview: http://127.0.0.1:4355/?project=a84134d4-fced-42c4-a6fe-dcf4a2a4dc15, PID40768. Data: .forge/marketplace-animation-final-data. Frontend snapshot: .forge/marketplace-animation-final-dist, preventing subsequent builds from removing chunks under an open tab. The original workspace demo history remains labeled as a demo, with real imported previews appended.

Intermediate preview4354/PID2564 stays running on its earlier backend. All existing services remain untouched. Do not restart them without permission. Paid trial v3 and the old generation goal remain paused/stopped.

Actual inference cost $0. Reservations $0. No balance refresh. Last known key balance $4.994992 at 2026-09-20T23:34:36.757Z. Saved DPAPI key reuse authorization remains in force.
