# Concept failure root cause

The repeated failures come from a mismatch between probabilistic model output, strict local acceptance and an incompatible retry policy. The underlying provider did not fail on either saved response. Raising individual limits treated the immediate symptoms. It did not fix error handling or establish useful decisions for a novice.

This investigation used the requested code-showcase-systematic-debugging and concise-planning skills. Product code is unchanged. The proposed implementation is in [the fix plan](game-concept-fix-plan.md).

## Traced failure chain

1. The concept branch in `src/generation/engine.ts:1331` sends a JSON Schema as system-prompt text. `providedSchema` selects the prompt's schema, not a provider-enforced response contract.
2. `src/generation/providers.ts:194` sends only `response_format: { type: "json_object" }`. Both saved requests confirm this. The recorded Anthropic endpoint advertises structured outputs, but the adapter never requests that mode.
3. Both paid replies ended normally and parsed successfully. The first exceeded two 500-character bounds by 22 and 31 characters. The second supplied five steps against a four-step bound. Neither exhausted the 2,000-token output allowance.
4. `src/generation/engine.ts:1296` rejects the whole response on either violation. It does not distinguish a presentation target from a blocking contract error.
5. `src/generation/engine.ts:1135` unconditionally permits two format attempts per routed profile. `repairLimit: 0` governs later artifact repair, not this loop. The trial's one-dispatch restriction exists only inside its transport guard.
6. The guard blocks the correction before network dispatch. `src/generation/providers.ts:215` catches every transport exception and replaces it with a generic connection error. The original validation message remains in events but is replaced as the final failure detail.
7. `src/generation/engine.ts:1242` cannot distinguish that known local refusal from an uncertain network failure, so it records the full reservation as estimated usage. The conservative rule is appropriate when dispatch is uncertain. It is misleading for a proven pre-dispatch block.

The trial guard was correct to prevent unauthorized spending. The defect is that the engine cannot receive the same attempt policy before calling the transport, and cannot represent a known non-dispatch cleanly.

## Separate cause of poor guidance passing

The concept validator checks shape, bounds, unique question IDs and an exact match against answered IDs. The transition at `src/generation/engine.ts:1365` then uses an empty question list to mark the concept ready for review. The plan guard and `GameConcept.tsx:87` likewise depend on questions and revision freshness.

There is no corresponding check that a delegated choice has become one choice, that a repeated decision has merely changed its identifier, or that the playtest describes playing rather than editing Studio. The proposal and supplied answers are sent to the model, so lost answers are not the explanation in these trials.

An offline replay through the current concept flow accepts the exact saved response with its unresolved camera alternative and manual pet placement. A second isolated comparison rejects an answered question under its original ID but accepts the same wording under a new ID. This proves an application acceptance gap. It does not prove why the model chose those particular words or that a different prompt will reliably prevent them.

The existing successful tests mostly supply compliant concept fixtures. They establish state transitions, source preservation and accounting on those inputs. The real-response regressions establish that wider bounds accept those responses. Neither is a semantic-quality benchmark.

## Why enabling strict output is only part of the plan

OpenRouter documents `json_schema`, strict mode and endpoint support requirements, including `require_parameters`. It also cautions that enforcement varies by provider. [Official documentation](https://openrouter.ai/docs/guides/features/structured-outputs).

Anthropic documents unsupported string length constraints and array constraints beyond a minimum of zero or one. Its SDK transformations remove unsupported constraints before sending and still validate the original schema locally. Consequently, sending our existing schema unchanged can be invalid, and strict output alone cannot be claimed to prevent these exact two failures. [Official documentation](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).

Both official pages were saved as HTTP 200 responses with URL, UTC timestamp and SHA256 under `research/evidence/concept-root-cause-20260920`. These are published interface claims, not a new live compatibility test. No conclusion about OpenRouter's internal schema transformation was inferred.

## Controlled offline probes

`research/scripts/diagnose-concept-root-cause.mts` disables global network fetch, uses injected replay transports, reads the preserved paid replies and invokes the actual parsing/provider/engine paths. Historical acceptance schemas are reconstructed from the current schema with the original description and step bounds. This is not an exact historical binary replay or a model rerun.

| Probe | Observation |
| --- | --- |
| Original reply against original bounds | Exactly the two recorded length errors |
| Second reply after only the description fix | Independent five-step error remains |
| Saved request and endpoint metadata | JSON mode, prompt schema, structured-output capability advertised |
| Historical schema plus one-dispatch guard | Two transport entries, one accepted replay, generic connection error and second reservation |
| Same replay with a synthetic valid correction | Succeeds on attempt two despite repairLimit zero |
| Local guard refusal versus simulated network exception | Both reduced to the same connection error |
| Current concept flow with the exact saved poor guidance | Accepted with no questions and ready-for-review event |
| Repeated answered question with original ID | Rejected |
| Same question with a different ID | Accepted |

The synthetic correction removes the fifth step only inside the diagnostic fixture to isolate the retry-policy variable. It is not a proposed production truncation, a verified model correction or evidence that the resulting guide is good.

Final result: **9/9 diagnostic probes passed**, meaning they reproduced the predicted current behavior, including defects. Evidence: `research/results/concept-root-cause/replay-w1xn9c/RESULTS.json`. Source and inspected request/response hashes matched before and after the probes. No product source was modified.

The initial diagnostic run passed six probes and failed three before inference because its mock profile lacked a fixture key. Added a clearly artificial in-memory fixture key and reran. Both runs remain preserved, including `replay-o8Qctf` and `docs/results/concept-root-cause-diagnostics.txt`. Final log is `docs/results/concept-root-cause-diagnostics-final.txt`. No real credentials were accessed. Harmless source-read path errors were corrected during inspection.

## Limits and current state

This turn is diagnosis and planning, not an implementation. All `npm run check` stages were skipped: vitest, test:luau, test:plugin, test:guards, build, test:desktop, test:production and test:e2e. Only the nine standalone offline diagnostic probes ran. No claim that the proposed fix works.

Paid calls zero, cost $0. Last recorded allowance remains $1.516651224 at 2026-09-20T20:46:57.154Z, not refreshed. Previous actual spend remains $0.011967 and cumulative outbound reservations $0.046313 under the original $0.15 ceiling. Old trials remain failed and stopped. No retry was attempted.

Listeners checked: 4346/PID 12300, 4345/PID 30804, 4343/PID 31044 and static 4342/PID 28132. No server was started, stopped or restarted. No Studio session occurred. The generation goal remains paused. Preserve unrelated dirty work and memory-only keys. No commit or push.
