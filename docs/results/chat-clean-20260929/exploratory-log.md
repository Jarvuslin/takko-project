# Desktop exploration and journey failures

All providers and Studio actions are mocked. No paid calls or user projects.

## Pass 1: harness launch

- Electron could not launch because inherited ELECTRON_RUN_AS_NODE was present with an empty value. Removed the variable from the child environment. Two journey setup failures. No UI reached.
- Focused Vitest run: worker crashed with Windows exit 3221226505. Rerun: 43 passed, one obsolete defer-assets assertion failed. Removed that deleted-endpoint assertion.

## Pass 2: retries and unavailable sound

- Journey b passed. Stop/Continue exposed a retained uncertain charge gate that made Continue unusable. Removed that gate. The conservative charge stays in the ledger and the same cumulative cap applies.

## Pass 3: first combined seven journeys

- Three passed, four failed. Incorrect question, sound-button and queued-message locators were corrected in the harness.
- Opening the recorded failed project re-inspected picks and changed the saved retry identity. Initialization now preserves a retryable checkpoint.
- Serialization reordered derived discovery properties and invalidated a coordination hash. Canonical hashes now bind proposal needs, independent of derived property order.

## Pass 4: scoped follow-ups

- Sound selection and send-while-working passed. The queued environment edit fixture incorrectly produced mechanics changes. Fixed the mocked producer to honor its requested section.
- The next explicit build needed a scoped-plan response from the mock. Added that actual response contract. No production fallback or acceptance rule was loosened.

## Pass 5: individual reruns

- All seven journeys passed individually. Added immediate Stopping feedback and structured selected-sound evidence in builder context.

## Pass 6: complete Electron pass

- Seven journeys plus one exploratory journey passed together, 8/8.
- Exploratory actions: skip in an unusual order, change Marketplace type, dismiss browsing, type a multiline message, reload saved skips, replace a pick, scroll to Latest, resize the desktop to 1280x800 and 1920x1080.
- Zero new stuck or confusing moments in that complete pass. No alert, horizontal overflow or composer overlap. Screenshots are generated in test-artifacts/chat-clean-electron.

## Independent review

- Conflicting migrated picks could retain approval. Migration now invalidates approval and leaves old checkpoint hashes invalid while preserving recorded worker output.
- A message queued during a proposal edit could remain held at the previous revision. The successful edit rebases its following queued messages before draining them.
- Approval preferred a keep option even when another option was marked Recommended. It now uses the displayed recommendation.
- Focused regression verification: 19 passed across chat-flow-redesign and chat-journey-engine. The queued-edit regression failed before its fix. The first conflict fixture mutation did not map to a proposal need, so it was corrected to use the recorded need's selected asset identity.

## Legacy browser-suite adaptation

- The old suite tried to click deleted brief/concept approval controls. Updated saved-project fixtures and request assertions for conversation/proposal UI. Retired assertions for deleted actions are listed separately.
- Initial adapted-fixture type checks rejected widened JSON types. Parsed the preserved draft through proposalDraftSchema. Added Node's required JSON import attribute.
- Found and removed two residual AssetCard blockers for unanswered platform/clarification questions. The server adopts displayed proposal defaults on approval.

## Broad check and final audit

- First full check attempt: build/typecheck, 1,782 unit tests in 136 files, six Luau scenarios, 16 plugin groups, six guards, CSS (274 warnings, zero errors), 14 desktop tests and production smoke passed. Browser stage: 98 passed, nine failed. Electron stage was not reached.
- One browser failure exposed duplicated Applied user turns. A regression reproduced two turns for one queued message. The internal batch now retains the original receipt only. Focused rerun: 44 passed across chat-flow-redesign, chat-recovery and conversation-planning.
- Other failures were old behavior assertions: composer repopulation, restoring accepted messages into the composer, required question approval, deleted concept dialog, and a fixture race with automatic asset initialization. Updated the tests to the intended flow. Long question coverage now uses the inline proposal contract.
- Final source audit removed the last legacy Generate game button and approve-the-brief hint in Build details. Busy mutation errors now explicitly offer chat queueing.
- Electron visible-state expectations now default to one second. Long-running worker/build completion uses explicit deadlines. A renderer monitor retains visible alerts without an enabled recovery control in their enclosing card.
- Reviewer rechecked c3380cc..f29fd1f and found no new actionable issue. No tests or source edits were performed by the reviewer.

## Final harness checks

- Focused browser rerun: eight passed, one long-question locator failed. The textarea retained its content, but an exact implicit-label locator changed after filling. Switched to its accessible textbox role. The long-question test then passed.
- Tightening every Electron expectation to one second first caused eight setup failures. Project loading was incorrectly treated as click feedback. Setup/reload now wait for readiness separately. Click feedback still defaults to one second.
- Next Electron pass: six passed, two failed. New-project planning completion needed a separate deadline after the immediate conversation response. The alert monitor also counted temporarily disabled sound controls during initialization. It now records a missing recovery control only if sustained for one second.
