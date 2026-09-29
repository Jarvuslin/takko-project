# Simpler settings mockup

Created 22 screen and dialog states in Figma and a clickable local preview. The proposal replaces the long Models dialog with separate Models, Routing and Budget pages. This task changes design artifacts only.

## Deliverables

- Figma file: [Takko](https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5/Takko?node-id=4-785), page **Settings · Simpler flows**.
- Main board `4:786`, 2704 × 4630 at x0/y0, ten states.
- Dialog board `4:1868`, 2704 × 5522 at x2864/y0, twelve states.
- [Local preview](http://127.0.0.1:4342/#models), backed by `design/settings-concept`.
- Standalone SVG and PNG exports for every state, plus both overview boards.

The visual direction follows the user's connector screenshot: near-black surfaces, quiet separators, pill tabs, small status labels, simple rows and one main action. The existing taco mark is retained. Public references read were [Grok](https://grok.com), [Hugging Face Models](https://huggingface.co/models) for its searchable catalog organization, and [Linear's brand page](https://linear.app/brand) for typography and space. No third-party logo was copied. Model IDs, prices, connection badges and project spend are fictional examples.

## Screen structure and implementation handoff

| Surface | Purpose and existing fields |
| --- | --- |
| Home | Centered composer with Routing and Budget shortcuts. Full settings are outside the composer. |
| Models | My models and Providers tabs, short searchable rows, individual Edit and Add model actions. |
| Providers | Five supported provider types in two-column rows, with compact connection dialogs. |
| Add model | Catalog search, provider selection and manual ID entry. |
| Model editor | Name, model ID, provider connection, input/output rates, maximum output tokens, timeout and JSON mode. |
| Routing | Research toggle and five stage rows for research, planner, builder, reviewer and repair. |
| Route drawer | Primary model and two ordered fallback slots. Separate titled variants for each stage, plus one-model-for-all dialog. |
| Budget | Default generation cap, project cap, spent/reserved/available summary and repair limit. |
| Generation budget | A composer dialog to adjust one generation before starting it. |

The five stages come from the current Models UI in `src/web/App.tsx`. Routing arrays already support up to three entries in `src/generation/schema.ts`. The new layout should retain stable profile IDs and save only the intended section, preserving unrelated settings. The route drawers depict draft choices, which may differ from the saved row behind the drawer.

The independent per-generation cap is a new proposal. Current `budgetMicros` is cumulative per project. Existing `reservationBudgetMicros` controls admission reservations and is not an independent generation spend cap. Implementation needs a generation limit and accounting across research, planning, building, fallback calls and repairs. Available spend must consider both remaining generation and project limits, including unsettled reservations. This design is not evidence that enforcement exists.

Provider grouping is also a presentation proposal. Current keys belong to individual model profiles and remain only in server memory. Grouping must preserve the existing provider/endpoint compatibility and explicit key-copy rules. Do not introduce disk or browser key persistence or silently merge unrelated credentials. The mock never receives real keys.

For implementation, dialogs should trap focus, restore it to the opener and provide a clear unsaved-change dismissal path. Keep actions visible while only the content area scrolls. Catalog loading, empty results and connection failures should appear in the relevant panel. Block invalid rates/limits inline. Mobile should use one-column rows and full-width dialogs with a compact navigation menu. These are handoff requirements, not verified implemented behavior or additional illustrated states.

## Verification

`node --test design/settings-concept/verify.mjs` passed **24 tests**, zero failures, retries or skips. Log: `docs/results/takko-settings-concept-check.txt`.

The checks validate all 22 SVG documents, no external SVG resources, 1280 × 800 screen dimensions, exact PNG raster parity, reachable navigation destinations, bounded hotspots, and each state appearing once across the two boards.

Browser review verified Models to Add model, Escape back to Models, Routing to the Planner drawer, Save route back to Routing, Budget navigation, and Providers to Connect OpenAI. Preview canvas sizing was corrected after the initial browser screenshot showed the footer below the viewport. The corrected drawer and budget page fit in the observed browser viewport. Form edits, searches, selections and saves remain visual examples, not live controls.

Figma import was verified through the native layer tree and a screenshot showing both boards side by side. It contains editable SVG vectors and text. Starter MCP quota was already exhausted, so the signed-in browser editor was used to place the SVGs. No published library components, Auto Layout or Figma prototype wiring is claimed. A layer selection attempt temporarily hid the main board. An undo removed the import, redo restored it, and visibility and final placement were corrected and visually checked. Existing logo boards on Page 1 remain intact.

`npm run check` was not run because this is design-only work. All app stages were skipped: vitest, test:luau, test:plugin, test:guards, build, test:desktop, test:production and test:e2e. Artifact tests and navigation checks do not establish production settings behavior, accessibility compliance, responsive implementation or native Studio behavior.

## Runtime, cost and preservation

At 2026-09-20 01:46:58 UTC, only port4342/PID28132 was listening among 4318, 4319, 4320, 4324, 4335, 4336, 4340, 4341 and 4342. It serves static design files only, exec session32128. Previous 4340 and 4341 services were already absent before this task started the new preview. No existing service was stopped or restarted.

Cost $0. No provider calls, paid generation, key access or Studio session. Last historical key balance is $1.529256456 at 2026-09-16T22:44:44Z, not refreshed. The generation goal remains paused. Existing application edits and evidence were preserved. No commit or push.
