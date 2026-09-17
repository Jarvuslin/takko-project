# V15 post-adaptation review budget assessment

The guard correctly refused the next call under the recorded **$0.950000 project cap**, but admission missed by only **$0.000740**. The reconstructed reservation was **$0.573752** against **$0.573012 remaining**. This was a pre-dispatch budget refusal, not a failed provider response, semantic rejection, or unknown charge.

The minimum project cap admitting this one unchanged request would have been **$0.950740**. A literal $1.00 cap would also have admitted it; neither amount guarantees completion of subsequent adaptation, acquisition, review, or gameplay work. Campaign/key limits remain separate and cannot be inferred from this per-project calculation.

## Exact reconstruction

The offline diagnostic verified all **76 source/controller pins** in the V15 experiment, unchanged planned request/specification/scope/revision, and the immutable prepared-to-first-adaptation archive chain. It rebuilt the chronological host stage immediately before event 23 (`component_adapted_review_call`, `2026-09-16T20:53:18.932Z`) and used the production evidence/preservation presentation helpers and actual `Engine.call` serialization. Its injected transport only captured request bytes and threw locally: **zero network, model, or Studio operations**. Historical files were not modified.

No historical outbound HTTP body was saved. This is a deterministic reconstruction, not an independent historical wire capture. As a cross-check, reconstructing the initial review produces exactly its recorded **398,976-microdollar reservation**. The refused call had no provider token receipt.

| Reservation input | Exact amount |
|---|---:|
| System message UTF-8 bytes | 8,605 |
| User message UTF-8 bytes | 217,247 |
| Fixed input allowance | 1,024 |
| Total conservative input allowance | 226,876 |
| Configured input rate | 2 microdollars per token |
| Input reservation, treating every byte as a token | 453,752 microdollars |
| 12,000-token output cap × 10 microdollars | 120,000 microdollars |
| **Refused reservation** | **573,752 microdollars** |
| Already charged, rounded project ledger | 376,988 microdollars |
| **Total required for admission** | **950,740 microdollars** |

The wire JSON body is 246,544 bytes because message strings are escaped again. Engine correctly reserves from the system/user message bytes, not that larger HTTP-body size. No screenshot/audio allowance applies to this source-review call. The trial had no cumulative-reservation cap; this refusal came from the ordinary spent-plus-pending-plus-proposed project guard.

## Where the context size comes from

The following are JSON-serialized **value** sizes, excluding their surrounding property names/separators. Nested rows overlap; do not sum them as independent totals.

| Context block | Bytes |
|---|---:|
| Game context | 44,292 |
| Current component evidence | 49,940 |
| Stage/ownership context | 8,478 |
| Preservation context | 101,575 |
| ↳ Original evidence within preservation | 65,863 |
| ↳ Applied plan, with source-hash references | 8,564 |
| ↳ Original-to-current mapping | 26,706 |
| Review/stage/preservation instructions | 9,189 |

The original evidence has **375 nodes / five unique source bodies**; current evidence has **367 nodes / two unique source bodies**. There are **no identical source hashes shared between the two snapshots**. Their 32,069-byte original and 16,627-byte current source-body collections therefore are not duplicate copies of the same code. Removing the original snapshot would lose the required behavior-preservation comparison. Replacement source bodies already appear as hash references in the applied plan rather than being repeated there.

There is measurable unnecessary repetition elsewhere:

