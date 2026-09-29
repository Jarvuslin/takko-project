# Conversation-first planning correction

Status: reviewed and accepted by the arbiter. This document records the requested workflow, not implemented behavior.

## Understanding

The user's latest instruction defines the intended flow: prompting, brainstorming and planning should produce one game proposal covering mechanics, theme, environment/place and real asset suggestions. Agents recommend assets by default, with manual replacement available. The user approves the proposal or asks for changes. Changes must patch affected content and preserve everything else. Internal model stages should not become repeated approval chores or discard saved work.

Existing authorization covers diagnosis and correction. The current message confirms this product direction. No new paid trial or budget increase is authorized. Assume the existing local single-user architecture, durable per-project state, existing monetary limits and a leased Studio connection. No promise of native success without actual application and gameplay evidence.

## Observed causes

Earlier failures were separate: output/contract failures, a120-second request deadline, asset selection blockers, phantom component integration, and the latest Jev score-legend parser defect. The latter was fixed and replay-tested, not live rerun. Marketplace connectivity does not establish the separate apply/test plugin connection.

The current follow-up route invokes Engine.submitChange, which calls revise. revise clears concept, specification, asset discovery, artifact, completed build tasks and coordination state. The UI then starts concept generation or planning. Thus even a small requested change is currently a broad invalidation and regeneration, not a document patch.

Planning also has separate concept, brief, asset and implementation-plan approval gates. The concept contract mixes user design decisions with detailed playtest validation. This allows engineering readiness to prevent ordinary design discussion.

## Proposed decisions

D1. One persistent reviewable proposal contains explicit sections for mechanics, theme, environment/place and assets. Show assumptions and unresolved dependencies next to the relevant section. The proposal is not a runtime verification report.

D2. Keep generation decomposition internal. The coordinator owns the proposal and gives bounded analysis/asset tasks to Jev where suitable. Search, retrieval and preview remain host operations. Code-capable workers own implementation, adaptation and source review. Jev cannot certify functionality or safety.

D3. Agent asset choices are editable recommendations from actual returned IDs, selected by default in the proposal. Previewing or replacing them is optional user control, not a mandatory per-asset approval chore. A user override is pinned and never silently replaced. Preserve provenance, inspection and playback status separately. An unavailable asset keeps its slot unresolved without erasing or blocking discussion of the rest of the game.

D4. User-visible loop is draft proposal, targeted revisions, then Approve & build. That approval binds the exact proposal and current chosen asset references. Any changed section or replacement invalidates approval for the changed version. Detailed task/code planning is internal and cannot expand the approved scope. Required asset availability, actual spending authorization and native delivery readiness remain real execution blockers, displayed specifically.

D5. Proposal edits are typed patches against a base revision/hash and stable section/item IDs. Reject stale patches, unknown paths and unrelated replacements. Preserve untouched section and selection content byte-for-byte. Retain historical receipts with their original revisions. Reuse evidence only when the checked content and dependencies are identical, never by rewriting an old receipt's revision. Show a concise change summary. No whole-document generation for a localized request. Commit a validated revision atomically and keep the previous proposal visible on failure or cancellation.

D6. Generated code changes require scoped file edits and dependency invalidation, with previous artifacts retained until a validated replacement is ready. Changed contracts invalidate their transitive consumers, including rig integration for animation changes and lighting/material/UI dependencies where relevant to a theme change. Unknown dependency coverage must be reported before broad regeneration. Never re-export stale code as a successful new revision. Merely preserving an old artifact without a working incremental planner is not sufficient. Preservation must survive revise(), start() and coordinator state initialization, not only the message endpoint.

D7. Optional advisory failures leave existing proposal content intact. Bounded provider correction and recovery remain within the authorized attempt/budget policy. The authorized run's cumulative charges, reservations and unknown-cost holds survive edits, failed edits and cancellation. A changed brief hash must not silently reset chargeStart or reopen the spending allowance. Cancellation, exhausted budget, unknown billing, unresolved native mutation or unavailable required content must not be hidden. No unlimited retries or fabricated success.

D8. Tests must prove that changing theme preserves mechanics and selected animation, replacing one already-approved asset preserves other choices, stale edits cannot overwrite later ones, approval binds exact content, and generated files outside the affected dependency set remain unchanged. Exercise the complete message/API, planning, coordinator and build path. Verify transitive consumers are invalidated and unchanged evidence is reused without relabeling old verification. Single approval must bind shown content and legitimate inspection/animation-selection results without synthesizing approvals for unchecked content. Failed, cancelled and malformed edits retain the last complete proposal. Repeated edits must preserve the original spending boundary. Full npm run check and separate native evidence remain required for implementation claims.

