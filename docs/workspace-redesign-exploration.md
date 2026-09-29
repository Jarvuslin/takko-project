# Takko workspace redesign exploration

Date: 2026-09-21. Status: research and local UI audit prepared, Figma creation blocked. No frontend implementation.

## Result and blocker

The connected Figma Starter plan has exhausted its MCP tool-call allowance. Both the read-only file inspection and library discovery returned the same limit error. The required account diagnostic confirmed a Full seat on a Starter team. No Figma mutation was attempted or completed. Existing file contents, components and tokens could not be inspected. Do not infer that the existing file has no reusable components.

Target file: [Takko concept](https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5/Takko). Planned page: **Takko — Workspace Redesign Exploration**. The page and the A/B/C frames have not been created.

The user's first pasted brief requires Figma design and selection before React changes. It takes precedence over implementation instructions in the second brief. Work stops before frontend implementation. Design creation needs restored Figma MCP capacity or an explicitly agreed alternative workflow.

Skills consulted: figma-use, figma-generate-design, figma-generate-library and figma-use-motion. The library workflow requires discovery and validation before construction. Its instruction is: “If a phase cannot pass, stop and report the blocker.” Phase 0 cannot pass without Figma discovery. Independent local audit and public component research are recorded below, not represented as completed Figma work.

## Current UI audit

Observed the running keyless preview at port 4355, project a84134d4-fced-42c4-a6fe-dcf4a2a4dc15. Inspected the live accessibility tree and screenshot without changing the project or its existing unsaved draft. [Current workspace screenshot](results/workspace-redesign-exploration/current-workspace.png).

Source read: src/web/styles.css, grok-theme.css, conversation.css, ArchitectureEditor.tsx and preview/TakkoViewport.tsx. No Code Connect files matched the repository search for *.figma.*.

Observed strengths:

- The taco mark, monochrome shell, persistent graph and agent pane already establish a recognizable product.
- Combat, Energy and Ability HUD have explicit relationships and event labels. Selected-system editing and review actions exist.
- The composer remains at the bottom of the agent pane.
- Imported animation cards contain a real Three.js WebGL renderer, grid, articulated rig and OrbitControls. The current R6 walk is visible. This is a browser rig preview, not a live Studio environment or verified game.
- Playback respects reduced motion and the visible controls are already minimal.

Design problems observed at the current viewport:

- The tall inspector occupies a large portion of the center pane and obscures graph content. System editing and connection creation share a long form.
- The project title appears in several structural locations, spending space while still truncating.
- Nested animation cards repeat clip names and borders. The viewport can occupy more of that area if repeated chrome is consolidated.
- The graph has substantial open space, yet ports, runtime labels and node status are small. Stronger hierarchy would make nodes easier to read.
- Destructive removal sits close to routine system actions. Separate it into a collapsed danger section.
- Build, Source and Studio compete visually with graph actions despite being secondary workflows.
- Repeated rounded containers have similar emphasis. Reserve strong surfaces for selection, active work and user decisions.

No game generation or paid test was run for this audit. The current project labels itself an interface walkthrough. The selected-system inspector reports that no implementation is linked yet.

## Component research

These are primary documentation observations and proposed Takko adaptations. No packages were installed and no third-party visual system was adopted.

