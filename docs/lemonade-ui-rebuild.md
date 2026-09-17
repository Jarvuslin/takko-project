# Forge UI rebuilt from authenticated Lemonade observations

Date: 2026-09-14. Reference: [observed interactions and evidence boundaries](../research/15-authenticated-workspace-ui.md).

## Changed

- Blue prompt dashboard with dark sidebar, condensed heading, highlighted mechanic text, six horizontal example chips and compact configured-model selection.
- Full-height dark project workspace with a collapsed sidebar rail, pannable/zoomable graph and right-side chat/brief, build, source and Studio views.
- Real task/dependency graph with detail inspection, declared files, build-progress status and links to source.
- Agent/Explore switching, editable starter prompts, expandable generation activity, project history, saved Studio observations and a follow-up composer that preserves the request and answers before replanning.
- Existing protected approval, budget, export and Studio execution gates retained. The running local server was not restarted; its in-memory keys are preserved.

Forge still uses its own local backend and name. The UI does not claim Lemonade backend parity. Community distribution, checkpoint conversations and interactive animation previews remain separate work.

## Tests

Offline unit tests cover graph edges and build progress. Browser regressions cover model routing, prompt focus, graph inspection, source navigation, zoom/reset, history, Explore, non-mutating inspection, follow-up persistence, accessibility and viewport fit. Existing tests still exercise planning, clarification, approval, build, source/export, provider settings and failed-save behavior.

Final `npm run check` passed: 107 unit tests, six offline Luau scenarios, five plugin mock scenarios, guard checks, TypeScript/production build, production smoke and 22 browser cases across desktop and mobile. The browser cases include accessibility checks. Initial mobile popover placement and graph scaling failures were corrected; the keyboard test now waits for asynchronous settings to load before checking the last control. No paid model calls or native Studio runs occurred in this UI pass.

Screenshots: `docs/results/forge-lemonade-dashboard-desktop.png`, `forge-lemonade-dashboard-mobile.png`, `forge-lemonade-workspace-desktop.png`, `forge-lemonade-workspace-mobile.png`. Browser fixture screenshots are isolated local reproductions; they are not Lemonade images or Studio playtests.
