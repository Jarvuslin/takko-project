# Implementation and verification status

**Current assessment (2026-09-14): Forge 0.2 is a local prototype, not production ready.** Read [the current backend assessment, delivered hardening, verification boundaries and release gates](production-readiness.md). The older implementation snapshots below are historical.

**User-rejected product outcome:** the user found both the app and exported game inadequate. See [the reproduced generation failures](generation-failure-diagnosis.md). Four incompatible requests produce identical places; model advice cannot generate mechanics; authored attack animation/audio are absent. The successful checks below establish limited technical properties, not satisfactory generation. Three later characterization tests bring the unit suite to 30 and explicitly reproduce defects rather than endorse them.

Snapshot: 2026-09-13. Working prototype: Forge 0.1.0. This milestone starts implementation; it does not complete the broader Lemonade replacement.

| Implementation                               | Verification                                  | Result                                                                                                                                                 |
| -------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Combat discovery, choices and required scope | `tests/domain.test.ts`                        | Missing choices/approval and unsupported genre rejected                                                                                                |
| Revision and build lifecycle                 | Domain and API tests                          | Stale writes rejected; edits invalidate approval/artifacts; reopening build is idempotent                                                              |
| Persistent project API and export routes     | `tests/api.test.ts`                           | Full workflow, restart persistence, download, malformed input, host/origin boundaries tested                                                           |
| Model advice and spend reservations          | `tests/provider.test.ts`, domain budget tests | Schema validation, actual/unknown usage and reservation exhaustion tested using fake transport                                                         |
| Deterministic recipe and XML export          | `tests/recipe.test.ts`, Luau compilation      | XML parses; four source files survive encoding; hashes match; all generated Luau compiles                                                              |
| Combat authority rules                       | `tests/combat.luau`                           | Six executable offline scenarios pass                                                                                                                  |
| External validator sensitivity               | `scripts/evaluate-guards.mjs`                 | Baseline passes; five deliberately broken variants are rejected                                                                                        |
| Creator frontend and interactive HUD study   | `tests/browser/workflow.spec.ts`              | Six desktop/mobile browser tests pass; creation, palette/pace/device choices, preview, build, files, download, reload and invalidation exercised       |
| Accessibility of tested views                | axe within browser tests                      | No detected WCAG A/AA violations on welcome, configured design and built views at the two tested viewports; not a complete accessibility certification |
| Fresh Luau tool setup                        | `scripts/setup-luau.ps1` executed locally     | Official archive downloaded and SHA-256 checked successfully                                                                                           |
| GitHub automation                            | `.github/workflows/check.yml`                 | CI prepared; no GitHub remote or hosted CI run exists yet                                                                                              |
| Real Studio gameplay                         | `docs/studio-acceptance.md`                   | Pending: MCP discovery returned no Studio instances                                                                                                    |

The TypeScript suite has 27 tests. The executable Luau suite has six scenarios. The browser suite has six tests with accessibility assertions. `npm run check` combines these with compilation, mutation experiments and a production build.

`scripts/smoke-production.mjs` also checks production HTML, the built JavaScript asset, status API and unknown API routes. Browser tests use an isolated production server/data directory on port 4319; they never reuse the user-facing server. Results are saved in [production-smoke.json](results/production-smoke.json).

The separate Studio launch probe used only the generated sample file. Its own log recorded the start of opening that place and edit-state initialization; no connected MCP session became available. The temporary probe process was stopped. The pre-existing Studio process was left running. This is not a successful gameplay test or full confirmation of place loading.

## What the experiment establishes

The protected validator detects five specific silent defects in the combat rules: omitted cooldown, replay acceptance, out-of-range damage, damage through walls and attacking while dead. The original module passes. This is real executable evidence of validator sensitivity, with results in [guard-evaluation.json](results/guard-evaluation.json). It does not measure false positives on diverse projects or improvements in model generation.

No real model requests were made. Recipe mode generates the tested foundation deterministically. Configured model advice is optional and limited to design choices. Cheap-model/Astra parity, token savings and general game quality remain unmeasured.

## Next implementation priorities

1. Connect a disposable Studio and complete the checked-in gameplay scenarios; fix engine integration failures before expanding combat scope.
2. Implement a revision-aware Studio bridge with durable operations and real test results. Keep pending checks authoritative until evidence arrives.
3. Add valid asset discovery/selection and an actual Roblox HUD preview using the candidate tools identified in research.
4. Run a paired cheap-model experiment on held-out combat edits using the same tests and full cost accounting.
5. Expand beyond the narrow combat recipe and add natural-language planning only as measurable coverage grows.

## Current implementation update

The rejected combat prototype has been replaced by Forge 0.2's multi-model generation path. Read [the implementation report](forge-v2.md) and the updated root README before using historical plans below.
