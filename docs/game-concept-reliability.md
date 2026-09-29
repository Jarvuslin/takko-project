# Concept reliability implementation

Implemented the diagnosed control-path fixes. Invalid concepts stop after one attempt, known local dispatch blocks do not create provider charges, and saved proposals need explicit decision records and playtest outcomes before planning. New live model quality has not been verified.

This continues the requested code-showcase-systematic-debugging and concise-planning workflow. Original paid failures and diagnostic evidence remain unchanged. No paid calls or running-server restart occurred during implementation.

## Changes

### Attempts and accounting

`Engine` accepts an execution policy for total attempts per call, fallback permission and a pre-dispatch authorization hook. Concept calls default to one attempt with no model fallback. Other phases retain their existing behavior unless an explicit execution policy restricts them. The evaluation runner applies one attempt to every stage. Artifact `repairLimit` remains separate.

The authorization hook runs before a reservation is acquired or a model attempt begins. Known local refusals use `DispatchDenied`. The provider adapter preserves that typed refusal while continuing to scrub unknown transport errors. A proven non-dispatch records no charge. An ambiguous transport failure still retains the conservative reservation. Earlier validation details survive a later refusal instead of being replaced by a misleading connection error.

Cancellation while authorization is pending sends no inference request and releases no artificial charge. Cancellation after an actual dispatch retains the existing conservative behavior. Disabled backup routes no longer require unused credentials for concept work.

### Provider contract

Models now offers **Check concept response structure** in the advanced options for Anthropic models through OpenRouter. This is opt-in and applies to concepts. Normal JSON mode remains available, labelled **Request JSON replies**. Switching to a different model family clears the incompatible strict setting.

Before strict inference, Takko reads public endpoint metadata, verifies the Anthropic endpoint advertises structured output and response-format support, and pins that endpoint with fallback disabled and parameters required. Unsupported or unavailable metadata stops before inference. No provider credential is sent with the metadata request.

The adapter sends a typed `json_schema` response contract. `output-contract.ts` converts unsupported Anthropic length, numeric and array-count constraints to descriptions, preserving full local validation. The wire schema is not duplicated in the prompt. Its actual serialized size is included in the conservative request reservation. This reduces redundant input without pretending grammar constraints can prove semantic correctness.

### Decisions and readiness

New model responses include selected decisions with source references, unresolved issues and an observable check for each playtest action. Local checks reject unknown sources, duplicate answer bindings, unapplied delegated defaults and mismatched playtest step numbers. Missing decision records or unapplied answers leave a bounded proposal visible but block planning.

The server retains accepted question identities. An answered question cannot return with the same normalized wording under a different ID, and a saved ID cannot be reassigned to different wording. This addresses the demonstrated rename bypass. It is not a general detector for paraphrased duplicate decisions.

Readiness is now a revision-bound computed state rather than a test for an empty question array alone. The UI shows choices and unresolved notices, displays per-action expected outcomes and asks to update older concepts before planning. Existing direct planning and saved project data remain supported. Historical replies are retained intact for inspection rather than silently truncated or promoted to a semantic pass.

No further description or step limits were increased. Readability remains prompt guidance, while bounded storage and contract checks remain mandatory. Free-text choices and player instructions still require review and live evaluation. A model could supply consistent records containing a poor choice. This implementation does not claim to solve that with keyword matching.

## Verification

The initial six regression tests produced **5 failures and 1 pass**, reproducing the targeted defects. After implementation, the focused concept/provider suite passed **38 tests in 3 files**. The evaluation budget policy passed **4 standalone tests**.

The first full check failed in vitest: **1,335 passed and 1 failed across 81 files**. A new unconditional optional-hook await let immediate cancellation happen before the legacy test's expected dispatch. Removed the extra scheduling boundary when no hook exists and added a separate pending-authorization cancellation test. A focused engine/cancellation rerun passed **67 tests**. The original failure log remains `docs/results/concept-reliability-full-check.txt`.

The second complete `npm run check` exited 0. No stages were skipped: **1,339 unit/API tests in 81 files**, six offline combat scenarios, 14 plugin mock groups plus plugin/eight injected source compilations, six guard fixtures with expected outcomes, TypeScript/Vite build, 10 desktop tests, production smoke and **86 browser tests**. The log is `docs/results/concept-reliability-full-check-second.txt`. Archived and restored **29 overwritten historical result files** under `docs/results/concept-reliability-check-artifacts`, using the 149-file pre-check backup. The test-owned server on 4319 exited.

These tests use mocked provider and Studio responses. Browser tests check UI behavior, persistence, accessibility and workflow state, not real model meaning or native gameplay. The old live fixtures test preservation and blocked readiness, not semantic success.

## Prepared live evaluation and budget

The four proposed stages are fresh ambiguous pet request, answered clarification, full-plan handoff and a clear pizza-shop request. The pizza request provides a different genre from the tuning examples. Each stage gets one dispatch. A saved passing semantic review is required before the next stage. No build, approval, publication or Studio session is included.

Runner: `research/scripts/run-concept-evaluation.mts`. Reviewable protocol: `research/results/concept-live-v3/protocol-proposal.json`. It refuses to read credentials or run live commands without a separate authorization record matching the proposed ceiling. The authorization-gate smoke check exited **2 as intended**, with zero credential reads and zero inference.

An offline pre-dispatch forecast using the actual engine and compact synthetic replies reserves:

| Stage | Forecast reservation |
| --- | ---: |
| Initial concept | $0.018439 |
| Clarification | $0.018909 |
| Plan, with a 4,000-token output limit | $0.053801 |
| Clear request | $0.018543 |
| New trial total | **$0.109692** |
| Earlier trials | **$0.046313** |
| Combined | **$0.156005** |

This already exceeds the original $0.15 cumulative reservation cap. Actual generated contexts may be larger. The prepared protocol proposes a **$0.20 combined cap**, pending explicit user approval. This is a conservative reservation ceiling, not a forecast bill. The output limit remains 2,000 for concepts and is explicitly 4,000 for the plan. Exact per-request reservations and receipts remain authoritative, with no retries or silent cap expansion.

Paid calls this turn **0**, cost **$0**. Historical actual paid cost remains **$0.011967**. Last known key allowance **$1.516651224 at 2026-09-20T20:46:57.154Z**, not refreshed. No real credentials were accessed.

## Runtime and remaining limits

Existing listeners remain 4346/PID 12300, 4345/PID 30804, 4343/PID 31044 and static 4342/PID 28132. Preview 4346 reported zero model profiles and zero active profile keys during this turn. It still runs the older backend and needs an approved restart to load these changes. Other servers were untouched.

The paused generation goal remains paused. No Studio session occurred. No commit or push. Preserve unrelated work, historical failures, drafts and memory-only keys. The remaining validation is the approved real-model evaluation and semantic review, not another mock pass.
