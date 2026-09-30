# Chat and asset cleanup

Takko now saves each asset pick on its proposal need, accepts chat edits while work is running, and uses one Approve & build action. Seven real Electron journeys use mocked provider and Studio boundaries. This does not establish working gameplay in Roblox Studio.

## Root causes and changes

- Proposal needs, discovery choices, approvals, attachments and composer state duplicated selection identity. Canonical picks now own asset, clip or contained sound selection and validation. Discovery choices and approval are derived and omitted from canonical saved JSON.
- Hidden request equality and brief/concept gates prevented messages and builds. The old concept UI, brief editor, approval endpoints and separate build controls were deleted. Unanswered proposal choices use their displayed recommendations.
- Saved picks repopulated the composer. Composer attachments now represent only new message input. Messages preserve saved picks and accept additions.
- Busy and revision checks rejected messages or stranded accepted edits. Messages receive durable receipts and queue through checkpoints. Stop retains work. Successful edits rebase only their own following queue.
- Audio needs described selecting a contained sound but offered no picker. Captured Sound paths and content IDs now appear as choices and reach builder context. A missing preview is a visible limitation.
- The picking selector was disabled and the search request ignored its value. The selected search type now reaches the provider without rewriting the need.
- Complete source evidence could exceed the small decision model's input limit. That request now goes to the configured coding reviewer with the complete evidence and strict response validation.
- Migration skipped projects with a spec and hashes included mutable derived discovery state. Canonical migration collapses equivalent picks, keeps real worker checkpoints when input identity matches, and invalidates approval on conflicts. Retry initialization does not re-inspect and invalidate valid saved work.
- Estimate display required task history. It now uses historical builder averages when available, labelled historical. An empty history leaves the cap visible and does not block approval.

Before and after state diagrams and saved-state mapping: [flow-map](flow-map.md), [flow-redesign](flow-redesign.md).

## Removal and gates

ConflictError construction lines fell from **124 to 101**, using the same source-line count. This is not a count of independent UI gates. Runtime validation, billing caps, concurrent mutation checks and native-effect reconciliation remain. [Baseline inventory](flow-gate-inventory.md) and [remaining inventory](flow-gate-inventory-after.md) contain source contexts.

Deleted GameConcept.tsx, the hidden brief/concept controls, discovery saveChoices and approve-brief/approve-assets/defer-assets/reopen-assets endpoints, composer request-equality guards and attachment repopulation, duplicate persisted approval state, and discovery approval checks for skipped needs. Legacy read/migration shapes remain for existing files and adapters. They are not another chat approval step.

Final source line totals and full verification counts are recorded below after the final run.

## Desktop journeys and exploration

The suite launches the actual Electron application with an isolated temporary user-data directory. The renderer calls a real local API, engine and store. Only provider, Marketplace and native Studio boundaries are mocked. The Studio connection gate is disabled for those tests.

1. New project, three Marketplace attachments, rig choice, build, queued follow-up Applied, second explicit build ready to test.
2. Two selected attachments, no relevant sound from Choose for me, broader search and Skip available, chat skip, build ready to test.
3. Select a captured Sound inside a Model with preview unavailable, build ready to test, exact sound identity in builder context.
4. Straw dummy chat edit changes the need and permits a replacement.
5. Stop during building, immediate Stopping feedback, explicit Continue, ready to test.
6. Load a copy of recorded failed 07a88f8e, retry the missing area, retain completed worker output exactly.
7. Send during a worker, receive Queued, retain the message, then Applied.

The exploratory journey tries odd-order skips and selection, type changes, interrupted browsing, multiline input, reload and two desktop sizes. It checks composer separation and horizontal overflow. The final pass has zero new entries. [All exploration and failure records](results/chat-clean-20260929/exploratory-log.md) are retained. Final screenshots and raw test output are generated under test-artifacts and are gitignored.

Visible feedback assertions default to one second in Electron. Long-running build completion and worker polling use explicit longer deadlines. A renderer monitor records visible alerts that lack an enabled recovery control in their containing card. These are the exercised journeys, not exhaustive proof of every possible network or native error.

## Review and limits

An independent reviewer used a separate worktree. Three findings were fixed: conflicting migration approval, queued edit revision rebasing, and choosing keep over the displayed recommendation. The follow-up found no new actionable regression. [Review](results/chat-clean-20260929/review.md).

Skills used: choose-skill, code-showcase-systematic-debugging, test-driven-development, code-review-excellence and webapp-testing, adapted to JavaScript Playwright/Electron.

No native Studio session occurred. Mock screenshots, synthetic audio and passing Luau checks do not prove spawning, animation, sound permissions, playback or gameplay. Live Jev judgment and external providers were not exercised. No existing Takko application was restarted. No real project, credentials or paused goal was changed. No plugin installation was changed.

Cost: **$0 paid inference**. Mock usage receipts are synthetic. No provider balance query.
