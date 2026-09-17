# Takko

Local, multi-model Roblox generation. Previously named Forge. Existing project storage and generated namespaces remain compatible.

Repository: [Jarvuslin/takko-project](https://github.com/Jarvuslin/takko-project) (private).

For a fresh Windows checkout, run `npm ci`, `./scripts/setup-luau.ps1`, and `npx playwright install chromium`. Set `$env:LUAU_BIN_DIR = '.forge/tools/luau'`, then run `npm run check`. Native Studio verification is separate from these automated checks.

Generated builds, dependencies, local projects/credentials, downloaded third-party evidence, and Superbullet extraction derivatives are excluded from Git. Research reports and regression evidence remain versioned because tests and audit conclusions depend on them. See [repository maintenance](docs/repository-maintenance.md).

Latest: [minimal interface and generation integrity fixes](docs/minimal-ui-generation-integrity.md). The active UI prioritizes prompt, build progress, source and Studio verification.

**Desktop:** run `npm run desktop`, or open the generated Windows bundle under `release/Takko-win32-x64/Takko.exe`. Read [desktop setup](docs/desktop.md) and the [execution foundation report](docs/desktop-execution-foundation.md). Desktop retains its existing `%APPDATA%/Forge Desktop/projects` directory, including saved model profiles and routes. This remains separate from browser development storage; rebranding does not migrate or reset either workspace.

Run `npm install`, then `npm run dev`, and open http://127.0.0.1:4318. Use **Models & budget** to add API keys, fetch a model catalog, choose models and prices, and assign planning, building, reviewing and repair routes. Supports OpenRouter, native OpenAI Responses, Anthropic Messages, Gemini, and OpenAI-compatible endpoints.

Keys entered in the UI stay in server memory and disappear on restart. They are not stored in project JSON or browser storage. For persistent configuration, copy `.env.example` to the ignored `.env` and supply the provider-specific values. Model profiles and route choices persist locally. OpenRouter-reported costs are used when available; other rates are configured estimates, not an invoice. Free/zero-priced profiles cannot enforce a monetary cap meaningfully. Unknown usage retains the full request reservation.

1. Describe any game genre and create a project.
2. Plan the game, answer consequential questions, then update and replan.
3. Review inferred requirements, assets, acceptance criteria and task ownership. Approve the specification.
4. Generate. The builder writes actual Luau and scene data; the reviewer identifies missing behavior and produces protected acceptance scenarios. Compilation and coverage checks drive bounded repairs.
5. Inspect the actual source. Download the place or use the Studio plugin.
6. Apply and run tests in a saved Studio test place. Attach a PNG screenshot and specific feedback for visual repair using a vision-capable model.

The Studio tab downloads `Takko.rbxmx`. Insert it in Studio, select the contained script and save it as a local plugin. Open the Takko toolbar panel, allow its localhost HTTP connection, and press **Connect to Takko** to fetch the local pairing token. Queue an apply/test in the app and confirm it in the plugin. Keys for model providers never enter Studio.

The plugin stages namespaced scene objects, updates sources with ScriptEditorService, checks known owned state before replacement, records undo operations, retries result delivery, and rejects testing a different artifact. Unknown edits after plugin restart block replacement; preserve them and create a fresh Takko project. The adapter currently builds within its own namespace rather than indexing and editing arbitrary existing games.

## Verification and limits

The scene-reference and partial-build recovery fixes now have a native Studio integration pass: XML references, installed-plugin pairing/apply, Motor6D movement, client HUD and player spawn. See [the regression report](docs/scene-reference-fix.md) for the exact checks and remaining user-project work. This verifies the adapter on an independent fixture; it does not establish complete model-generated gameplay.

Run `npm run check`. This includes TypeScript/API/provider/pipeline tests, the retained legacy combat tests, plugin mocks and generated harness compilation, mutation checks, production smoke checks, and desktop/mobile browser tests. Legacy tests characterize the rejected prototype; they do not establish new generation quality. All fixture-model responses are confined to tests.

Live economy-model testing and the CTRLpotato-inspired UI refresh are documented in [the current evaluation](docs/ui-refresh-and-live-evaluation.md), including failures and costs. No cheap-versus-premium quality comparison has been completed. The plugin uses the documented StudioTestService APIs, but offline mocks cannot verify permissions, animation playback, physics, networking or native XML import. Uploaded screenshots are labeled user observations. The application deliberately stops at **ready to test**, not “verified game.”

Animation and audio IDs must come from the user; permissions and playback remain Studio checks. Marketplace browsing, rig-aware asset previews, automatic render capture and a complete Studio context index are not implemented. Model-generated tests can still be weak. Human gameplay and visual review remain necessary, and there is no claim that cheap models match Astra.

See [the implementation report](docs/forge-v2.md), [the Lemonade model research](research/14-multi-model-backend.md), and [the original failure diagnosis](docs/generation-failure-diagnosis.md). No remote Git repository has been configured; CI is prepared locally only.
