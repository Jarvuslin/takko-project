# OpenCode coding adapter

2026-09-24. Implemented an opt-in OpenCode backend for new Takko projects. It replaces paid coordinator scheduling and per-area implementation planning with one compact plan, one coding session across unfinished tasks, and one independent review. Repairs also use OpenCode. The persistent proposal, one Approve & build action, selected assets, scoped edits and cumulative spending remain owned by Takko.

This is an implementation and offline protocol result. No paid generation, full fighting-game run, native Studio gameplay or production cost saving is established.

## What changed

- `src/generation/opencode-runtime.ts` runs the hash-pinned OpenCode 1.18.31 Windows executable in an isolated temporary directory. It exposes authenticated loopback MCP tools for authoritative context and validated patch submission. Shell, filesystem, web and subagent tools are denied. Large results are paged through immutable references instead of silently losing evidence. Repeated tools without progress stop the session.
- `src/generation/opencode-gateway.ts` keeps the real provider credential in the host. OpenCode gets an ephemeral local capability. Main, helper, compaction and retry requests use the same fixed provider route and cumulative ledger. The gateway streams responses, reads usage receipts, reserves before asynchronous dispatch hooks, and blocks further dispatch after errors, budget denial or unknown billing. No automatic upstream retry follows a provider failure.
- The runtime retains the configured API model ID. A generic alias alone suppressed OpenCode's Claude-specific caching transforms. The final offline protocol check confirms that ephemeral cache markers survive runtime serialization and gateway forwarding. It does not measure provider cache hits or savings.
- `engine.ts` shares its existing task ownership, asset provenance, scene and compiler validators with the adapter. Dependencies must finish before their consumers. Completed tasks cannot be resubmitted. Only validated patches become durable checkpoints. Runtime cancellation reaches asynchronous host tools. Fatal asset/input blockers return to the existing application flow.
- Proposal edits use the existing dependency map and retained implementation candidate. A failed replacement restores the published artifact and keeps completed replacement tasks for retry. Requirements and independent tests are not agent-editable tools. Jev remains restricted to bounded non-coding decisions.
- Run records retain project/revision/proposal identity, runtime version, session/message IDs and charge ranges. Individual pending requests retain profile, reservation and run identity. Recovery converts outstanding requests into conservative charges without resetting the allowance or overwriting saved work.
- Ordinary Takko calls now persist their reservation before awaiting the dispatch hook. This closes a shared-ledger race with concurrent helper calls. A regression first failed with a visible reservation of zero, then passed after the fix. Rejected dispatch still costs zero.

Existing saved coordinator projects retain their backend and records. Configuring OpenCode does not migrate or retry the failed fighting project. No generic competitor source code was copied into Takko. This uses OpenCode's public CLI, provider configuration and MCP boundary. The downloaded executable is an MIT-licensed upstream release, not an executed research checkout.

## Activation

The verified executable is prepared locally at `.forge/tools/opencode-1.18.31/opencode.exe`. Its SHA-256 is `0242a0dc705af67c90882b456a36b619883c1c786aad8fe071a1bc64e5d1d440`, matching the earlier independent comparison binary. The adapter rejects a different executable before paid implementation planning.

Set `FORGE_OPENCODE_BINARY` to that absolute path when deliberately launching a future application instance. The browser server reads it from its environment configuration. Desktop forwards only this additional executable-path setting, while provider credentials continue to come from its vault. Create a new project to use the backend. This setting was documented in `.env.example`, but the user's environment, saved profiles, packaged app and existing projects were not changed or restarted.

The first adapter supports OpenRouter and configured compatible chat-completions endpoints for coding. Native OpenAI, Anthropic and Gemini coding routes fail before dispatch. Planning, independent review and asset operations keep their existing provider implementations. Screenshot-driven OpenCode repair explicitly stops as unsupported and retains the screenshot and artifact. Do not claim provider/media parity.

There is no silent fallback to the old coordinator when the runtime is missing. Ordinary proposal discussion remains available without launching OpenCode. A restarted coding run creates a fresh runtime session from authoritative Takko checkpoints rather than trusting an old summary. Sessions have a 48-request limit, a 15-minute deadline and the existing monetary limits. Context and output size limits remain explicit bounds, not proof of model compatibility or game quality.

