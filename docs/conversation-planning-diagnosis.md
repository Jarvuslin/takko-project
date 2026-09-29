# Why planning keeps stopping

2026-09-23. Takko does not yet provide the persistent, surgically editable proposal the user described. This is a source diagnosis and reviewed design, not an implementation or an end-to-end game pass.

## Observed behavior

Several different failures have been presented as a stalled build. The earlier request deadline was 120 seconds, shorter than the observed 172-second combat planning response. A later asset adapter offered unrelated approved references to optional searches. A subsequent worker claimed an empty placeholder Model was an integrated Marketplace dummy. The most recent Jev trial stopped before building because our parser rejected a valid score legend. These failures and their subsequent fixes remain recorded separately in [build recovery](fighting-build-recovery.md) and [Jev implementation](jev-noncoding-workers-implementation.md). They do not establish that a complete generated game now works.

The larger workflow defect is observable directly in current source:

- `src/web/App.tsx` submits a chat follow-up through the messages endpoint, then starts concept or plan generation again.
- `src/generation/engine.ts` submitChange calls revise. revise clears concept, specification, asset discovery, generated artifact, completed build tasks and coordination state.
- Engine.start clears artifacts and completed tasks for planning. Concept start also clears the visible concept before a replacement response succeeds.
- `src/generation/coordinator.ts` stateFor discards planning areas and worker state when the whole input hash or revision changes.
- `src/marketplace/discovery-routes.ts` rejects discovery replacement after approval and uses the same broad revision path when approving references. Its attempted concept restoration reads the same mutated object after revise cleared the concept.

A small requested change therefore invalidates much more than the changed content. A failed replacement can leave the current proposal missing even though history still contains old snapshots. Keeping history is not surgical editing.

The concept contract also mixes user design decisions with detailed playtest-outcome validation. Separate concept, brief, asset and implementation-plan approval gates expose internal stages as repeated user decisions. Some gates protect real content and execution boundaries, but they should not prevent discussing or revising the rest of the proposal.

There is a separate accounting constraint: a changed brief hash currently starts a new generation allowance using a new chargeStart. The proposed persistent edit cycle must keep the original authorized spending boundary unless the user explicitly changes it. Project-wide accounting does not substitute for that narrower authorization.

## Intended correction

The [reviewed design](superpowers/specs/2026-09-23-conversation-planning-flow.md) defines one persistent proposal covering mechanics, theme, environment/place and real asset recommendations. Agents suggest assets, while manual replacements stay pinned. The user requests a targeted change or presses Approve & build. Implementation planning stays internal and cannot silently expand approved scope.

Edits use revision-bound patches with stable section identities. Changes commit only after validation, while the previous complete proposal remains available on failure. Generated-source changes invalidate the actual dependent tasks and retain unrelated files. Historical verification keeps its original identity. It cannot be relabeled as evidence for changed content.

Required missing assets, uncertain billing, cancellation and unresolved native operations remain specific blockers. An optional ranking or display failure does not destroy the proposal. Studio apply/test connectivity is distinct from Marketplace access and should block native delivery when absent, not design discussion.

## Verification and limits

This turn inspected source and prior recorded failure evidence. It did not run a new model trial, reproduce the complete flow at runtime, edit product code, run automated tests or enter Studio. Test count this turn: 0. Every npm run check stage was skipped because this turn produced diagnosis and design documents only. Previous green suites remain evidence for their previous changes, not this unimplemented workflow.

The running user app was checked at PID21316 with service PID33316 on port57226. Its executable is the earlier takko-fighting-recovery-20260923-ready bundle, not the newer takko-jev-noncoding-20260923-final bundle. It was not restarted or replaced. Neither bundle implements the proposed conversation-first workflow.

No paid inference this turn. New cost and reservations: $0. Existing evaluation accounting remains $3.192232 against the original $4.40 cap, leaving $1.207768. Last recorded provider balance remains $2.062219352 at 2026-09-23T21:05:50.252Z, not newly refreshed. The failed trial and recordings remain preserved. No native gameplay or completed workflow recording is claimed.