## Constraint details

C1. Mutating edits, selection replacement and approval are rejected while a build, import or native apply is active. Keep the user's requested change as an unsent draft with an explanation to wait or cancel, not as a silently replayed job. Failed edits also retain the request and previous proposal. Cancellation must settle the running work and receipts before an edit can proceed. Every late asynchronous completion checks its original operation and content identities before committing. Native operations with unknown outcomes remain blocked until reconciled. Test both build and apply races.

C2. Selected references bind available asset version, captured content identity and exact embedded animation selection. An asset ID alone is insufficient. Changed or unverifiable content needs inspection again and cannot inherit a prior content or playback result.

C3. Financial receipts and conservative reservations commit independently of proposal acceptance. Rejected, cancelled, stale or interrupted proposals retain every incurred cost or unknown-cost hold. Test interruption after dispatch and before proposal commit. Proposal rollback never means financial rollback.

C4. Legacy projects retain their original artifacts, approvals and evidence. Migration may assign new proposal section IDs but cannot invent missing historical dependency coverage or relabel old verification. If an existing generated artifact lacks the dependency information needed for a surgical change, explicitly report that limitation. Do not silently fall back to whole-file regeneration. Include a saved legacy-project fixture in complete-path verification.

U1. Distinguish saved proposal, approved proposal, running implementation and native delivery. An approval blocked from execution must name the missing prerequisite and must not display a running build. Required asset or Studio blockers do not prevent continued design discussion. The approval button's label and result must match the action that can actually run.

## Alternatives considered

Recommended: persistent structured proposal with revision-bound patches and dependency-aware generation. It directly supports the requested behavior but requires coordinated changes to state, routing, approval and UI.

Rejected: change button labels while keeping revise's broad reset. It preserves the defect.

Rejected: ignore validation or automatically approve every fallback. It hides missing assets, incorrect behavior and spending failures.

## Open implementation boundary

The persistent proposal and generated-code edit contract must be reviewed together. Do not claim surgical editing merely because the old version exists in history. This is a workflow correction beyond the already completed optional Jev route.

## Decision log

Skeptic S1 accepted: broad resets exist in revise, start and coordinator initialization. D6/D8 require complete-path preservation tests.

Skeptic S2 accepted: changed brief hashes can reset chargeStart. D7/D8 preserve cumulative authorized spending across edits.

Skeptic S3 accepted: approved asset replacement is currently rejected or broadly invalidates state, including an aliasing bug when attempting to restore concept. D8 explicitly tests replacement after approval.

Skeptic S4 accepted: one button must not bypass legitimate content/playback/reference checks. D4/D8 bind shown content and inspected selections, with real blockers preserved.

Skeptic S5 accepted: revision-bound receipts cannot simply be copied and treated as current. D5 separates content preservation, original evidence and dependency-based reuse.

Skeptic S6 accepted: preservation alone does not prove invalidation correctness. D6/D8 require transitive consumer invalidation and truthful unknown-dependency handling.

Skeptic S7 accepted: concept start clears visible content before provider success. D5/D8 require atomic revision and previous-proposal retention.

Constraint C1 accepted: concurrency policy and late-write rejection are now explicit, with build/apply race tests.

Constraint C2 accepted: content identity and embedded animation, not ID alone, bind approval and evidence reuse.

Constraint C3 accepted: proposal transactions and financial settlement are independent, with crash/cancellation verification.

Constraint C4 accepted: legacy state must be preserved without invented dependency evidence or hidden regeneration.

User advocate U1 accepted: explicit saved/approved/running states and precise blockers are required, without blocking discussion.

User advocate U2 accepted: D3 now explicitly selects the agents' recommendations by default and makes manual preview/replacement optional. Proposal approval binds the displayed choices.

User advocate U3 accepted: C1 retains unsent changes and failed requests, with no silent later replay against a different revision.

Arbiter: APPROVED. All recorded objections are accepted and resolved by D3-D8, C1-C4 and U1. None are rejected and no design blockers remain. The understanding is confirmed and sequential reviews are complete. This disposition approves the design only. Implementation, complete-path regression tests, full npm run check and separate native verification remain outstanding.
