# Takko

[OpenCode coding adapter](docs/opencode-adapter-implementation.md): an opt-in backend replaces paid coordinator scheduling with a compact plan and one coding session across unfinished tasks. Takko retains proposals, asset checks, scoped edits and cumulative spending. Existing projects keep their backend. Offline runtime verification is separate from paid generation and Studio gameplay.

[Persistent game proposals](docs/conversation-planning-implementation.md): describe a game, review mechanics, theme, layout and inspected Marketplace recommendations, make targeted changes, then **Approve & build**. Unchanged sections, selections, files and completed workers are retained. Legacy builds without dependency metadata stop before regeneration. This is implemented in source. The running desktop package was not replaced, and Studio gameplay remains unverified.

[Fighting-game diagnosis](docs/fighting-game-diagnosis.md): fixes mismatched playtest outcomes, a hidden concept reply limit, broad fist/VFX searches and undersized preview controls. The real model trial failed from truncation and is preserved. Full game generation and Studio gameplay remain unverified pending retry authorization and target-place confirmation.

[Coordinator and temporary workers](docs/coordinator-workers-implementation.md): new application plans use staged planning and dynamic worker assignments with saved progress, shared contracts, independent review and scoped repair. Automatic reasoning preserves provider defaults. Existing spending limits remain enforced. Offline verification does not establish live model quality or native gameplay.

Local, multi-model Roblox generation. Previously named Forge. Existing project storage and generated namespaces remain compatible.