## Verification

The real OpenCode 1.18.31 executable passed the local protocol smoke three times. Each run used real MCP HTTP and two scripted, streamed model responses. A host tool saved its checkpoint, session/message IDs were captured, both synthetic receipts reconciled and no reservation remained. The first two runs passed eight assertions each. The final run passed eleven assertions, additionally checking the actual model identity, serialized Claude cache markers and absence of shell/filesystem/delegation tools. Actual paid cost was zero. The simulated 200 microdollars per smoke is fixture data, not provider spending.

Run the protocol smoke with `npx tsx scripts/verify-opencode-runtime.ts`. It never calls the configured provider. It uses a synthetic transport and an isolated project.

New regressions cover the shared ledger, concurrent admission, interrupted streams, unknown billing, restart recovery, Jev rejection, unsupported providers, credential isolation, authentication, bounded evidence retrieval, no-progress stopping, pinned binary rejection, dependency ownership, cancellation, protected repair tests and the complete proposal re-edit path. The proposal regression uses an unrelated gliding game. No fighting prompt, asset ID or mechanic was hardcoded into the adapter.

One targeted Vitest run suffered the known Windows worker exit `3221226505`. It was not a pass. Its evidence and the failing shared-ledger and model-identity regressions are preserved beside subsequent passes. TypeScript also caught an incorrect fixture property during development, which was corrected before the full check.

The first full check exited 1. All earlier stages passed, then the browser stage finished with 164 passes, one skip and one failure in the existing minimal-workspace test. Its asynchronous `/api/status` fixture tried to read a response after Playwright disposed it. The full trace, report and error context were copied before rerunning. Two deterministic lifecycle regressions reproduced disposal before a pending route drained, for both successful and failing tests. The fixture now waits for active routes in `finally`, without suppressing errors or changing UI assertions. Both regressions passed after the correction. The model-identity fix also landed after the first full check began, so its results cannot certify the final source.

The final `npm run check` exited 0. All required stages ran:

| Stage | Actual result |
|---|---|
| Unit/API | 1,543 passed in 99 files |
| Offline Luau | Six scenarios passed, four sources compiled |
| Plugin mocks | Fourteen groups passed, plugin and eight injected sources compiled |
| Guards | Six cases passed |
| CSS | Zero errors, 556 existing warnings |
| Build | TypeScript and Vite passed |
| Desktop | Fourteen passed |
| Production | HTML, bundle, API and unknown-route smoke passed |
| Browser | 165 passed, one intentional mobile resize skip, 7.3 minutes |

The suite includes 27 additional unit/API regressions compared with the previous 1,516-test baseline. All 362 recorded final source hashes match. Both full-check logs remain preserved. Only the final run certifies the final source.

Evidence: [results directory](results/opencode-adapter-20260924/), including the red regression, worker failure, targeted reruns, real-runtime smoke and full check log. Offline mocks and protocol checks are not successful Studio integration or gameplay. The independent reviewer still stops the product at ready to test.

## Cost and operational state

New paid cost: $0. No provider balance request, live generation retry, Studio mutation or app restart. Historical accounted spend remains $3.990954 of $4.40, including unknown holds. Remaining historical authorization is $0.409046. Last observed provider balance remains $1.263503974 at 2026-09-24T03:32:45.775Z, not refreshed and not represented as current.

At 2026-09-24T18:00Z there were no listeners on 4318, 4319, 4324, 4335 or 4336. The owned browser-test service exited. Studio PIDs 3088 and 6604 remain present. No Studio session was started or changed, so no scripts, probes or imports required restoration. Studio mode was not inspected. The failed fighting project `e4689e81-9de2-4d7d-b958-c904194f6a44` remains untouched. No live re-edit or claim of a playable fighting game follows from this work.

The next evidence needed is a separately authorized, capped native comparison against the same fighting benchmark and unrelated tasks. The adapter removes routine orchestration calls, but its real accepted-result cost and gameplay reliability remain unmeasured.
