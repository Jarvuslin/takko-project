# Takko orientation

Private GitHub remote `Jarvuslin/takko-project`.

## What it does

Takko takes a natural-language Roblox game request and runs it through a guided pipeline:

1. **Plan** the game, ask consequential clarifying questions, replan on the answers.
2. **Specify** inferred requirements, assets, acceptance criteria and task ownership. The user approves.
3. **Generate**. A builder model writes real Luau and scene data. A reviewer model finds missing behavior and produces protected acceptance scenarios. Luau compilation and coverage checks drive bounded repairs.
4. **Inspect** the actual source. Download the place or push it through the Studio plugin.
5. **Test** in a saved Studio place. Screenshots plus specific feedback feed a vision-capable model for visual repair.

It stops at "ready to test". It does not claim a verified game.

Alongside that there is a **Marketplace** flow: search the free Creator Store, like and save assets locally, drag cards or Roblox asset links into chat, statically inspect first drops, cache by revision, and carry preservation intent into planning.

## Stack

- Express 5 server, React 19 + Vite frontend, TypeScript 7
- Electron desktop shell under `desktop/`
- A Luau Studio plugin, `plugin/Forge.plugin.luau`, served to the user as `Takko.rbxmx`
- Vitest for unit/API, Playwright for browser, a real Luau compiler for `.luau` suites
- Providers: OpenRouter, native OpenAI Responses, Anthropic Messages, Gemini, OpenAI-compatible

## File map

**`src/server/`** - `app.ts` (361 lines) holds every route: `/api/status`, `/api/models` and per-profile key/catalog, `/api/projects` with patch, approve, phase actions, cancel, export, visual and asset-studio, `/api/studio/pairing`, `/api/studio/plugin`, and the `/api/bridge/*` connect, poll, result and operation-cancel endpoints the plugin talks to. `start.ts` is the dev entry.

**`src/core/`** - domain. `project.ts` revisions and lifecycle, `budget.ts` reservation and settlement accounting, `recipe.ts` the deterministic combat recipe, `provider.ts` the legacy advice call.

**`src/generation/`** - the engine, around 14k lines and the center of the project.

- `engine.ts` (1728) orchestration, task output contracts, dependency context
- `studio-asset-adapter.ts` (2435) the native Studio adapter, largest single file
- `asset-pipeline.ts` (1549) asset discovery, acquisition and evidence
- `component-*.ts` the Marketplace component path: archive, adaptation, derivative, integration, media, preservation, review, xml, xml-conversion
- `studio-mcp-client.ts`, `studio-state.ts`, `studio-audio-runtime.ts`, `bridge.ts` the Studio side
- `settings.ts` model routes (`planner`, `builder`, `reviewer`, `repair`) and `repairLimit`
- `schema.ts`, `validation.ts`, `requirements.ts`, `reviews.ts`, `repair.ts` the contract and repair loop
- `roblox-context.ts` plus `roblox-capabilities.json` and `roblox-builtin-assets.json` the compact runtime API context handed to models

**`src/marketplace/`** - Creator Store search, local like/save library, static inspection and cache.

**`src/benchmark/`** - quality cases, pairwise comparison, asset execution and provenance, verified submission.

**`src/web/`** - `App.tsx` (1980) is the whole workspace UI, plus `Marketplace.tsx`, `MechanicsMap.tsx`, `ModelPicker.tsx`, `AssetExecution.tsx`. Typography is the system stack with a Segoe UI fallback, and `tokens.css` is the single source of truth for every colour, size and spacing token. The woff2 files in `src/web/fonts/` belong to a 2026-09-14 direction the grok redesign superseded and are referenced by nothing. `tests/browser/typography.spec.ts` asserts the app makes no external font request.

**`tests/`** - around 90 files. TypeScript suites plus executable `.luau` suites and plugin mocks.

**`scripts/`** - around 46 helpers. `setup-luau.ps1` provisions the compiler, `test-luau.mjs`, `test-plugin.mjs`, `evaluate-guards.mjs`, `smoke-production.mjs`, and a long list of `verify-*` and `refine-*` one-off diagnostics.

**`docs/`** - around 60 verification reports, one per piece of work. Follow their format when you write a new one.

**`research/`** - 28 numbered reports, `notes/continuation.md` (short current state, history in `notes/archive/`), `evidence/` (third-party originals, gitignored), `results/`.

**`benchmarks/runs/`** - dated benchmark runs, each with its own `RESULTS.md`.

**`.forge/`** - gitignored local runtime. Project data, evaluation records, logs, PIDs, `tools/luau`.

## Ports

- **4318** default dev server (`FORGE_PORT`)
- **4319** isolated production server the browser tests spin up
- **4324** the user's long-running app instance, holds in-memory keys
- **4335** owned test service used during benchmark runs
- **4336** marketplace feature preview

Check `research/notes/continuation.md` for which of these is actually alive right now. Do not assume.

## Commands

```
npm ci                              fresh checkout
./scripts/setup-luau.ps1            provision the Luau compiler
$env:LUAU_BIN_DIR = '.forge/tools/luau'
npx playwright install chromium

npm run dev                         server at 127.0.0.1:4318
npm run check                       the full gate, see below
npm run desktop                     build and launch Electron
npm run desktop:package             Windows bundle under release/
```

`npm run check` chains: `test` (vitest) then `test:luau`, `test:plugin`, `test:guards`, `build` (tsc --noEmit plus vite), `test:desktop`, `test:production`, `test:e2e`. Native Studio verification is separate and never part of this.
