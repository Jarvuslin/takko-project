# Jev non-coding workers and recorded fighting workflow

Status: APPROVED for implementation by independent Arbiter. Understanding confirmed by user 2026-09-23, clarified Jev is for objectives, gameplay deduction, asset relevance/review/fetch decisions, not coding. Implementation already requested. All sequential reviews completed.

## Understanding and assumptions

Deliver the full simple fist-fighting game with Marketplace animation, practice dummy, attack VFX/SFX and exact hit counter. Record actual prompt, brief/asset approvals, building, native Studio application and gameplay. Smaller internal assignments should reduce repeated context, cost and recovery loss without reducing scope or adding approval busywork. Local single-user service and one leased Studio session. Preserve encrypted credentials, current app, unrelated changes and failed evidence. Existing total cap remains $4.40 with last conservative remaining $1.207997, balance may need refreshing. Do not invent a successful video if the run stops.

## Alternatives

A. Recommended: optional dedicated Jev route for bounded non-coding decisions, host executes validated tool operations, coding/review routes unchanged.
B. Keep all decisions on current larger models. Lowest integration work but retains avoidable decision-call cost.
C. Give Jev general autonomous planning/code/tool authority. Rejected because it returns typed choices/scores rather than arbitrary plans, source code or executable requests, and confidence cannot establish runtime success.

## Proposed decisions

D1. Add optional non-coding decision route to saved presets/settings and use the existing OpenRouter connection, with pinned Jev model supported through its Decisions API. Never route code generation or source security review to this endpoint.

D2. Brief analysis is structured advisory evidence: classify supplied gameplay facets as explicit, inferred, absent or uncertain, using a bounded host vocabulary plus an unknown/other escape. Preserve the entire original request for the planner. No classification may delete a requirement or decide consequential ambiguity. Goal text and novel mechanics remain the planner's job. Cache only against exact request/context/profile revision.

D3. Asset decisions use only returned candidate IDs and a none/needs-more-evidence option. Jev ranks candidate relevance and chooses the next candidate to inspect. It may flag unmet requirements from supplied metadata/inspection facts. Low confidence and unknowns fall through to the existing model route or explicit unresolved state within the budget. Scores are uncalibrated advice, not proof. Existing fixed approved pools must not silently replace a user's choice.

D4. Fetch is a host operation. Jev may choose from the allowed candidate IDs/actions, but cannot supply arbitrary Luau, URLs, object paths or credentials. Existing native adapter, leases, approval binding, inspection, retained provenance and playback checks remain authoritative. Imported-source review/adaptation stays with code-capable models. The host validates every result before use.

D5. Decisions use bounded batched questions for one job rather than one model call per trivial check. Existing deterministic scheduling/validation does not gain unnecessary model calls. Retain actual usage, reservations and failure evidence in project accounting. Unknown charges retain conservative reservations. No hidden retries/fallbacks beyond existing declared policies. Reject malformed responses and unrecognized IDs.

D6. Expose the route as non-coding decisions and show what was assessed with uncertain/unverified labels. Avoid claiming reviewed means safe or playable. Preserve existing user approval buttons. Do not silently change current user's coding model routes or saved settings.

D7. Verification includes provider contract, invalid IDs/confidence/usage/cancellation, monetary cap, stale cached context, original brief preservation, ambiguous noncombat cases, real candidate relevance evaluation and offline integration through Engine. Full npm run check follows implementation. Native inspection and gameplay are separate.

D8. Recording must cover real UI/model requests and the actual generated artifact in Studio. Retain raw recording and timestamped run ledger. No handcrafted game substitution. Full input/punch/dummy/VFX/SFX/counter tests, misses/cooldown/reset observations and cleanup. If budget or asset permissions block completion, preserve the failed recording and state the blocker rather than presenting intended steps as success.

D9. Jev does not write new search queries. Empty, poor or ambiguous results hand back to the existing query-producing route within its bounded search policy. Candidate selection uses only offered IDs. An approved singleton can be inspected deterministically without paying for a choice that has already been made. Explicitly do not expose the pipeline's query-bearing retry action as a freeform Jev output.

D10. Native run preflight must separately establish apply/test plugin connectivity and a playable animation strategy. The previous embedded-keyframe pack lacks a published AnimationId. Do not represent either as solved by ranking. Verify permissions and actual playback before a successful final recording. No automatic publication or replacement of an already approved asset.

## Skeptic resolutions

S1 accepted: D9 resolves query authorship. Existing asset-selection builder route remains the sole producer of new search text. Its existing budgets/search limits and paid call accounting apply. Add empty/irrelevant/repeated/exhausted-search cases.

S2 accepted: eligible product hooks are brief objective/gameplay classification, candidate metadata relevance/ranking and next candidate inspection choice. Jev must NOT replace Engine asset-evaluation (image/audio), component-source-review, component adaptation, build review or native tests. Asset review here means relevance and observed metadata readiness only. UI names this distinction.

