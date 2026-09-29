# Takko settings concept

22 desktop screen states, two editable Figma boards and a local navigation prototype. Production app code is unchanged.

- [Figma main flow](https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5/Takko?node-id=4-786)
- [Figma dialog variants](https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5/Takko?node-id=4-1868)
- [Click-through preview](http://127.0.0.1:4342/#models)

The Figma page is **Settings · Simpler flows**. Imported SVGs contain editable text and vectors. They are freeform frames, without component bindings, Auto Layout or wired prototype interactions. The browser preview supplies navigation hotspots. Its form values, filters and saves are illustrative.

The main board covers home, model library, providers, routing, budget, add model, connect provider, route drawer, profile editor and generation budget dialog. The second board covers individual routing stages, bulk routing, compatible endpoints, manual model entry, other providers and profile variants.

Run `node design/settings-concept/build.mjs` to regenerate. The builder uses the installed Sharp runtime at the absolute path in the file. Run `node --test design/settings-concept/verify.mjs` to check vectors, raster parity, board placement and navigation coverage. Serve this directory with a static HTTP server to use the preview. Opening index.html directly cannot fetch the screen manifest.

See `docs/takko-settings-concept.md` for implementation handoff, verification and limitations.
