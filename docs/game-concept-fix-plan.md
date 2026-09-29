# Concept reliability fix plan

Make the concept flow handle output structure, useful decisions and allowed spending explicitly. Start with the proven retry/error defects, then add provider-aware output contracts and evaluate semantic quality separately. Do not keep increasing individual limits or silently trim requested content.

## Scope

- In: concept acceptance and readiness, opt-in structured output for the tested OpenRouter route, engine attempt policy, dispatch/error accounting and regression evidence.
- Out: changing the default model, redesigning the app, rewriting every provider adapter, game generation, Studio automation or resuming the paused goal.

## Action items

1. [x] Promote the offline reproductions into targeted tests for `engine.ts`, `providers.ts` and the concept flow. Preserve both original failures and test a known local block separately from a real uncertain transport failure.
2. [x] Add an explicit call policy for maximum attempts and fallback permission in `engine.ts`. Make the concept trial set one attempt before reservation or dispatch. Keep artifact `repairLimit` separate. Do not change unrelated phases' defaults implicitly.
3. [x] Preserve validation details and dispatch status through `providers.ts` and `diagnostics.ts`. Keep a known pre-dispatch refusal at zero billed usage and retain the reservation for genuinely uncertain network failures. Show the rejection cause and exhausted attempt policy instead of claiming a provider outage.
4. [x] Pass a typed output contract from the concept call to the provider adapter. For a verified OpenRouter endpoint, serialize a supported strict JSON Schema and require compatible routing. Keep unsupported length/cardinality checks local and test schema conversion explicitly. Unsupported endpoints must follow an explicit compatibility policy, not a silent change in guarantees.
5. [x] Separate readability targets from mandatory validation in `concept.ts`. Preserve a bounded complete proposal when it merely misses a presentation target. Keep genuine shape, source, decision and resource-limit violations blocking. Do not truncate arrays or user requirements to manufacture a pass.
6. [x] Make decision state explicit and revision-bound. Retain server-owned identities for answered decisions and links to user sources, expose selected defaults and unresolved issues for review, and stop using an empty questions array as sufficient evidence of a resolved brief. Require playtest actions and observable outcomes to be represented separately from setup work. Treat free-text meaning as an evaluation problem, not something a broad keyword regex can guarantee.
7. [x] Validate the implementation with saved responses, unsupported-schema cases, renamed questions, ambiguous requests, explicit delegation and clear requests. Check one-dispatch accounting, cancellation, persisted concepts and planning handoff. Run the complete `npm run check`, preserving all failures and historical artifacts.
8. [ ] Freeze an approved live protocol for fresh ambiguity, answered clarification, full-plan handoff and a clear request. Inspect actual outbound contract fields. Score resolved decisions, preserved mechanics, no redundant questions and player-only playtest actions separately from schema validity. Compute reservations against the original remaining ceiling before any request. Obtain run-specific authorization and permission for any necessary server restart, then stop on failure and reconcile each receipt.

## Acceptance criteria

The first implementation must stop after one dispatch when requested, retain the real rejection reason and avoid claiming a known local block was billed. Strict mode must use a provider-compatible schema while local validation remains authoritative. Saved evidence must remain intact.

A concept cannot be called a successful novice outcome merely because it parses. Live acceptance requires a selected direction consistent with the answers, no revived answered choices, preserved rescue/reward/progression intent and checks a player can perform after building. The semantic test corpus must include different genres and held-out wording rather than only the pet examples used to tune this change. Repeated live evaluation is a separately authorized activity, not an automatic retry loop.

Steps 1 through 7 are implemented and verified by the complete offline check. The user then authorized a $5 combined ceiling. Step 8 ran its first live stage: strict structure passed, semantic review failed because the unresolved game premise was assumed. The stopped trial was not retried and the full handoff remains unverified. See [live results and narrated demo](game-concept-live-demo.md) and [implementation verification](game-concept-reliability.md).