S3 accepted: D10 records unsolved native blockers. No promise of a successful recording before live proof. These are acceptance conditions, not a reason to suppress a failed run.

S4 accepted: dedicated typed Decisions transport, pinned typesafe/jev-1.13, official OpenRouter Decisions endpoint. Verify current contract using primary docs and retained real pilot receipts. Validate model identity, question keys/options, finite distributions, usage and nonnegative cost. Use the existing engine reservation/settlement mechanism with a conservative serialized-input bound and pinned known pricing, rounding microdollars up. Unknown usage keeps reservation. No claim that normal chat transport supports Jev.

S5 accepted: asset-selection Jev replaces the present larger-model candidate decision. Brief classification is explicitly additional analysis and must be measured as such, not marketed as savings. Batch its questions, retain original request, expose unsupported/ambiguous results and pass advice only to the existing planner. No additional paid decisions for host checks or approved singleton selection. No savings/parity claim without measurement.

S6 accepted: confidence below 0.8, none, unknown or unsupported input returns unresolved advice and at most one handoff to the existing decision route. Confidence is not a success probability for the whole job. Invalid provider response, transport failure, timeout or unknown billing stops this run instead of silently retrying or cascading to another model. Cancellation always stops. Host cap applies before each handoff. No repeated Jev call for identical state in a run.

S7 accepted: classify bounded source clauses and proposed gameplay facets, preserving quotes and unknown/other. Never turn advice into requirement origin, priority, user approval or verified coverage. Negation, ambiguous alternatives, compound mechanics and unfamiliar objectives are mandatory tests.

S8 accepted: D7/D8 evidence separation is mandatory. A real stopped recording is a failure artifact, not successful delivery.

## Constraint Guardian resolutions

G1 accepted: transport pins https://openrouter.ai/api/alpha/decisions, requires official OpenRouter profile origin/path and redirect:error. Limits: 16 KiB serialized request, 16 questions, 21 options per question, 1 MiB response. Reject unsupported size before dispatch instead of truncating user intent or candidates. Brief analysis sends bounded original clauses and no unrelated source/history/media. Metadata is always untrusted data.

G2 accepted: keep all four existing Engine dispatch gates and durable reservation/settlement. Parse finite nonnegative cost and integer token usage independently from semantic decision validation, retaining valid usage on a malformed answer. Reserve a conservative 64,000 input-token allowance per decision batch at the verified configured rate, as in the retained pilot, rather than guessing token count from input bytes. Verify current endpoint metadata/context/pricing before live use. No zero/underpriced Jev configuration. Stop on changed/unknown pricing or provider contract. Unknown usage retains that full reservation. Every dispatch settles once before optional diagnostics.

G3 accepted: versioned identity covers project/revision, original brief, need/requirement, offered candidate IDs+metadata, approval revision, inspection revision and pinned profile/model/rates. No cross-project reuse. Cache only accepted advice for identical identity, never an import authorization. Verify identity/cancellation after awaited work and before committing advice or choosing a fetch. Test late responses and changed candidates, approvals and revisions.

G4 accepted: optional decision profile ID is a separate strict preset route and is never included in code fallback chains. Validate legacy settings, switching, profile removal, missing route, shared connection lookup and selected model compatibility locally before calls. Empty route retains existing behavior and adds no Jev calls. Display charges through existing phase accounting with explicit non-coding task labels.

## User Advocate resolutions

U1 accepted: keep mini-tasks internal, with ordinary understanding/finding/building phases and optional task details. Retain brief and asset approvals, add no per-classification approvals or chat clutter.

U2 accepted: relevance, imported/inspected and tested-in-game are separate evidence states. Do not display Jev confidence as native readiness. Keyframe-only media must disclose unresolved playback before building.

U3 accepted: errors identify failed phase and actionable blocker, retain selections/progress, and disclose paid retry. No generic exhaustion message without its cause, no automatic fresh run on cancellation, unknown billing or cap exhaustion.

U4 accepted: recorded workflow must use ordinary product controls and the same generated artifact. Disclose any backstage intervention or edited interval. A blocked recording explicitly lists unperformed gameplay checks and is incomplete.

## Decision log and review

Understanding locked: user explicitly clarified Jev non-coding duties. No user confirmation needed to begin already requested implementation once this skill's reviews finish.
Skeptic: completed, all eight objections accepted with resolutions S1-S8 above.
Constraint Guardian: completed, four objections accepted with resolutions G1-G4 above.
User Advocate: completed, four acceptance clarifications accepted as U1-U4 above, no objection to proceeding after recording them.
Arbiter: APPROVED. All S1-S8, G1-G4 and U1-U4 accepted. No unresolved design blocker. Current provider contract/pricing, native apply/test connectivity, playable animation and the existing budget remain live execution conditions, not evidence of success. No further brainstorming confirmation required.
