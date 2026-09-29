# Takko design lab

Three interactive workspace directions are available at http://127.0.0.1:4356/design-lab. This is the user-authorized React substitute for the blocked Figma exploration. No direction has been applied to the production workspace. Stop here for selection.

## Design and implementation

[The design specification](design-lab-plan.md) was written before implementation. It defines hierarchy, layout, surfaces, typography, spacing, nodes, agent treatment, interaction and motion for each direction. All three use the same arena request, Combat → Energy → Abilities graph, selected Combat node, working Energy demonstration, three review items and imported R6 walk clip.

| Direction | Design | Main tradeoff |
| --- | --- | --- |
| A: Refined Takko | Labeled navigation, familiar panel structure, restrained outlined nodes, compact result cards | Most familiar structure, more visible boundaries |
| B: AI Native | Narrow icon rail, larger conversation hierarchy, inset agent surface, softer nodes and minimal progress chrome | More space for conversation, navigation labels appear on hover |
| C: Game Dev | Compact project strip, grid canvas, runtime headers and port strips, system overview and bottom inspector | More game-system context, denser controls |

The route uses Takko's actual React 19/Vite frontend, existing CSS tokens and system typography, Icons, TakkoMark, ArchitectureEditor and AnimationPlayer/TakkoViewport. The repository uses custom CSS, not Tailwind. No new dependencies or alternate HTML application were introduced. Existing component-source research is recorded in [the discovery report](workspace-redesign-exploration.md). This lab adapts layout and disclosure patterns with native React and scoped CSS transitions rather than installing an unrelated design system.

The graph retains real pan, zoom, drag, fit, auto-layout, system editing, connections and local review/save behavior. Switching A/B/C does not reload the page and retains graph edits and playback state. The agent divider supports pointer and keyboard resizing. The composer supports Enter, Shift+Enter and IME composition. Attach, model/preset, Studio, activity, assets and review controls open local dialogs. Generation and Studio states can be compared through Design & states. Dialogs use native modal focus behavior and Escape dismissal. Reduced-motion settings disable decorative animation and prevent preview autoplay.

## Isolation and actual data

`src/web/main.tsx` lazily loads the lab only for `/design-lab` and `/design-lab/`. Other paths still render App. All sandbox styling is scoped to `.design-lab`. ArchitectureEditor received optional presentation props for initial selection, demonstration status, node bounds and refitting after a layout change. Production callers do not pass those props and keep their existing defaults. The production App and global styles were not edited in this task.

Each visit creates a separate local project ID. Saves update that in-memory fixture, and lab session drafts are cleaned up on unmount. No server API helper is used. Tests monitor API requests during switching, editing, review and composer interactions and require zero requests. User projects, keys, jobs and Studio state are not read or mutated.

The clip fixture was extracted from the previously imported WalkLoopAnimation in the preserved marketplace-animation-final-data project. Only the clip was copied. It contains the actual R6 joint animation from Roblox asset 180426354, six tracks and 132 pose keys over approximately 0.667 seconds. It plays in the existing Three.js renderer with real geometry, scrubbing, orbit controls and fullscreen. It is a compatible block-rig browser preview, not a live Studio environment or a newly generated animation.

Generation progress, review receipts, Studio connection status and conversational responses are explicitly local demonstrations. Selecting Connected does not connect Studio. Sending a message does not invoke a model. No new game, execution engine, animation authoring or verified gameplay is claimed.

## Visual inspection and iteration

Captured and personally inspected every direction at 1440×900. Final comparison images:

- [A: Refined Takko](results/design-lab/A-refined-takko.jpg)
- [B: AI Native](results/design-lab/B-ai-native.jpg)
- [C: Game Dev](results/design-lab/C-game-dev.jpg)

The first passes exposed inherited main margins that displaced the workspace, crowded agent content, oversized range-input chrome, clipped nodes after switching directions and an incorrect bottom-inspector grid. Scoped resets, tighter hierarchy, minimal player controls, presentation-aware fitting and a three-column inspector resolved them. A final typography inspection caught inherited small-text margins shrinking node names. Removed those margins, prevented text flex shrinking and added a label-height assertion. Increased metadata legibility without enlarging whole cards. Earlier screenshots, including the failed inspector layout, remain alongside the final images.

## Verification

Final `npm run check` passed with exit code 0. No required stage was skipped. Results: 1,369 unit/API tests across 84 files, six offline Luau scenarios and four generated-source compilations, 14 mocked plugin groups plus plugin and eight injected-source compilations, six guard fixtures, TypeScript/Vite build, ten desktop tests, production smoke and 108 browser tests (54 desktop and 54 mobile). Eight browser executions cover the four new sandbox scenarios. Browser run duration was 4.5 minutes. Native Studio verification is outside this task.

Full output is preserved in `results/design-lab/full-check-final.log`. Generated historical report artifacts were copied into `results/design-lab/full-check-artifacts/`, then only the artifacts confirmed clean at task start were restored. Pre-existing dirty files and earlier evidence were retained. Source hashes and the exact optional ArchitectureEditor presentation diff are recorded alongside the logs. Vite reported its existing large-chunk advisory and test processes reported NO_COLOR/FORCE_COLOR warnings, neither failed a stage.

First full run: unit/API, Luau, plugin, guards, build, desktop and production smoke passed. Browser tests finished with 105 passed and three failed out of 108. Two state-control tests used an exact label locator whose text included the select content. Corrected them to the accessible combobox role/name. The mobile reduced-motion test expected controls before scrolling the offscreen lazy preview into view. It now scrolls the actual player into view first. The failed run and traces are retained in `results/design-lab/full-check-1.log` and `results/design-lab/full-check-1-failures/`.

New browser coverage checks no-reload switching, retained graph edits, node bounds and unclipped titles, actual WebGL geometry and moving clip time, paused playback across switching, keyboard camera access, usable preview controls, local state/review/composer behavior, reduced motion and absence of lab resources on production routes. Offline checks do not establish native Studio or generated-game behavior.

## Operations and handoff

Dedicated Vite preview: port 4356, PID 35536. Logs: `.forge/design-lab-vite.log` and `.forge/design-lab-vite-error.log`. Original preview 4355/PID40768 and all other pre-existing services remain untouched. Do not restart any running Takko process without permission. The test-owned 4319 service exits through the normal test runner.

No paid calls or credential access. Actual cost $0, reservations $0. Balance was not refreshed. Last known balance remains $4.994992 at 2026-09-20T23:34:36.757Z. Paid v3 trial and the old generation goal remain paused/stopped. No Studio session was performed, so no native scripts, imports or play mode needed restoring. No commit or push.

The next step belongs to the user: select A, B, C or specific elements to combine. Do not apply a direction to production before that selection.
