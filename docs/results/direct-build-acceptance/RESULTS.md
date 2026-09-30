# Direct-build acceptance

Attempt: 2026-09-30T04:51:05Z. User authorized one new Sonnet 5.5 trial with a $2.50 cap, repairLimit 0 and no automatic retry.

## Result

**Failed before inference. Zero provider calls, $0 actual cost, $0 reservations, zero generated files.** Project `51dafcb4-1352-4988-9bd0-69b1e951bbdd`, scope `Forge_51dafcb41352`. Original failed project `6e6ffc7f-d435-4fb1-a722-3699a0749a74` remains unchanged.

The new project used the saved request, answers, proposal and exact selected asset identities: straw dummy 10161087974 and animation model 15008746676. Approval reached the direct build contract without any planning worker. The real Studio adapter then rejected `proposal-6e6ffc7f-d435-4fb1-a722-3699a0749a74` because its approval schema required a bare UUID. The rejection occurred before its first native asset call. The pipeline incorrectly classified that validation exception as unknown effects. The original failure and classification remain in `terminal-project.json`.

Proposal-owned discovery views actually produce `proposal-<project UUID>`. Earlier mocked adapters omitted the native binder validation and therefore missed this integration failure. The correction uses one shared schema accepting the two real formats, UUID and proposal-UUID, across the Studio binder and discovery API. Other strings remain rejected. Invalid binding now explicitly reports no native effects. A regression consumes the actual proposal producer output through approved candidate selection and the real Studio binder. It does not invent a passing discovery ID.

## Billing reconciliation

| UTC | Key allowance | Key usage | Remaining key balance |
| --- | ---: | ---: | ---: |
| 2026-09-30T04:51:04.493Z | $30 | $17.38930327 | $12.61069673 |
| 2026-09-30T04:51:05.474Z | $30 | $17.38930327 | $12.61069673 |

Provider balance delta: **$0**. Per-call actual charges and conservative reservations: **none**, because nothing was dispatched. Authorization cap: $2.50, entirely unspent. Model `anthropic/claude-sonnet-5.5`, confirmed rates $2/M input and $10/M output. API keys were read only in memory from Windows DPAPI. No plaintext key was saved or printed. Original active model settings were restored immediately after the one approval request, while the trial retained its captured $2.50 cap and repairLimit 0.

## Verification and boundaries

The source correction passed 100 focused tests across Studio adapter, asset choices and direct-build files. Full check results are recorded in the improvement report after completion. No second attempt was made. No real model behavior, export quality or gameplay was established.

Studio state was checked before and after the attempt. It stayed in Edit mode. A read-only native check confirmed no trial namespace or temporary imports existed afterward. No existing scripts were modified, no Play session started and no test service remained. All MCP clients started by the task were closed. See `studio-cleanup.json`.

## Installed correction

After the recorded failure, the fix passed the full check: 1,797 unit tests/138 files, six Luau scenarios, 16 plugin groups, six guards, 14 desktop tests, production smoke, 106 browser tests, 10 Electron journeys and build/typecheck. CSS: 274 warnings, zero errors. The corrected bundle is installed at the stable app path and restored the same workspace on launch. No second generation attempt was dispatched.
