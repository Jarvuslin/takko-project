# Takko Grok-inspired concept

Three boards: new game, active project with Marketplace, and original vector assets. This is a static desktop design proposal, not implemented application behavior.

Open `index.html` to switch boards. SVGs work independently and can be dragged into Figma. The `assets` directory contains 18 icons, three game illustrations and one Takko mark. All are original vectors authored for this concept. Example projects and asset listings are illustrative.

## Editable Figma import

The MCP-created file is https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5. It remains blank because the Starter plan MCP quota was reached before design writes. Browser access requires sign-in. No Figma import has been verified.

For native text, layers and reusable vector components, use the Figma desktop app:

1. Open a design file.
2. Choose Plugins > Development > Import plugin from manifest.
3. Select this directory's `manifest.json` and run the imported plugin.

The importer creates new pages and does not replace existing content. It declares no network access. It prefers Geist when available and falls back to Inter. Running it again creates another copy. The boards are fixed desktop compositions, not responsive Auto Layout components.

For a quick visual import, drag `screen-1.svg`, `screen-2.svg` and `screen-3.svg` onto the canvas. SVG text may be converted to vector outlines by Figma, so use the plugin when editable text matters.

## Rebuild and verify

From the repository root, run `node design/grok-concept/build.mjs`, then `node --test design/grok-concept/verify.mjs`.

The local preview uses the browser's installed font fallback. The Figma importer requests Geist or Inter, so typography may differ slightly until the same font is available. Figma runtime import is unverified because of the access blocker. No production app files or settings were changed.
