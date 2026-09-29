# Chat and editable game architecture

Implemented on 2026-09-21 UTC. Takko now has durable chat, a fixed composer, secondary detail drawers, an editable architecture canvas and an inline animation player in its existing visual style. This is an implementation of the first chat release and parts of the rich interaction release. The full nine-step roadmap is not complete.

## What changed

- Messages are saved separately from the original request. Stable submission IDs prevent a network retry from repeating a change. Historical proposals, plans, approvals, failures, costs and media remain readable. Old projects get an explicit saved-state record, not invented dialogue.
- The API returns the latest 30 conversation turns and provides cursor pagination. Generation uses a bounded active brief, not the whole transcript. It refuses additional instructions at the bound rather than silently discarding them.
- Chat remains the primary workspace. Build, Source and Studio open as details. Drafts survive refresh, History searches loaded messages, and earlier messages can be loaded. The composer stays inside the viewport on desktop and mobile.
- Proposed interpretation and saved answers have distinct labels. Only a revision-bound acceptance makes proposed decisions eligible as accepted planning sources. A new concept run clears that acceptance.
- Activity groups actual events by stable run ID and retains events beyond the engine's 120-event display limit. Costs come from that run's charge range. Event counts are not presented as tool-action counts.
- Contextual suggestions stage editable messages. Feedback is saved against a completed run. Studio controls and durable delivery receipts appear in chat, including unknown and failed states.

## Architecture that influences generation

Each system has a name, purpose and execution location. Connections describe an event or state and its effect. For example: Combat sends **Hit confirmed** to Energy, which **awards ten energy after server validation**. Energy can then drive the Ability HUD.

The graph is saved project data and contributes exact source IDs to planning. Validation requires each saved node and connection to have a required user requirement and an implementation task. Selecting a system exposes planned files through those requirements. A planner may propose a graph, but it remains a draft until the user reviews and saves it.

Users can add, move, edit and remove systems, connect output/input ports, and remove connections. Behavior edits checkpoint the old artifact, create a new revision and clear stale approval. Position-only edits preserve the build and approval. Invalid links, duplicate IDs, self-links and oversized graphs are rejected. Game loops are allowed because runtime connections are distinct from the build task DAG.

This is a graph that drives generation requirements. It is not yet a direct visual Luau interpreter, a live runtime debugger or proof that the produced game follows every connection. The next implementation milestone is to derive integration tests and runtime traces from those contracts and link their receipts back to each edge.

## Animation and evidence

The inline viewer plays actual validated keyframe tracks on an articulated R6 or R15 preview rig. It provides play/pause, loop, scrub, orbit and zoom. Players load lazily and pause when off screen. Rig-incompatible tracks are rejected. There is no misleading R6/R15 switch for a clip that supports only one rig.

The current input is an imported JSON clip, with import provenance retained. The demo punch is an authored sample, not AI output. Automatic generation, Roblox asset publishing, conversion of arbitrary Roblox animation assets, and native Studio playback are not implemented by this change. Screenshot evidence also retains its existing provenance.

## What Lemonade inspection established

The public frontend builds its graph from game-memory Markdown and plays JSON animation clips with a browser 3D viewer. That establishes concrete rendering and data-flow behavior, not its private generation system or a graph-to-Luau compiler. See [the evidence report](lemonade-chat-architecture-findings.md). Original public assets and separate readable derivatives are preserved. Product code was written independently.

## Verification

The final full `npm run check` passed with exit 0. It ran 1,351 unit/API tests across 82 files, six offline Luau combat scenarios, 14 mocked plugin test groups plus compilation of the plugin and eight injected sources, six matching guard fixtures, TypeScript/Vite build, ten desktop tests, production smoke, and all 92 browser tests (46 desktop and 46 mobile). No check stage was skipped. The targeted delayed-budget-response browser rerun also passed both tests. Native Studio gameplay was not run. Final log: [full check](results/chat-final-check/full-check.log). Source hashes relative to the start-of-turn backup: [manifest](results/chat-source-manifest.json). Earlier failures remain in the run logs and traces. Offline fixtures and the local HTTP provider test do not establish paid-model quality or native gameplay.

Failures found and retained:

- The first full check passed unit/native-mock/build stages but could not collect browser tests because a new concept import pulled a JSON capability module into the Playwright Node process. Moving pure brief-source assembly into its own module removed that runtime dependency.
- The second full check passed 1,350 unit/API tests and all pre-browser stages, then passed 78 browser tests and failed 14. Failures included a wildcard mock returning a project where Studio receipts were expected, old tab/selector assumptions, a mobile composer outside the viewport, and a generation workflow timeout. Receipt validation now also keeps malformed responses from crashing chat.
- The third full check passed 1,351 unit/API tests and all pre-browser stages, then passed 86 browser tests and failed six. Trace inspection established that approval automatically opened the Build dialog, intercepting the next action. Approval and generation now stay in chat. Other failures were remaining selectors for collapsed brief content and duplicate Studio controls.
- A layout-only unit regression initially failed because object key order changed during schema parsing. Semantic comparison now uses explicitly ordered fields, excludes coordinates and is also used for generation budget hashes. The focused unit rerun passed all 12 tests.
- Visual review caught an invisible rig despite passing attribute-change checks. An SVG coordinate template contained literal arithmetic. The corrected viewer is now tested for actual nonzero geometry inside the viewport as well as pose/time changes. The blank screenshot is preserved under `results/chat-full-check-3/`.
- The final focused browser run passed ten of twelve tests. The two remaining failures matched both historical file paths and the Source code block. Selectors now target the Source dialog explicitly. This was a test ambiguity, not a failed build.
- The fourth full check passed all pre-browser stages and 90 of 92 browser tests. A real race in the existing budget dialog let a late settings response replace an already typed amount with the default. An edit guard now preserves user input, and the browser test deliberately withholds the settings response until after typing. The earlier progress claim that all desktop tests passed was incorrect. This full result supersedes it.

Historical evidence is retained in `results/chat-full-check-1.log`, `results/chat-full-check-2/`, `results/chat-full-check-3/`, `results/chat-focused-browser-final/`, and the earlier focused logs. No failure was replaced by a later success claim.

## Walkthrough

1. Open [the isolated preview](http://127.0.0.1:4351/?project=a84134d4-fced-42c4-a6fe-dcf4a2a4dc15).
2. Open **Architecture** to see Combat, Energy and Ability HUD. Select a system to inspect its purpose and execution location.
3. Use its output/input controls to specify **When** and **Then**. Review changes before saving. Saving itself does not invoke a model or mutate Studio.
4. Return to chat. The architecture update is retained as a message. A configured, explicitly authorized generation can plan and build those requirements through the existing approval flow.
5. Play or scrub the imported punch clip in the conversation. Source and Studio details remain available without losing the chat draft.

[Automated UI test recording](results/chat-final-check/ui-test-walkthrough.mp4) shows actual graph editing and imported-clip interaction. It is a short, silent test recording, not a generated game or narrated Studio demonstration. The 6.8-second MP4 decoded fully without errors. The graph and rig screenshots were inspected visually.

The isolated preview has no provider credentials. Existing key-bearing services were not restarted. No paid inference was performed. Cost is $0. Last known testing-key balance remains $4.994992 at 2026-09-20T23:34:36.757Z, not refreshed.

Studio was inspected read-only and observed in Edit mode. No native scripts, probes, imports or play session were created or changed, so no native restoration was needed. General existing-game inventory/editing and the end-to-end chat-to-Studio gameplay demonstration remain separate unfinished milestones.
