# Model library and presets

2026-09-20. Implemented one Models workspace with Model library and Presets tabs. Model profiles persist independently of named presets. Each preset holds role assignments, backups, specialist overrides, research options and spending limits. Existing routes and budgets migrate into My first preset.

## Interface and behavior

- Models has a searchable saved library, provider and model-family logos, and a provider browser. Official endpoints are filled automatically. Custom compatible endpoints remain editable.
- The selected provider's catalog loads when Models opens and refreshes when provider, endpoint or credentials change. OpenRouter works without a key. Providers requiring credentials explain that requirement. Catalog failures retain a manual Model ID path.
- Choosing a catalog entry fills its model ID, display name and available prices. Anthropic and Gemini pagination are supported. Gemini embedding-only entries are excluded when their advertised methods establish that they cannot generate text. Catalog reads have a 30-second deadline and bounds of 100 pages and 3,000 models. This is not a claim that every provider exposes every usable model through this endpoint.
- Add model contains the API key field. Matching saved credentials are reused automatically, preferring the edited model's own key. Keys remain in server memory only. A key badge says Key added, which does not claim a successful inference connection.
- Pricing is described as Reading and Writing, with a plain-language token explanation and an illustrative usage calculation. Missing prices are labeled unavailable. Zero or unknown rates cannot provide meaningful monetary enforcement. Advanced controls describe reply length, wait time and structured replies.
- Presets have a name and one of six icons. Users can assign one model to every role or choose role-specific primaries, backups and specialist models. Generation and project budgets live in the preset editor. Saving an inactive preset does not activate it. Switching presets does not start generation.
- Existing composer drafts and one-off generation limits survive settings navigation. Old Routing and Budget hashes resolve to Presets. Removing a model removes its references from all saved presets. Active presets cannot be deleted.
- Dialogs retain keyboard focus, confirm discarding changes and protect unsaved navigation. Tabs support arrow, Home and End navigation. Desktop and mobile accessibility/layout flows are covered by browser tests.

Provider marks are local SVG files under public/brands, with source and license notes. Known model families get their family mark, other models use the provider mark. No external icon fetch is required.

## Persistence and API

Settings now include a preset library and active preset ID. Legacy settings migrate on read without immediately writing disk. Saving synchronizes the active preset with engine settings, including legacy callers. New per-preset save, activate and delete endpoints preserve unrelated profiles, presets and credentials. Invalid model references and duplicate preset IDs are rejected.

The engine still consumes the active routes and budgets. Presets are reusable settings snapshots, not independently running agents. Existing projects retain their project-specific routing behavior. No inference is made by catalog browsing or preset editing.

## Verification

Final `npm run check` passed with exit 0. No stages were skipped and no retries occurred inside this final run. It was a fresh rerun after the fixes described below. [Full log](results/model-library-check-final.txt).

| Stage | Result |
| --- | --- |
| Vitest | 1,301 tests in 78 files passed |
| Luau | 6 offline combat scenarios passed and 3 generated sources compiled |
| Plugin | 14 mock groups passed, plugin and 8 injected sources compiled |
| Guards | All 6 fixtures matched their expected pass or rejection |
| Build | TypeScript and Vite passed |
| Desktop | 10 tests passed |
| Production | HTML, bundle, API and unknown-route smoke checks passed |
| Browser | 72 desktop/mobile tests passed |

`git diff --check` passed. Live browser review covered the provider icons, combined model dialog, automatic public catalog and preset library. Final generated evidence is archived in results/model-library-final-artifacts. Nineteen changed prior result files were archived and their original versions restored after each full check.

Earlier evidence is preserved:

- Focused API tests: 15 passed initially, then 16 passed after the active-preset synchronization regression was added.
- Standalone Vitest: 1,300 tests in 78 files passed before the final additional regression.
- Initial focused browser run: 26 passed and 18 failed. Updated locator names, explicit accessible field labels and enabled-control focus expectations resolved those failures.
- First full check: 1,300 unit/API tests passed, as did the Luau, plugin, guard, build, desktop and production stages. Browser result was 69 passed and 3 failed. One Windows worker exited unexpectedly with code 3221226505. Two desktop/mobile failures exposed a real pricing disclosure bug: changing Reading price collapsed the section before Writing price could be edited. Pricing disclosure state is now independent of pricing provenance.
- An intermediate TypeScript check caught an accidentally removed Profile type import during dead-code cleanup. The import was restored and subsequent compilation passed.

Logs are in results/model-library-*.txt. New screenshots, smoke and guard outputs are archived separately and previous evidence restored. Native Studio verification is separate from these tests. Offline provider mocks do not establish real inference behavior or model quality.

## Native Studio transport probe

After the user enabled Allow HTTP Requests in Place1, a six-instance unparented fixture made a local HTTP round trip through an owned temporary server on port 4344. Studio reconstructed 5,041 native bytes from 27 chunks using EncodingService and SerializationService. SHA256, Motor6D references and transform, ObjectValue references, ModuleScript source, attribute, tag and observed sandbox/capability state matched.

The first attempt failed because HTTP was disabled. That failure remains in results/direct-delivery-native-probe.json beside the successful attempt. Fixture source and server are retained under results/direct-delivery-native. Final read-only cleanup evidence is in results/direct-delivery-native-cleanup.json.

No fixture source was executed or parented into the game. All temporary instances were destroyed. Existing game scripts were not modified and needed no restoration. The owned probe server exited. Studio remains in Edit mode. The user's enabled HTTP setting remains as they set it.

This proves a small fixture transfer/deserialization path in Studio's MCP execution context. It does not prove native content delivery through the installed Takko plugin, undo, cancellation, interrupted transfers, user-edit conflict handling, real gameplay, or large multi-script assets. Production native-content rejection remains intact. The receiver and apply protocol described in direct-studio-delivery.md still need implementation and native acceptance testing before manual export can be removed for native components.

## Runtime and cost

The new interface preview uses http://127.0.0.1:4345/#models and isolated data under .forge/library-ui-preview. It copied public model metadata only from the old preview, with no keys or projects. No existing server was stopped or restarted. The new preview reported an occupied Vite HMR websocket port, while HTTP serving works and manual reload shows frontend changes. Its backend predates the last legacy active-preset synchronization fix, which is verified by the final build and tests. The new UI's preset endpoints already synchronize those settings.

Live public OpenRouter catalog loading was observed with 446 entries at the time of inspection. This was a catalog GET, not inference. Authenticated real-provider generation was not attempted. Paid calls: 0. Cost: $0. Historical remaining key balance is $1.529256456 at 2026-09-16T22:44:44Z, not refreshed. Generation remains paused. No commit or push.

At 06:35 UTC, port 4345/PID30804 hosts the new preview, 4343/PID31044 hosts the untouched old app and 4342/PID28132 hosts the earlier static mock. Ports 4318, 4319, 4320, 4324, 4335, 4336, 4340, 4341 and 4344 have no listener. Test-owned services exited. Ask before restarting any existing Takko process.
