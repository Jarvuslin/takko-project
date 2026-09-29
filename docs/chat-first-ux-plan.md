# Takko chat-centered workspace plan

Implementation update, 2026-09-21: [Chat and editable game architecture](chat-architecture-implementation.md) records the shipped portion and test evidence. Durable chat, inline decisions/activity, detail drawers, editable generation contracts, history, Studio receipts and imported-clip playback are implemented. The original checklist below remains the full acceptance target. Automatic animation authoring/publishing, native end-to-end verification, setup checklist, runtime edge traces and general existing-game import are still unfinished. The user's newer direction makes the map an editable game architecture rather than only a contextual mechanics display.

Make the conversation the place where users describe, choose, review, build, preview and test. Keep Takko's existing taco identity, monochrome palette, typography, rounded controls and restrained spacing. Use the screenshots as interaction references, not a visual redesign.

Requested with concise-planning. This is an implementation plan, not a claim that the features below are implemented. Based on seven user-provided Lemonade screenshots and the current Takko source. The user reports actual animated playback inside chat. The static images show the embedded viewer and rig controls, but cannot independently prove motion or the competitor's backend behavior.

## Scope

- In: persistent conversation, inline decisions and approvals, grouped activity, change summaries, smart suggestions, screenshots and clips, interactive animation playback, Studio actions/results, history, contextual mechanics map, model/preset/budget controls, onboarding and an eventual existing-game import flow.
- Out of the first release: replacing Takko's visual design, making the graph the default work surface, paid subscriptions/credit systems, arbitrary edits to uninspected existing games, automatic publishing or pretending a browser preview verifies Studio behavior.

## Proposed experience

The existing sidebar keeps projects, Marketplace, Models and Presets. The project opens directly into chat. A compact header shows the project, Studio connection, History and an optional Map button. Source, full specifications and detailed diagnostics open in secondary drawers instead of forcing a trip through Brief, Build, Source and Studio tabs.

The composer stays visible at the bottom. It contains attachments, the active preset/model, the current spending allowance and Send/Stop. A disconnected Studio blocks only actions that require Studio. Users can still discuss the idea, answer questions and review saved previews.

Example sequence, using Takko's visual style:

1. **You:** “Make a simple fighting game.”
2. **Takko:** a short proposed direction, consequential choice buttons and explicit inferred defaults. A recommendation remains a recommendation until accepted or delegated.
3. **You:** select an option, type a custom answer or choose **Choose for me**.
4. **Takko:** a compact plan card with **Approve & build**, **Change the plan** and **View details**. Approval applies to the displayed revision and allowance.
5. **Takko:** one live activity card for this run, followed by what changed and available previews. Code paths stay inside Details.
6. **You:** “Add a punch animation.”
7. **Takko:** an inline playable animation card with rig selection and playback controls, followed by **Apply to Studio**, test results and useful next actions when supported.

All earlier turns remain readable. New replies do not replace previous choices or erase failed attempts. Long conversations use pagination or virtualization so the page remains responsive, with a **Jump to latest** affordance rather than forcing scrolling.

## Feature mapping and gaps

| Screenshot feature | Takko today, from inspected code | Planned behavior |
| --- | --- | --- |
| User/assistant conversation | `App.tsx` presents forms/tabs. Follow-ups are appended to the request string. No durable typed turn model. | Persist user messages and structured assistant cards in chronological order. |
| Inline proposal and confirmation | `GameConcept.tsx` has options, custom answers, delegation and readiness checks. | Render those as chat cards, preserving unresolved choices and revision checks. |
| Generation card and expandable Activity | Events are timestamp/message strings. Engine retains only the latest 120. | Group real operations by run with stable IDs, phases, elapsed time and terminal status. Do not call event count an action count. |
| What changed | Artifact files, task completion and review/check data exist. | Plain-language summary with changed files, instances and asset operations expandable underneath. Summaries derive from actual changes. |
| Smart suggestions | `MechanicsMap.tsx` contains generic example prompts. | Suggest a few next actions grounded in the current brief, dependencies, failures and actual mechanics. Clicking stages an editable request, without immediately spending or mutating Studio. |
| Screenshots in chat | `App.tsx` renders one current `visualEvidence` image, with user-upload provenance. Asset adapter has capture capabilities. | Keep per-turn media tied to project revision, artifact hash, source and capture time. Add actual recordings when supported. |
| Actual punch animation viewer | Animation asset kinds exist, but no browser rig/keyframe player was found in the inspected web code. Animation search is explicitly unsupported by the current adapter. | Build a real inline player with play/pause, loop, scrub, orbit, zoom and compatible R6/R15 rigs. Never substitute a static pose or generic clip for the requested animation. |
| Studio playtest status and failure details | Bridge retains operation states, checks, logs and revision-bound receipts. | Show **Apply**, **Test**, results, screenshots and recoverable errors inside the originating turn. Distinguish scripts checked, tests passed, visual capture unavailable and full gameplay unverified. |
| History and per-generation feedback | Current History shows recent project events. | Open a searchable run/message history with references to revisions and costs. Feedback stays attached to the relevant run. Do not imply full rollback until safe restore exists. |
| Model selector, attachments and balance | Models, presets, catalog and composer attachment/budget pieces already exist. | Reuse compact controls in the pinned composer. Show currency allowance and actual/estimated spend clearly. Keep saved libraries in the sidebar. |
| Mechanics graph and Agent/Explore | `MechanicsMap.tsx` has declared dependencies, selection, pan/zoom and mode controls, but is not mounted in the active `App.tsx`. | Reconnect it as an optional drawer/split view. Selecting a node links to the relevant chat turns. Explore proposes changes without applying them. |
| Quests, Import Game and project naming | Buttons are visible in the reference. Their hidden flows are not supplied. Current adapter owns a generated namespace, not arbitrary games. | Use a dismissible setup checklist, normal project naming, and a staged import flow. Existing-game editing needs an explicit inventory/ownership/backup design before it can be advertised. |

