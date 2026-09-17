# Forge landing concepts — 2026-09-14

Three desktop design explorations, preserving the current Saira Condensed / EB Garamond / JetBrains Mono typography. The application UI and stylesheet were not changed.

| Direction | Palette and layout | Preview |
|---|---|---|
| Focus | Charcoal, citron, familiar project sidebar and centered composer | [PNG](concept-1.png) |
| Foundry | Graphite, copper, ivory composer and an editorial split layout | [PNG](concept-2.png) |
| Grove | Deep pine, ivory, compact navigation and mechanic prompts | [PNG](concept-3.png) |

Open `index.html` through a local HTTP server rooted at the repository to load the bundled fonts. These are static design studies, not working product flows.

## Figma status

The [Figma draft](https://www.figma.com/design/szLsm1YXi2jGyhBAxdUQ1s) was created in Yuchen Lin's team. Font discovery confirmed all three families and Regular styles. Figma then rejected further library searches and the design write with its Starter-plan MCP tool-call limit. **The Figma file remains blank.** No design was successfully written to its canvas.

`manifest.json` and `figma-plugin.js` are a prepared local Figma development plugin. They create three native artboards with editable text, named layers and auto-layout containers, positioned to the right of existing content. No network access, deletion, or app changes. This importer has not run in Figma and native rendering remains unverified. It is a handoff artifact, not a claim that Figma import succeeded.

The source of all three concepts is `build.mjs`, which generates `concepts.json`, the HTML preview, and the plugin. It is isolated from application code. `verify.mjs` renders the previews with the project's existing browser test dependency and asserts font loading and text bounds. It uses an ephemeral loopback server and makes no model or Studio calls.

```powershell
node design/landing-explorations/build.mjs
node design/landing-explorations/verify.mjs
node --check design/landing-explorations/figma-plugin.js
```