- The same complete user request appears **19 times**: the top-level request, its authoritative user-source text, and repeated full-request requirement quotes in both the complete and target requirement lists. Eighteen repeated JSON string values account for **22,644 bytes**, before reference overhead. Preserve the original user source once and use exact, validated references for repeat quotations in a model-only view; do not rewrite the accepted plan or lose source attribution.
- Eight target requirements repeat rows already present among the 13 complete requirements. `gameContext.assetTarget` is 14,813 bytes, including its need and explanatory fields. The current need also appears in the target, component context, and stage need list. References to a canonical requirement/need table could preserve the same coverage and ownership while avoiding repeated prose. These savings overlap with the quotation figure above.
- The preservation source-binding map has **77 rows / 16,896 bytes**. Two source hashes occur **74 times each** across source bodies, plans, and mapping rows. An offline representation experiment groups identical hash-pair/change records while retaining each ordered `[beforeIndex,currentIndex]` pair: **six groups / 1,618 bytes**, a **15,278-byte reduction** for that map alone. This is a candidate presentation format, not an implemented protocol or demonstrated quality improvement. Distinct before/current namespaces, every binding, removals, and additions must remain explicit and mechanically equivalent.
- The before/current node tables total **52,382 bytes** and repeat many class/name/hierarchy fields. A lossless table/reference representation is another possibility, but it has greater interface risk than deduplicating request quotes and grouped binding hashes. Both hierarchies remain necessary evidence.

Only **370 fewer input bytes** would have admitted this particular call under the unchanged $0.95 cap. That is a threshold observation, not justification for stripping evidence or tuning prompts to this game.

## Byte allowance versus observed tokens

The earlier real Sol review used **32,864 input / 5,346 output tokens**. Its input byte allowance was **139,488**, or **4.2444 times** observed input tokens. The actual first adaptation used **33,210 input / 6,734 output tokens**, compared with a **144,233** conservative input allowance, or **4.3431 times** observed input tokens. The output cap also exceeded both observed outputs. These explain why the reservation is much larger than the money already charged.

Applying the first review's ratio to the refused request would suggest roughly 53,454 input tokens. That is an **unverified extrapolation**, not a safe replacement for the guard: the added preservation tables have different tokenization, this request has no measured token count, and future outputs/reasoning/provider charges remain unknown. A model-specific tokenizer plus documented overhead and conservative fallback could be investigated separately; dividing bytes by an observed ratio would weaken the spending bound without adequate support.

Provider charges also differ from simple configured-rate arithmetic. The initial review's configured `2 × input + 10 × output` equals **119,188 microdollars**, while its reported rounded charge is **135,619**. The adaptation formula gives **133,760**, versus a reported **150,364**. Both are close to an effective 2.5-microdollar input rate with the same output rate, but these retained records alone do not establish the cause.

The saved fresh official catalog in [preflight.json](preflight.json), `selectedModels[0].pricing`, advertises Sol prompt **$0.000002/token** and completion **$0.00001/token**, matching both the configured profile in that preflight and the frozen trial profile. It also lists cache-read **$0.0000002** and cache-write **$0.0000025**, plus a separate long-context override beginning at **272,000 prompt tokens**. Both observed calls have far fewer prompt tokens and their retained project charges show zero cached-input tokens. The numerical alignment with the listed cache-write rate is a possible accounting explanation, **not a demonstrated attribution**: the project charge records do not preserve a cache-write token breakdown or an authoritative per-generation price explanation. No fee, provider surcharge, or price change is established here. Any future tightening of the reserve should first reconcile that discrepancy against authoritative pricing/usage, rather than assuming configured token arithmetic equals the bill.

## Bounded next candidates

The lowest-risk direction is a lossless model-presentation layer that deduplicates authoritative requirement quotations and repeated need/requirement rows, then groups identical source-binding hashes while preserving every pair. Test round-trip equivalence, immutable raw records/hashes, distinct before/current citation authority, and actual Engine request sizes. Keep original and current source evidence, unchanged acceptance gates, and the conservative guard until separately justified. No optimization has been implemented or measured for model quality by this assessment.

Frozen evidence: [offline diagnostic source](budget-diagnostic/controller.ts.txt), [computed measurements and hashes](budget-diagnostic/analysis.json), [reconstructed refused request](budget-diagnostic/post-adaptation-request.json), [reconstructed initial request](budget-diagnostic/initial-request.json), and [file hash manifest](budget-diagnostic/freeze.json). These artifacts were created exclusively in a fresh directory. No credentials were accessed; no plaintext keys or synthetic Engine storage/charges are included. The diagnostic's separate local capture-only Engine records are not provider charges and must not be merged into the historical monetary ledger.
