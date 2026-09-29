# Part 4: rebuild the chat

Implement part 4 only. Parts 1–3 have separate commits: `ecff8c6` (duplicate needs and planning retry), `464c330` (conversational assets and automatic source review), `2299f39` (rig decisions and delivery). Later regression fixes are described in `docs/chat-parts-1-3-20260929.md`. Read that report, AGENTS.md, README.md, and research/notes/continuation.md first.

No paid calls. Do not retry or generate the user's project. Do not restart, replace, or rebuild the running desktop release. Treat `.forge/fresh-desktop-20260929/projects/07a88f8e-1e51-4c81-980c-e5fb0731faa0.json` as read-only. Regression copies and its actual final worker response live in `tests/fixtures/chat-recovery/`.

Open these local prototypes in a browser and click through them:

- `docs/design/chat-flow-mockup.html`: every Jump to state, attaching the missing sound and pressing Enter, “Use a straw dummy instead”, typing during a build, Stop, retry and end cards.
- `docs/design/asset-picking-mockup.html`: Marketplace layout and result cards.

Match their desktop layout, states, wording and behavior. One conversation, with assets, answers and changes all sent as messages with the conversation context. Keep the existing parts 1–3 behavior and tests working.

## Required changes

- Status strip under the header, always visible. One state: Ready, Working, Needs you, Checking assets, Building, Ready to test, Failed, Stopped. Show spend. Building shows the current step, step N of M, spend, elapsed time, a thin progress bar and Stop.
- Header shows project name and active preset pill, for example “My first preset · Sonnet 5 · $8 cap”. Clicking the pill opens Models.
- Working shows a short live checklist of actual work instead of a blank wait.
- Questions appear inline, one at a time. “Question N of M”, two or three options, one Recommended with a reason, Other with a text box, Back and Next. Typed answers work. Answered questions collapse into receipts such as “✓ Rig: R6”. Never ask again for answered or attached information. Replace the temporary standalone rig controls with this shared question flow.
- Plan uses three to five plain bullets, then the needs list and “Approve & build · about $X”. Put its disabled reason immediately below it.
- Composer stays editable. During builds, messages are durably tagged “Queued · after this step”, applied after the current step finishes, then tagged “Applied” with a one-line reply. Do not merely queue in React state. Handle cancellation, restart recovery, context changes, and budget constraints without automatic paid retries.
- End cards: Ready to test with export and a short Studio test checklist. Failed with the failed step, what is kept, “Retry from this step” and cost, and collapsed technical details. Stopped with what is kept and Continue with cost. Extend the existing planning retry implementation carefully for other worker stages.
- Only the newest card is actionable. Auto-scroll to what needs the user. Composer sits below the messages and never covers the last message. Clamp long names with ellipsis and a tooltip.
- Full conversation context reaches the planner so “make it louder” and “not that one” refer to the current conversation.

## Verification and delivery

- Desktop browser tests for every prototype state, Enter-to-attach, natural-language changes, queued follow-up becoming Applied, both Stop controls, all three end cards, and the composer never obscuring the final message.
- Side-by-side real-app/prototype screenshots for each state in `test-artifacts/`, listed in the report. Existing parts 1–3 screenshots cover only asset and rig controls, not full chat parity.
- Replay the saved project offline: exactly three detected needs, no duplicate-need error, ordinary dummy sources not blocked, failed-worker retry with cost and preserved outputs.
- Focused tests while working, then one full `npm run check`. Record actual counts and retained failures. No native Studio claims from mocks.
- Build into a NEW release folder with its own Start shortcut. Preserve all existing releases and live processes. Do not start a generation or retry. State the new path and the historical retry estimate separately from a guaranteed quote.
- Write a short docs report, rewrite continuation.md under about 5 KB, and commit. Do not push.

The original pasted prompt had a truncated sentence at the end of the queued-message bullet. The end-card requirements above follow its visible prototype and “Done means” criteria.