Repository: [Jarvuslin/takko-project](https://github.com/Jarvuslin/takko-project) (private).

[Brief approval and asset choices](docs/brief-asset-choices.md): approve the brief with a button, preview free Creator Store options and choose individual animation clips before creating the build plan. Searches start from the brief when Studio is available. Model previews show supported primitive geometry. Audio listening and full VFX playback still use Roblox. This is asset review, not verified gameplay.

Opening a project checks the Studio connection first. The setup screen includes Assistant/MCP instructions and an explicit offline mode for brief work. Architecture stays hidden until Studio connects. The desktop service retains the Windows paths required to find Roblox's connector, and the Marketplace uses a wider Creator Store-inspired asset browser.

For a fresh Windows checkout, run `npm ci`, `./scripts/setup-luau.ps1`, and `npx playwright install chromium`. Set `$env:LUAU_BIN_DIR = '.forge/tools/luau'`, then run `npm run check`. Native Studio verification is separate from these automated checks.

Generated builds, dependencies, local projects/credentials, downloaded third-party evidence, and Superbullet extraction derivatives are excluded from Git. Research reports and regression evidence remain versioned because tests and audit conclusions depend on them. See [repository maintenance](docs/repository-maintenance.md).

Latest: [The $5 live evaluation and narrated demo](docs/game-concept-live-demo.md) passed strict output validation but failed its first content gate: Haiku assumed rescue before settling rescue versus battle. One call cost $0.005008. Planning/build/Studio remain unverified. [Watch the 2:22 walkthrough](http://127.0.0.1:4349/demo/).

Previous: [The authorized concept retry](docs/game-concept-live-retry.md) failed because the model supplied five playtest steps against a four-step bound. Three total paid calls across both trials cost $0.011967. The saved response now passes offline with a separate brevity target and hard bound, but unresolved choices and manual Studio setup instructions remain live quality problems. Full live planning remains untested.

[Game concepts before planning](docs/game-concept-flow.md) adds a compact idea card, suggested/custom answers, **Choose for me**, visible defaults and a first-playtest guide. Concept clarification uses the existing planner and shares its generation allowance. Existing direct planning remains available. The isolated preview at http://127.0.0.1:4346 has a separate workspace and no copied API keys. It was restarted for the description fix, but needs another approved restart to load the concept reliability implementation. This is not a native playable-preview pipeline.

Previous: [Jev asset-ranking pilot](docs/jev-asset-pilot.md) passed 16/16 synthetic choices through OpenRouter for $0.000638232. Real Marketplace quality remains unmeasured and Jev is not integrated into the app. [Presets](docs/jev-fit-and-presets-navigation.md) is a sidebar button directly below Models, with both available on mobile. The [model library](docs/model-library-and-presets.md) retains provider catalogs and logos. The native Studio production receiver remains unimplemented.

**Desktop:** run `npm run desktop`, or open the generated Windows bundle under `release/Takko-win32-x64/Takko.exe`. Read [desktop setup](docs/desktop.md) and the [execution foundation report](docs/desktop-execution-foundation.md). Desktop retains its existing `%APPDATA%/Forge Desktop/projects` directory, including saved model profiles and routes. This remains separate from browser development storage; rebranding does not migrate or reset either workspace.

Run `npm install`, then `npm run dev`, and open http://127.0.0.1:4318. Open **Models** to choose a provider, validate its API key, browse its automatically loaded catalog and save models. Open **Presets**, directly below Models in the sidebar, to save named teams with primary and fallback models, generation limits and project budgets. Supports OpenRouter, native OpenAI Responses, Anthropic Messages, Gemini, and OpenAI-compatible endpoints.

Provider connections share one validated key across models at the same endpoint. On Windows, the normal server and desktop app save those keys encrypted with CurrentUser DPAPI and restore them after restarting. Keys are never returned to the browser or written into project JSON or browser storage. Other platforms and custom servers without a vault show session-only storage. Legacy environment/model keys are session-only until validated through Connect. Test connection is a read-only authentication check, not paid inference. Model profiles and route choices persist locally. OpenRouter-reported costs are used when available; other rates are configured estimates, not an invoice. Free/zero-priced profiles cannot enforce a monetary cap meaningfully. Unknown usage retains the full request reservation.

1. Describe any game genre to prepare a persistent proposal.
2. Discuss mechanics, theme and layout. Review recommended assets, optionally preview or replace them, and request targeted edits.
3. Use **Approve & build** to approve the exact proposal and inspected references. Internal planning and implementation share the cumulative generation allowance.
4. The builder writes Luau and scene data. Review, compilation and coverage checks drive bounded repairs. Changed dependencies rebuild while unaffected work remains saved.
5. Inspect the actual source. Download the place or use the Studio plugin.
6. Apply and run tests in a saved Studio test place. Attach a PNG screenshot and specific feedback for visual repair using a vision-capable model.

**Marketplace:** search the free Creator Store, like/save assets locally, and drag cards or Roblox asset links into chat. First drops receive static source inspection; unchanged versions reuse the persistent cache. Add a **Use for…** note to carry preservation intent into planning. Requires a connected Studio MCP session; new model inspections require Edit mode. See [the feature and verification report](docs/marketplace-asset-library.md).

The Studio tab downloads `Takko.rbxmx`. Insert it in Studio, select the contained script and save it as a local plugin. Open the Takko toolbar panel, allow its localhost HTTP connection, and press **Connect to Takko** to fetch the local pairing token. Queue an apply/test in the app and confirm it in the plugin. Keys for model providers never enter Studio.

The plugin stages namespaced scene objects, updates sources with ScriptEditorService, checks known owned state before replacement, records undo operations, retries result delivery, and rejects testing a different artifact. Unknown edits after plugin restart block replacement; preserve them and create a fresh Takko project. The adapter currently builds within its own namespace rather than indexing and editing arbitrary existing games.

## Verification and limits

The scene-reference and partial-build recovery fixes now have a native Studio integration pass: XML references, installed-plugin pairing/apply, Motor6D movement, client HUD and player spawn. See [the regression report](docs/scene-reference-fix.md) for the exact checks and remaining user-project work. This verifies the adapter on an independent fixture; it does not establish complete model-generated gameplay.

Run `npm run check`. This includes TypeScript/API/provider/pipeline tests, the retained legacy combat tests, plugin mocks and generated harness compilation, mutation checks, production smoke checks, and desktop/mobile browser tests. Legacy tests characterize the rejected prototype; they do not establish new generation quality. All fixture-model responses are confined to tests.

Live economy-model testing and the CTRLpotato-inspired UI refresh are documented in [the current evaluation](docs/ui-refresh-and-live-evaluation.md), including failures and costs. No cheap-versus-premium quality comparison has been completed. The plugin uses the documented StudioTestService APIs, but offline mocks cannot verify permissions, animation playback, physics, networking or native XML import. Uploaded screenshots are labeled user observations. The application deliberately stops at **ready to test**, not “verified game.”

Published animation IDs can come from an approved clip in a Marketplace pack or a supplied reference. Audio can be selected from Marketplace. Permissions and playback remain Studio checks. Marketplace static inspection is limited screening, not proof of safety. R6/R15 body animation previews are available, while custom meshes, full runtime effects and a complete Studio context index remain unsupported. Model-generated tests can still be weak. Human gameplay and visual review remain necessary, and there is no claim that cheap models match Astra.

See [the implementation report](docs/forge-v2.md), [the Lemonade model research](research/14-multi-model-backend.md), and [the original failure diagnosis](docs/generation-failure-diagnosis.md). The private GitHub repository is linked above.
