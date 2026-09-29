# Takko integrated canvas and agent workspace

Implemented the workspace structure in the user's Lemonade screenshots while keeping Takko's existing dark design system. This is application code, not a Figma mock. Verification and remaining limits are recorded below.

## What changed

- The architecture canvas permanently occupies the larger left pane. The conversation and pinned composer stay on the right. Small screens stack the canvas above the conversation while preserving both surfaces.
- Removed primary Chat/Build/Source/Studio tabs and the architecture modal. Build, Source and Studio are secondary detail drawers. Existing project navigation, Models and Presets remain available.
- Canvas supports pointer pan, arrow-key pan, wheel/button zoom, node dragging, fit and deterministic automatic layout. New nodes trigger framing. Selecting a node opens an inspector inside the canvas. It exposes purpose, authority, linked files, a discussion action and event/state connection editing.
- Saved architecture remains authoritative. Valid new proposed systems can be added to the view. Planning is instructed to return actual game systems and event/state links. A build task dependency is never converted into a supposed runtime connection.
- Project state now refreshes continuously. Clean graphs accept remote updates. Unsaved edits remain intact and a conflict notice offers the latest architecture. Drafts persist in session storage for refresh and settings navigation. Saving behavior changes still requires the existing review step and invalidates plan approval. Layout-only saves preserve approval.
- Run cards retain script lists, asset statuses, effect/audio declarations and architecture proposals at the revision that produced them. Unchanged older build output is not attributed to a new planning run. Existing failures, costs and Studio receipts remain in the conversation.
- Replaced SVG projection with a real Three.js WebGL2 scene. R6/R15-compatible block rigs have articulated parent/joint transforms and sample the imported clip's actual rotation tracks. Autoplay loops by default, with reduced-motion users starting paused. Controls include orbit, wheel zoom, right-drag pan, pause, restart, scrub, speed, frame and fullscreen.
- The reusable viewport accepts a scene factory. It computes camera framing from sampled motion bounds, renders a grid and lighting, stops drawing offscreen, disposes GPU resources and has explicit graphics failure/retry states. Offscreen cards mount previews lazily. The Three.js chunk is loaded separately from the main application.

## Evidence and limits

The screenshot references are preserved in research/evidence/lemonade-chat-user-20260921. Prior research findings remain in docs/lemonade-chat-architecture-findings.md. No private Lemonade backend claim is made.

The 3D scene is real WebGL rendering of a locally constructed compatible block rig. It is not a native Roblox renderer or an imported custom avatar. This change does not generate/publish animation assets, resolve arbitrary Roblox animation IDs, retarget R6 clips to R15, or prove animation playback in Studio. Only the rig supported by the actual clip is shown as compatible.

Asset, audio and VFX cards display observed output and provenance. They do not claim an asset is playable merely because the model declared it. Their generic interactive viewers are future scene adapters. The current reusable viewport is implemented and used for joint-track animation.

Graph connections are generation contracts. They affect planning and implementation requirements, but are not an n8n runtime interpreter or verified game execution traces. Older plans without an architecture proposal have an empty canvas until systems are added or a new plan supplies a proposal. Model compliance with the new instruction has not been measured in a paid run.

No paid inference, credential access, balance refresh, native Studio session, game publication, commit or push. Cost and reservations are both $0. Last recorded balance remains $4.994992 at 2026-09-20T23:34:36.757Z. The paused trial and generation goal remain stopped.

## Verification

Full npm run check passed on the final source. 1,358 unit/API tests across 83 files, six offline Luau scenarios, 14 mocked plugin groups and plugin plus eight injected-source compilations, six guard fixtures, TypeScript/Vite build, ten desktop tests, production smoke and 98 browser tests (49 desktop, 49 mobile). No required stage was skipped. Native Studio verification was not performed.

Final log: docs/results/integrated-workspace/final-check/full-check.log. Full runs and focused failures are preserved under docs/results/integrated-workspace. Offline provider adapters and Studio mocks do not establish production model quality or native game behavior.

The source baseline is .forge/integrated-workspace-before. The source manifest records only this turn's differences, preserving the repository's extensive earlier work.

## Dependencies

Three.js 0.186.0 and @types/three 0.186.0. Official references: [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html) and [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html). Vite reports the lazy Three.js preview chunk above its 500 KB advisory threshold, approximately 141 KB gzip. This is a size warning, not a failed build.

## Preserved failures and corrections

- First focused browser run: 1/6 passed. Fixed explicit From/To labels, inspector interactions on mobile and mobile height accounting. Camera testing now brings the viewport back into view after using its controls, because offscreen drawing intentionally stops.
- Focused startup attempts 2 and 3 failed to build. Corrected the new fixture's argument list and its nullable job ID. Original startup logs remain preserved.
- Focused run 4: 5/6 passed. A mobile screenshot comparison captured a clipped portion of the canvas. The test now compares actual WebGL canvas image data at two known poses, then captures the visible UI separately.
- Focused run 5: 7/10 passed. Two tests exposed that idle project data was not polled, and one Windows Playwright worker exited with code 3221226505. The worker failure remains recorded. Idle polling and conflict handling were corrected.
- Full run 1: every non-browser stage passed, 93/98 browser tests passed. Restored compact-width project navigation and updated viewport tests to scroll the card into view before expecting a lazily mounted scene.
- Full run 2: the complete check passed with 1,358 unit/API tests and 98 browser tests. Subsequent visual inspection found mobile map focus could introduce an internal scroll offset. Added overflow clipping, compacted mobile headers and added zero-scroll-offset assertions. Full run 3 verifies these final changes.

## Preview

Final isolated, keyless preview: http://127.0.0.1:4353/?project=a84134d4-fced-42c4-a6fe-dcf4a2a4dc15, PID15328, .forge/integrated-preview-final-data. The sample explicitly identifies itself as an interface walkthrough, not a generated/verified game. Browser screenshot: docs/results/integrated-workspace/final-workspace.png.

Earlier keyless preview4352/PID27284 remains running with an earlier backend. Existing app services were not restarted or killed. No Studio session was opened or changed, so no scripts, probes, imports or play-mode state needed restoring.


Finalized 2026-09-21T03:16:23.343Z. The first mobile clipping observation remains in this task's image-tool output. workspace-mobile.png is the final corrected capture. Historical docs/results artifacts were restored from the pre-task backup, with this run's changed versions archived under integrated-workspace/final-check/prior-artifact-new-versions.
