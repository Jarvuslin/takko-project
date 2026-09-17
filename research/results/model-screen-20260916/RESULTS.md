# Four-model screening result — 2026-09-16

**Sonnet 5 was the strongest executable-controller candidate in this small screen.** It is not yet a full-game winner or a measured improvement over Sol. Four paid calls cost **$0.093632008**, with no retries or model-output edits. Official key usage increased by exactly that amount to $8.470743544; **$1.529256456 remains**. The long-running goal stays paused.

| Candidate | Actual cost | Response time | Native Studio result | Interpretation |
|---|---:|---:|---|---|
| Claude Sonnet 5 | $0.023992 | 18.2 s | 15/15 fixture checks passed | Promote to a bounded full pipeline trial when further testing is appropriate. |
| Qwen3.8 Max 0902 | $0.036346 | 114.9 s | Initialization error; checks could not run | Calls `Clone()` on a Vector3. Compiles but fails against the real Roblox API. |
| Kimi K2.7 Code | $0.031298208 | 82.4 s | No executable answer | Hit 8,000 output tokens, including 7,999 reasoning tokens; `finish_reason=length`. Capability inconclusive under this configuration. |
| GPT-5.6 Luna | $0.0019958 | 12.5 s | 14/15 fixture checks passed | Very cheap, but failed sheet completion under overlapping presses. |

## What was actually compared

One identical compact request per model combined three tasks: propose three Marketplace queries for a hypothetical butter-cutting ASMR brief, adapt an actual archived Marketplace bubble-click source into an explicitly specified controller interface, and review a separate deliberately defective reset snippet. This is a controlled component screen, **not Takko's complete production agent loop**. The cutting brief is a test scenario, not a claim that the user's existing Butter asset performs cutting.

The original bubble script plays its existing sound, hides its part and disables its detector. Its exact archived source and hash are recorded in `protocol.json`. The new controller fixture has 12 native Parts with SpecialMeshes, retained sound identifiers and ClickDetectors. This simplified fixture is deliberately synthetic; it does not import or execute the full Marketplace asset, its regeneration script or unrelated bundled scripts.

All models received the same messages, 8,000 maximum output tokens, requested low reasoning effort, 180-second request timeout and no retry. Identical requested settings do not imply identical supported reasoning controls: Kimi exhausted the allowance before answering. Sonnet reported no reasoning tokens; Qwen reported 4,684, Luna 396. Different tokenizers also explain differing input-token counts. Raw requests/responses are retained in directories `0` through `3`.

## Native findings

Unedited generated sources were compiled, inspected before execution, and run inside isolated Studio **Edit-mode** fixtures. Checks covered fresh/duplicate/outside presses, asynchronous count timing, native property depression, popped-state rejection, twelve-bubble completion, original property restoration, reset during animation, replay and destruction during pending work.

- **Sonnet:** all checks passed. Its per-part cancellation tokens avoided the shared-token error. Static review also found its disconnected animation connections remain in a growing list until Destroy; long-session resource behavior was not tested. It is a promising candidate, not production approval.
- **Qwen:** `mesh.Scale:Clone()` fails because Vector3 has no Clone method. No manual repair or second model call was made. Static reading also suggests a cancellation check before a yield could permit one stale visual update afterward; this secondary issue was not reached natively.
- **Luna:** increments one shared generation counter on every Press. A new bubble invalidates animations on earlier bubbles; the simultaneous completion case failed. Reset/replay checks passed in isolation. Passing many checks does not compensate for a failed essential gameplay behavior.
- **Kimi:** no controller available; it was not assigned a runtime failure or native score.

The first native harness attempt hit a Studio assistant capability restriction while parenting a ModuleScript. That failed attempt is preserved as `0/native-result.json` and is **not a Sonnet failure**. The harness was adjusted to evaluate the unchanged module body inside a function, and the same revised template was used for all executable candidates. Candidate code was not repaired. The model contract and high-level rubric were frozen before dispatch; the native harness was written during the batch, before reading candidate source. Evaluation was not blinded.

These checks do **not** establish physical mouse/touch interaction, audible audio quality/synchronization, multiplayer authority, exported-place correctness or full-game success. No production scripts were replaced. Every owned fixture was removed; independent closure confirms zero `TakkoModelScreen_` leftovers, Studio remains in Edit, and the user's Butter remains present.

## Marketplace and review findings

Each usable answer's exact first query was executed against the Studio Marketplace search tool, with raw responses saved. No returned asset was inserted, selected by the model or functionally validated.

| Candidate | First proposed query | Returned five-result list |
|---|---|---|
| Sonnet | `butter cutting ASMR animation sound` | ASMR Butter appeared second. |
| Qwen | `butter cutting ASMR` | ASMR Butter appeared first. |
| Luna | `Roblox butter cutting ASMR animation sound` | Mostly unrelated items; no ASMR Butter entry. |

This measures candidate retrieval from the first query, not complete sourcing success or proof that a candidate meets the cutting requirement. None proposed the simplest `butter` query first despite the instruction to start broad. The earlier context/search concern therefore remains relevant even with stronger models.

All three usable defect reviews identified the pending-callback/reset race. Luna explicitly described old/new overlapping presses and loss of original transparency; Qwen also identified lost original transparency. Sonnet missed that latter point and included imprecise wording about busy-state handling. These qualitative observations come from one small supplied snippet, not a reliable reviewer leaderboard.

## Budget, validation and stopping point

The existing conservative campaign liability was $9.017482, including older uncertainty retained separately from actual charges. This batch reserved a $0.50 ceiling and preserved $0.40 headroom under the original $10 campaign limit. Rounded new cost is 93,633 microdollars, giving **9,111,115 conservative cumulative microdollars**; historical unknown liabilities were not erased. No new call has unknown cost. Initial post-call balance lagged; `key-settled.json` later matched all four receipt costs exactly.

Kimi's actual routed rates exceeded the catalog's lowest listed rate: its $0.031298208 receipt exceeded its $0.029422 estimated individual reservation, while remaining well inside the reserved batch ceiling. Future experiments should pin provider/pricing or admit against provider maxima; catalog minimum pricing is insufficient for a strict per-request bound. No automatic retry or budget increase occurred.

Eight local guard/parser/freeze assertions passed. `npm run check` completed successfully: **1,224 unit/API tests, 10 desktop tests, 36 browser tests**, plus Luau/plugin/guard/build/production checks. Those offline checks are separate from the native fixture results above. No application source or model routing was changed this turn.

The four-call batch is terminal, with no scheduled continuation. Composer was not run because Cursor access/integration remains unestablished; Opus and K3 were outside this economical screen. The next evidence-producing step would be one Sonnet full-pipeline run and a separately configured Kimi retest, not a general model switch. Neither has been started. This report is the stopping point requested before expansion, conserving remaining Codex usage.
