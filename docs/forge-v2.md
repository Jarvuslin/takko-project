# Forge 0.2 implementation report

Date: 2026-09-13. The active application is the replacement for the rejected fixed combat prototype.

## Delivered

- Arbitrary game requests reach a model planner and real code-generation backend. There is no active combat keyword gate or recipe fallback.
- Typed specifications preserve quoted user requirements and distinguish inferred requirements. Questions are answered before approval; edits invalidate approval and output.
- A validated dependency graph assigns exclusive script ownership. Builder calls receive relevant dependency source instead of every unrelated script.
- Native OpenAI Responses, Anthropic Messages and Gemini adapters, plus OpenRouter and compatible chat-completion endpoints. Profiles, stage routes, explicit fallback choices, model catalogs, output caps and project budgets are configurable in the UI.
- Session-only API keys, optional ignored environment configuration, redacted upstream errors, official endpoint restrictions for named providers, and same-origin localhost APIs.
- Durable per-project cost ledger, reservation before calls, conservative handling of unknown usage, cancellation, restart recovery and bounded JSON/implementation repair.
- A generalized instance/source manifest and place exporter. Requirements, scene data, assets, review issues and generated files are visible in the app.
- Luau compilation, script placement/path checks, requirement coverage, declared user asset provenance and protected reviewer-authored tests.
- Original Studio plugin with local pairing, staged application, source/instance edit checks, undo recording, exact-artifact test gating, result retry and server deduplication. Test runners cover server/client modes and clean up inserted harnesses.
- Runtime observations feed repairs. User-supplied PNG screenshots feed vision-capable review/repair providers; old image evidence is invalidated after changes.
- Redesigned responsive workspace, replacing the unrelated combat illustration with actual generated files, scene manifests and explicitly labeled Studio evidence.

## Verification

`npm run check` passed after the final production changes: unit/API/provider/generation checks, retained legacy Luau and mutation checks, original-plugin mocks and harness compilation, TypeScript/Vite build, production smoke, and eight desktop/mobile browser scenarios. Additional export and screenshot-pipeline regression tests were then run with `npm test`. All are offline or local fixture-provider checks; no real provider tokens were charged.

Browser screenshots are saved as `docs/results/forge-v2-*.png`. Fixture artifacts demonstrate transport and workflow behavior, not the quality of a model-generated game. The old combat tests and diagnosis remain as historical regression evidence.

The local server was restarted on 127.0.0.1:4318. Its status reports `multi-model`, no configured providers, and no connected Studios. Fresh Roblox MCP discovery also returned no Studio instances.

## Remaining product work and evidence gaps

No supplied API key means no real model-quality or cost-per-accepted-game measurement. No Studio connection means no native import, permission, undo/redo, animation playback, screenshot capture or playtest integration pass. A successful syntax check or model-written assertion does not establish a complete, attractive game.

Marketplace search/preview, curated rig-compatible animation selection, automatic Studio screenshots, general existing-place context indexing, stronger independent behavioral oracles and held-out quality benchmarks remain work. The plugin refuses replacement when it cannot establish an unchanged owned project. It is not a general arbitrary-place MCP editor.

Lemonade's public OpenRouter attribution supports multi-model usage. Its private phase router, prompts and BYOK implementation remain unavailable. See the linked research report for sources and evidence boundaries. No feature-parity or cheap-model/Astra-parity claim is justified.
