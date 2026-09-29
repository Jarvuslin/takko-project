# Selected B workspace foundation

The real project workspace now uses B's visual foundation with a more prominent canvas and a docked inspector. The user selected roughly 80% B and 20% C. A/B/C design-lab comparisons remain available and their styling is unchanged.

Live review: http://127.0.0.1:4357/?project=a84134d4-fced-42c4-a6fe-dcf4a2a4dc15. This is the real App on a separate keyless service with a copied walkthrough project. It is not the design-lab fixture and does not restart the user's existing servers.

## What changed

The 76px icon rail, inset agent surface, soft warm monochrome cards, spacious typography and reduced activity borders come from B. Project selection stays available through the Projects icon and searchable popover. Marketplace, Models, Presets, new project and plugin access retain their existing actions. Mobile retains labeled navigation and the project picker.

The canvas receives the remaining width beside a 400px agent panel at 1440px. Nodes separate runtime, name, evidence-based status and connection ports. Directional event labels are centered beneath the connection path, outside the example nodes, with a background-colored stroke for contrast. Labels are included in canvas geometry and fit bounds. New manually added nodes receive enough spacing for the larger cards. Saved node coordinates are not rewritten merely by opening the workspace.

The inspector occupies a bounded row below the map and its controls. It does not use an overlay or absolute positioning. Desktop presents details, connection creation and existing connections in columns. Closing it returns the area to the graph. ResizeObserver refits the camera to the available surface when the dock or viewport changes. This does not alter graph coordinates or contracts. Existing draft persistence, conflict detection, review and save are preserved. Short phones use a smaller scrollable dock and allow workspace scrolling when editing or conflict information needs additional space.

Chat, model selection, budget actions, Studio controls, actual evidence and imported animations remain wired to the existing components. No demonstration progress or success claims from the lab were copied into production. Node status comes from systemEvidence. The actual imported clip remains in the existing Three.js player.

Implementation files: App.tsx, ArchitectureEditor.tsx and the project-scoped workspace-native.css. No backend, schema, provider, package or plugin changes. The selected style applies when a project is open. Models and Presets retain their settings layout. Design rationale was recorded before implementation in [the plan](b-foundation-plan.md).

## Visual verification

Captured and inspected the real workspace at 1440×900, with and without the inspector, and at narrow phone sizes. [Workspace](results/b-foundation/workspace-final.jpg), [docked inspector](results/b-foundation/inspector-final.jpg), [mobile](results/b-foundation/mobile-final.jpg).

The first pass exposed an edge label behind a node. Routing and label bounds were adjusted, and a test checks label/node separation in the reference graph. Browser tests then found save and conflict controls overlapping the mobile chat header. Mobile rows now reserve space for those controls and can scroll. A final short-phone inspection led to reducing the dock's mobile height so fitted nodes remain within the map. Earlier screenshots, logs and traces are preserved.

The preview project is the existing interface walkthrough with real imported clips. It is not a newly generated or verified game. The layout does not turn the architecture editor into an n8n execution engine. Dense or manually overlapping graphs can still require pan, zoom, dragging or auto-layout.

## Tests

Initial build passed. Focused run 1: 13 passed and five failed out of 18 browser tests. Two failures were new test locators. Three were real mobile save/conflict overlaps, including existing regression tests. Focused run 2: nine passed and one failed out of ten. The remaining failure was a non-unique fixture name matching earlier retained projects. The fixture now has a unique name. Original logs and failure traces remain under results/b-foundation.

Full run 1 passed every stage before the browser suite, then finished with 109 browser passes and three failures out of 112. Two failures exposed the review panel competing for space with an open inspector. Opening review now collapses the dock, and the dock can shrink when needed. The other failure was the existing concept test expecting a permanently visible project list. It now opens the Projects icon before checking the refreshed project name, preserving its original failed-library-refresh assertion. The original full log and traces remain preserved.

Final `npm run check` exited 0 on 2026-09-21. It passed 1,369 unit/API tests across 84 files, six offline Luau scenarios and four generated-source compilations, 14 mocked plugin groups plus plugin/eight injected-source compilations, six guard fixtures, TypeScript/Vite build, ten desktop tests, production smoke and 112 browser tests (56 desktop, 56 mobile). The browser stage took 6.5 minutes. No required stage was skipped. Native Studio was not exercised.

New tests cover inspector/map separation, fitted node bounds, label/node separation, real architecture save with unchanged connections and zero charges, icon-rail project access and model navigation. Existing tests exercise canvas gestures, remote draft conflicts, imported animation playback and the rest of the application. The final run includes the smaller mobile dock, review collapsing the inspector and the updated project navigation assertion.

Full logs and failure evidence are retained. Regenerated tracked report artifacts that were clean at task start were archived under full-check-artifacts and restored using read-only HEAD blobs, without touching the existing Git index lock. Routine untracked browser captures now reflect the new UI. Prior failure folders and research evidence are preserved. Source hashes and exact diffs from this task's baseline are included. The preview project was hash-checked and is byte-for-byte identical to its original copied source after manual verification.

## Operations and limits

Preview4357 runs as PID13236 from .forge/b-foundation-preview.mts with env:{} and its own .forge/b-foundation-preview-data. It uses the real App and backend, with no copied provider settings or credentials. Vite reported that an existing service owns websocket port24678. Explicit browser reloads were used for visual verification, and production-built browser tests do not depend on HMR.

Actual paid cost $0 and reservations $0. No provider credentials accessed or paid runs authorized. Balance not refreshed, last known $4.994992 at2026-09-20T23:34:36.757Z. Existing processes, original project data and Studio were not changed. No native Studio session, so no scripts, probes, imports or play mode needed restoring. Paid v3 trial and old generation goal remain paused/stopped. No commit or push.

Source baselines: .forge/b-foundation-before. Final test log, source hashes and run results are stored under docs/results/b-foundation. Existing Git index lock is not modified. Never restart any running Takko service without user permission.