| Source | Observed pattern | Proposed Takko adaptation |
| --- | --- | --- |
| [shadcn Resizable](https://ui.shadcn.com/docs/components/base/resizable) | Accessible panel groups with keyboard support and visible handle option | A subtle, discoverable canvas/chat divider. Preserve minimum usable widths and keyboard resizing. |
| [Animate UI Accordion](https://animate-ui.com/docs/components/radix/accordion) | Disclosure headings, configurable content transition and retained rendering option | Compact activity details and inspector groups. Short height/opacity changes, stable focused controls. |
| [Magic UI Animated List](https://magicui.design/docs/components/animated-list) | Sequential list entrance with a configurable delay | Brief arrival transition for real agent events. Do not use its default delayed presentation to simulate processing. |
| [Aceternity catalog](https://ui.aceternity.com/components) | Expandable sidebar, timeline and multi-step loader patterns | Borrow navigation grouping and visible stage labels. Use actual state transitions. Avoid hover-only navigation, scroll beams and decorative loading. |
| [21st.dev community catalog](https://21st.dev/community/components) | AI chat, sidebar, command menu, input and empty-state discovery categories | Use as a comparison index for compact composer anatomy and action placement. Individual component implementations were not audited or selected. |
| [Motion Primitives Dialog](https://motion-primitives.com/docs/dialog) | Official indexed documentation exposes configurable transitions | Candidate for continuity between a compact preview and enlarged inspection. Direct page retrieval failed, so detailed behavior and implementation remain unverified. |
| [Kibo AI Conversation](https://www.kibo-ui.com/components/ai-conversation) | Official indexed documentation identifies conversation, response branching and AI input components | Keep a single activity stream with embedded artifacts. Do not introduce branching controls until there is a product need. Direct page retrieval failed, so this is a pattern lead rather than an implementation recommendation. |
| [Cult Expandable Toolbar](https://www.cult-ui.com/docs/components/toolbar-expandable) | Controlled expansion with step-based content and focus/navigation guidance | One small canvas action bar that reveals relevant tools. Avoid turning everyday editing into a mandatory wizard. |

Research limitations: Motion Primitives transition-panel returned HTTP 403. Kibo's initially attempted AI index and Cult's initially attempted toolbar path were unavailable. Official search results resolved the conversation and expandable-toolbar pages. Cult's detailed page was read successfully. No failed retrieval is treated as source inspection.

## Shared comparison content

All three planned frames use 1440 × 900 and the same project state. This is a deliberately authored design scenario, not a claim that the current demo generated a game.

- Project: “Demo: build a small arena where confirmed hits charge an ability”. Use a compact display name with full name available in project details.
- Combat is selected. Energy is updating. Abilities is unchanged.
- Combat emits Hit confirmed to Energy. Energy adds ten charge after server validation. Energy emits Energy changed to Abilities for the player's meter and readiness indication.
- A previous agent result says “Combat changes ready to test”. The current activity says “Updating energy charge”. Generation completion and Studio verification remain separate.
- Animation card shows a real imported clip and compatible rig. R6/R15 choices are available only where the asset supports them. Unsupported rigs must not imply retargeting exists.
- The composer includes attachments, preset and budget access with a clear primary action. It stays visible during generation.
- Review Changes shows three pending items in all main frames.
- Studio is disconnected in the shared main scenario. Separate state boards show connecting, connected and syncing. A browser preview does not imply a Studio connection.

## Three distinct compositions to build

These are design specifications awaiting Figma construction and visual validation. No winner is selected.

| Direction | Composition and emphasis | Strength | Tradeoff |
| --- | --- | --- | --- |
| A — Refined Takko | Familiar labeled sidebar, fixed top workspace bar, clearly bounded graph and agent pane. Compact inspector anchored within the canvas. Clean outlined nodes, short status rows and consolidated preview card. | Easiest continuity with the existing app. | More visible structure and chrome than B. |
| B — AI Native | Quieter navigation, separated surface levels with fewer borders, greater feed spacing. Agent output reads as a work session containing activity and artifacts. Selected-system details appear in a compact contextual panel. | Better focus on intent, progress and outcomes. | Hidden detail needs strong disclosure cues and keyboard access. |
| C — Game Dev Workspace | Compact labeled sidebar, graph-dominant composition, prominent named ports and readable event labels. Floating tool strip and short contextual inspector. Resizable canvas/chat boundary. | Makes game relationships easier to inspect and edit. | More concepts are visible at once, requiring careful labeling for beginners. |

In every direction preserve the three-part workspace, taco mark, dark neutral palette, persistent agent pane and current project workflow. Do not replace it with a dashboard or generic chat app.

## Proposed foundations

Existing code tokens are the starting point, pending reconciliation with Figma:

| Role | Current value |
| --- | --- |
| Canvas | #111111 |
| Sidebar | #161616 |
| Panel | #1d1d1d |
| Raised surface | #252525 |
| Border | #333333 |
| Primary text | #f4f4f4 |
| Secondary text | #aaaaaa |
| Keyboard focus | #b8dfff |
| UI type | System stack, Segoe UI on this Windows host |

The proposed exploration scale is spacing 4/8/12/16/24/32, radii 6/10/14/20, UI type 12/13/14/16/20/24 and one-pixel ordinary borders. These new values are a proposal, not an extracted complete token system. Validate contrast, small text and Figma font availability before creation. Use semantic aliases for surfaces, content, boundaries, focus and actual status. Never overload decorative accent with success meaning.

Use variable bindings and reusable components. Keep the user's requested sections on one dedicated exploration page, overriding the library skill's default multi-page organization. Components may have a direction property where anatomy differs, not merely alternate colors. No Code Connect mappings until the chosen implementation exists.

Required component families: Button, Icon Button, Input, Select, Tooltip, Badge, Status, Panel, System Node, Connection, Agent Activity, Generation Card, Asset Card, Viewport, Composer, Inspector and Sidebar Item. Scope all variable bindings and document matching CSS roles. Do not invent existing Figma IDs or claim local components exist without inspection.

## State and motion checklist

Show the following under each direction, using instances of its components:

| Family | Required states |
| --- | --- |
| System node | Default, hover, selected, generating, changed, error |
| Connection | Normal, selected, newly created, active generation |
| Generation card | Queued, working, finished, failed |
| Composer | Idle, focused, generating |
| Studio | Disconnected, connecting, connected, syncing, error |
| Viewport | Loading, loaded, playing, fullscreen control state, unavailable |
| Inspector | Closed, open for selected system |
| Review Changes | Empty, pending |

Motion annotations: 120–160 ms micro feedback, 180–250 ms UI changes, 250–320 ms panel entry, 300–500 ms graph layout. Use a consistent easing curve without overshoot. Animate only the changed region. Keep semantic labels visible when reduced motion disables movement.

Prototype targets: selected node, inspector open/close, edge creation, generation completion, skeleton to content, composer submission, Studio connection and preview loading to playback. Timed Figma prototypes are illustrations only. The app must be driven by real data readiness, not staged delays or invented percentages. Active generation on an edge must never be labeled a verified runtime event trace.

Viewport: perspective grid and real rig capture, clip name, supported rig, small pause/fullscreen controls, drag/orbit/zoom/pan hints and autoplay loop. Preserve the user's prior request to remove camera settings. Reset remains a keyboard or contextual action rather than a permanent settings panel. Figma can show the real renderer's captured appearance but cannot establish native Roblox rendering or realtime 3D behavior.

## Remaining work and acceptance

1. Restore Figma MCP capacity, inspect the target file and discover libraries before searching reusable assets.
2. Reconcile existing Figma tokens/components with this source audit. Both sides of the Figma gap analysis are currently unknown.
3. Create the exploration page, reference section, variable/style foundations and reusable components.
4. Build all three full desktop frames with identical content, then their state boards and interaction annotations.
5. Inspect Figma screenshots at full size for hierarchy, text clipping, overlap, contrast, graph readability and inspector coverage. Validate components, bindings and prototype links.
6. Present exact frame links with neutral tradeoffs. Stop for the user's direction choice before frontend implementation.

## Verification, costs and runtime preservation

Read-only current UI inspection and source audit completed. Eight requested component sources were researched with retrieval limitations documented. Zero Figma objects created. No automated implementation tests were run because this task changed documentation only. Skipped all npm run check stages: vitest, test:luau, test:plugin, test:guards, build, test:desktop, test:production and test:e2e. No native Studio session or cleanup was needed.

Paid inference $0. Reservations $0. No key access or balance refresh. Last known balance remains $4.994992 at 2026-09-20T23:34:36.757Z. The paused v3 generation trial and old goal remain stopped.

Listeners rechecked: 4342/28132, 4343/31044, 4345/30804, 4346/12300, 4347/30440, 4348/36712, 4349/14716, 4350/9116, 4351/36736, 4352/27284, 4353/15328, 4354/2564, 4355/40768. Port 4347 remains the key service. No processes restarted, stopped or replaced. No source edits, package installs, commits or pushes.
