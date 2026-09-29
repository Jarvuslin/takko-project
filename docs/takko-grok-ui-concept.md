# Takko Grok-inspired UI concept

2026-09-19. Local mockups and original vector assets are complete. Figma import is blocked by the connected Starter plan's MCP call limit. The browser editor is signed out. The created [Figma file](https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5) remains blank. Do not describe the mockup as delivered inside Figma.

## Deliverables

[Local preview](../design/grok-concept/index.html), [import instructions](../design/grok-concept/README.md), [state and verification record](../design/grok-concept/state.json).

* New game desktop screen, 1440 × 960. Narrow navigation, central rounded composer, model/budget controls and recent projects.
* Project with Marketplace desktop screen, 1440 × 960. Conversation, compiled-source status, explicit unrun native testing, source access, Studio action and asset reference drawer.
* Icon and artwork sheet, 1440 × 900. Eighteen original line icons, three original geometric game illustrations and a separate Takko mark.
* Three SVG screen exports and PNG previews, 22 standalone SVG assets, scene data, a reproducible builder and a local Figma plugin import package.

Visual reference was the public [Grok homepage](https://grok.com), inspected in the browser. The concept uses near-black surfaces, quiet gray borders, restrained typography, large empty areas and a prominent composer. Takko's project, asset, budget and Studio concepts remain. No Grok logo or downloaded Grok artwork is included.

The proposed Figma font is Geist, with Inter fallback. Browser/SVG/PNG previews use available system font fallback, so final typography may shift slightly. Screens are fixed desktop compositions. The importer creates editable native text and shape layers plus 21 reusable icon/artwork components. It is not a responsive Auto Layout library and has not been executed in Figma. Example projects and Marketplace entries are illustrative.

## Verification and failures

Six local artifact tests passed, zero failed. They validate 25 self-contained SVGs, shape bounds, the distinction between compilation and native testing, primary/secondary text contrast on raised surfaces, importer JavaScript syntax and network-disabled manifest, and preview screen links. All three boards were visually reviewed. Primary and secondary text contrast checks are not a complete accessibility audit. Muted tertiary captions and static mock controls were not audited as a production interface.

The initial mockup-only preview server failed on a missing favicon because its error handler attempted a second header write. Fixed the handler to read before sending headers. The failed server exited. The replacement serves the three screens. Two PNG conversion attempts failed due to module URL/path resolution, then all three exports succeeded through the installed Sharp package's declared entry point.

Figma MCP discovery and file creation succeeded, but subsequent design access hit the Starter limit. No Higgsfield MCP tools were available. No production app files changed. `npm run check` was not run. All application stages, including vitest, Luau, plugin, guards, build, desktop, production and e2e, were skipped. The six artifact tests do not establish Figma import success or application behavior.

## Environment and handoff

At 21:19:38 UTC, only the mockup preview on 4340/PID3900 was listening among checked ports 4318/4319/4324/4335/4336/4340. This process serves only design files and has no provider keys. Existing app services were not started, stopped or restarted. No Studio work, paid generation, application API calls, model key reads, commits or pushes.

Provider cost $0. Historical last verified key balance remains $1.529256456 at 2026-09-16T22:44:44Z, not refreshed. The generation goal remains paused. Next step is to import the prepared mockup after Figma access is available, then inspect native text and layer geometry before claiming a Figma delivery.