## Ordered implementation plan

1. [ ] **Add durable conversation records** in `schema.ts`, `store.ts` and the server API. Use stable message/run/card IDs, timestamps, revision and artifact references, cursor pagination and idempotent submission. Keep bounded generation context separate from the full transcript. Migrate old projects to an honest imported-state card without inventing missing dialogue. Stop appending every new turn to a single 12,000-character request.
2. [ ] **Replace the primary project form with a chat workspace** in `App.tsx`, extracting a timeline, message renderer and pinned composer. Reuse `grok-theme.css` tokens and existing controls. Move technical panels into drawers, retain drafts and keyboard focus, and preserve readable desktop/mobile layouts and normal scroll behavior.
3. [ ] **Move decisions, plans and approvals into chat cards.** Reuse `GameConcept.tsx`, but distinguish inferred recommendations, unresolved consequential choices, explicit answers and delegated choices. Carry accepted decisions into planning without silently reducing the requested scope. Wire revision-bound approval, cancel and update actions to the real engine. Stale cards stay readable but cannot launch work against a changed project.
4. [ ] **Add structured run activity and summaries.** Connect engine phases, asset operations and bridge receipts to one activity card per run. Record real action identities/counts, cost, cancellation and failures. Refresh/reconnect must not dispatch duplicate work or reinterpret an interrupted operation as success. Preserve the underlying failure evidence.
5. [ ] **Add contextual suggestions, history and the optional mechanics view.** Reuse verified task dependencies and link nodes to turns. Suggest the next useful checks or improvements, avoid repeating completed requests, and stage edits in the composer. Add per-run feedback and searchable history. Ship the setup checklist here without turning it into a mandatory tutorial.
6. [ ] **Add persistent inline media and the animation player.** Introduce a validated, bounded rig/clip representation with provenance, duration, joint tracks and supported interpolation. Use approved source animation data or actual Studio captures. Render the clip locally, with rig compatibility checks and no false R6/R15 toggle when only one rig is supported. Lazy-load visible players and show an honest unsupported state if clip data is inaccessible. Browser motion preview, generated/imported animation and Studio playback remain distinct statuses. This is a real backend/media milestone, not just a card component.
7. [ ] **Bring Studio apply, test, capture and recovery into the conversation.** Reuse bridge operations and receipts with visible connection guidance. Queue only explicit actions, reconcile uncertain delivery and bind results to the tested artifact. Preserve the last known result when disconnected. Provide repair proposals from concrete evidence. Recheck the installed plugin manifest/capabilities before implementation, and clean up any authorized native test session afterward.
8. [ ] **Implement existing-game import as its own milestone.** Start with capability discovery and read-only inventory or a user-selected copy. Define editable ownership, conflict detection, snapshots and rollback limits before authorizing mutations. Present scope and unsupported content in chat. Do not relabel the current namespace-only generator as a general existing-game editor.
9. [ ] **Verify each milestone and the complete user journey.** Add unit/API coverage for persistence, revision gates, idempotency, cost and evidence; browser coverage for messages, approvals, drafts, drawer focus, responsive layout and connection recovery; and animation fixtures with observable pose changes over time. Run the complete `npm run check` after implementations. Separately test supported animation playback and apply/test/capture in native Studio on an approved test place. Record a real chat-to-Studio demo, including failures, rather than a scripted success mock.

## Delivery order and acceptance

**First usable release: steps 1–4.** A beginner can describe, clarify, review and start an approved build without leaving chat. Refreshing preserves prior messages and failed attempts. Takko's appearance stays consistent. This first release must address the recommendation-versus-accepted-choice gap found in the live trial, not hide it behind a nicer transcript.

**Rich interaction release: steps 5–7.** Suggestions, history, graph context, actual inline animation playback and Studio receipts live in the conversation. Animation acceptance requires visible motion from the selected clip, accurate rig labels and a separate native playback result. Mocked tests are not evidence of Roblox playback.

**Existing-game release: step 8.** Import/edit support ships only with a defined ownership and recovery model. It is explicitly included in the longer-term scope, not represented by a decorative Import button.

Every release includes the checks in step 9. The final target is the same chat loop throughout: **ask → decide → act → inspect → refine**. “All in chat” means users can complete the workflow there, not that model libraries, source code and every diagnostic must be expanded into the transcript.

## Evidence and this planning session

Preserve the seven supplied images under `research/evidence/lemonade-chat-user-20260921/`, with original filenames, hashes and an index. Treat screenshots as observed UI and animation playback as the user's report. The visible failed playtest is also part of the reference, so do not copy a success-only interpretation.

Source inspection included `App.tsx`, `GameConcept.tsx`, `MechanicsMap.tsx`, `grok-theme.css`, `schema.ts`, `store.ts`, `engine.ts`, `bridge.ts` and relevant asset-adapter capability declarations. Older research claiming the authenticated editor was unseen is historical; these user-provided screenshots add new visual evidence without granting access to the private backend.

Planning only. No implementation, inference, credential access, server restart or Studio session. No tests were run. All `npm run check` stages were skipped because product code was unchanged. The previous live trial remains stopped, and its result is not repaired by this plan.
