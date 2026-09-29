# Six Takko logo directions in Figma

2026-09-19. Created and imported six original taco-inspired logo variations into the [existing Takko Figma file, board 2:2](https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5/Takko?node-id=2-2). The imported board is visible and editable. This supersedes the earlier blank-file status, not the earlier UI mockup import blocker. The original UI concept screens have not been imported.

## Design

| Direction | Character |
| --- | --- |
| Mochi | Soft golden taco, rosy cheeks, leafy edge |
| Fold | Two geometric shell shapes with a diagonal opening |
| Peek | One-color shell with two curious eyes |
| Sprout | Pale taco with a growing leaf motif |
| Byte | Pixel-grid taco for a game creation identity |
| Amigo | Tilted, outlined taco with a wink |

Each direction includes a wordmark and dark/light small-size studies. Shortlist: Mochi for friendliness, Peek for a restrained assistant identity. The study drew design cues from official [Linear brand guidance](https://linear.app/brand), [Raycast's press kit](https://www.raycast.com/press), [Discord's branding](https://discord.com/branding), [Claude's product presentation](https://claude.com/product/overview), and [Linear's logo comparisons](https://linear.app/integrations/raycast). The influence mapping is a design interpretation. All Takko artwork was drawn from original SVG paths.

Sources and exports are under `design/takko-logo/explorations/`. This includes six SVGs, six transparent 512px PNGs, the comparison board in SVG/PNG, a catalog, builder and artifact checks. Existing production logo and app files were not changed.

## Figma and verification

The MCP inspection call returned the Starter plan tool-call quota error. The identity tool confirmed the Starter plan. The browser editor was signed in and allowed editing. Used File > Place image to import the comparison SVG, then Place all and Zoom to fit. The resulting frame is 1440 by 1200 with six named direction groups and separate vector/text children, verified through the browser layer tree and screenshot. This is an editable design board, not a component library or responsive layout system. No plan upgrade or paid Figma generation was used.

Seven artifact tests passed. They check valid standalone XML, absence of external/image/script dependencies, exact PNG agreement with SVG rasterization, transparent unclipped edges, visible artwork, and board dimensions/direction inventory. Log: `docs/results/takko-logo-explorations-check.txt`. The first builder invocation failed because fileURLToPath was incorrectly imported from node:module. Corrected it to node:url, rebuilt successfully, then verified all exports. The failed attempt produced no board.

No production implementation occurred. `npm run check` was not run for these design-only files. All app stages were skipped: vitest, test:luau, test:plugin, test:guards, build, test:desktop, test:production and test:e2e. The previous full app check remains historical. No Studio session or game verification.

## Environment and cost

At 22:12 UTC, preview4341/PID13244 and concept4340/PID3900 remain live. Ports4318/4319/4320/4324/4335/4336 were not listening. No server was restarted, no user draft reset and no provider key read. Cost $0. Last verified historical key balance remains $1.529256456 at 2026-09-16T22:44:44Z, not refreshed. Generation goal remains paused. No commit/push. Previous evidence and unrelated edits preserved.
