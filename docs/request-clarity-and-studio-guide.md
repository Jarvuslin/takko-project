# Clear requests and a Studio guide

2026-09-20. Takko should settle consequential ambiguity before generating a full plan. Clicky's public code offers useful screen-aware teaching patterns, but the original app and Windows port inspected here do not execute Studio actions or verify their completion. Recommend a small request-clarification stage and a Studio assistant with direct actions plus contextual guidance.

This is a source review and implementation design. No product code, installed plugin or running server was changed. No paid inference or Studio operations occurred. Cost $0.

## Follow-up: first-time creators

The user subsequently clarified that enabling people with no technical or Studio experience is Takko's selling point. [Comparative workflow research](novice-creator-workflow-research.md) expands this proposal with concrete alternatives and a describe, compare, play and refine flow. Keep consequential questions before dependent expensive work, but do not try to resolve every preference through a questionnaire. Some intentions emerge only after seeing or trying an example. This follow-up is also a proposal, not an implemented feature.

## The current gap

The current planner already has several useful controls. It receives exact user sources and saved answers with their question context, distinguishes user requirements from inferences, asks only consequential unresolved questions, and includes acceptance criteria. Approval is bound to a project revision. These are active behaviors in `src/generation/game-context.ts`, `requirements.ts`, `engine.ts` and `validation.ts`.

The problem is when clarification happens and what the program can enforce:

| Observed implementation | Consequence |
| --- | --- |
| `engine.ts:1332` runs optional reference research before the planner. The planner returns questions together with the complete specification. | Broad research and planning can happen before the intended game loop is settled. |
| `schema.ts:131` requires a summary, visual direction, requirements and at least one implementation task even when questions remain. | The planner must produce implementation detail while it is still asking what the user wants. |
| `engine.ts:1374` contains instructions to clarify the core loop and avoid incidental questions. Question objects contain only ID, prompt and options. | There is no explicit record of what decision is unresolved, why it matters, or which expensive steps depend on it. |
| `engine.ts:818` blocks approval when a returned question has no answer. | This catches unanswered questions the planner emitted. It cannot catch an important question the model omitted. |
| `App.tsx:946` presents clarification inputs and Update & replan. `engine.ts:770` clears the previous specification and downstream state on revision. | Answers lead back through full planning. Reusing unaffected work needs explicit dependency tracking, not merely removing invalidation. |
| `validation.ts:38` checks references, task ownership and other structural constraints. | A coherent, well-formed plan can still misunderstand the intended experience. |

No token savings were measured in this review. These observations identify avoidable work, not a proven savings percentage. Clear intent also does not solve asset availability, weak code generation, aesthetic judgment or runtime correctness.

## Proposed interaction

Keep the home screen as a simple composer. After a vague request, show one compact decision card in the conversation. Ask one consequential question at a time, or batch up to three independent choices when that is faster. Always allow a typed answer. Use ordinary gameplay language rather than architecture questions.

For example, user: **Make a pet game.**

First card: **What should players mainly do?**

- Collect pets that help gather resources.
- Care for pets and decorate their home.
- Battle using a team of pets.

These are visibly suggested interpretations. None becomes a user requirement until selected. If the user already described feeding, grooming and decorating, skip this card. If the user names a reference that is not understood, retrieve enough information to disambiguate it before proposing a direction.

After the consequential choices are resolved, show a short editable brief:

> Players adopt a pet, feed and groom it, and unlock decorations by caring for it. Cozy rounded art. Touch and keyboard controls. The proposed first build includes one complete care loop and one room. Trading, battles and paid purchases are outside this proposed version.

Show **Your choices**, **Suggested defaults** and **Needs checking** separately. An example like the one-room scope is a proposal, not permission to reduce an explicitly requested full game. Use **Build this** as the existing approval action once prerequisites are satisfied. Keep the full implementation plan collapsed under Details. If the user already gave enough information, go straight to this card.

Offer **Choose for me** for design preferences. Record that delegation and display the resulting assumptions without another questionnaire. Do not use it to guess which open Studio place to edit, invent asset rights, increase a spending limit or silently substitute missing behavior.

Other useful interpretations:

| Request | Consequential clarification or evidence |
| --- | --- |
| Make it like this game | Identify the reference and the mechanics the user means. Do not infer the whole game from its title. |
| Make it more satisfying | Ask whether the concern is motion, sound, responsiveness or progression. Use the selected object or a short example where available. |
| Add a shop | Distinguish an in-game purchase UI, an explorable building and actual paid purchases. |
| Fix this | Bind “this” to a selected object, error or screenshot and capture expected versus observed behavior. |
| Make an ASMR bubble game, no sound | Preserve the sound exclusion. Clarify the physical interaction if needed. Do not add rewards or upgrades by genre habit. |

## Implementation contract

Add a request-interpretation record before `Spec`. The first call returns either `needs_choice` or `ready`. It must not emit task DAGs, Luau, full scene layouts or broad asset shopping lists while a blocking interpretation is unresolved.

Store:

- The original request, exact answers and explicit delegations, each with a stable source ID.
- The intended player action, visible response and success or progression condition where applicable. A narrow bug fix instead records target, expected behavior and observed failure.
- Explicit inclusions, exclusions and proposed defaults. Each derived claim points to a user source or is labeled inferred.
- Unresolved decisions with their alternatives, the affected feature and the reason guessing would change the outcome.
- Capability needs, missing evidence and acceptance examples. A model's confidence is not evidence of an available API or asset.
- A revision/hash binding the accepted interpretation to the request and relevant project context.

Use three decision treatments. **Ask** when plausible interpretations change the core interaction, target or substantial work. **Suggest a default** for cheap reversible details, such as a starting color palette. **Check evidence** for facts like whether a supplied asset contains a functioning controller. Do not ask users to answer questions Takko can inspect.

Before dispatching expensive work, deterministic checks enforce complete records, valid source references, current revision, known target identity, explicit exclusions and budget availability. They reject unresolved declared blockers. They do not claim to detect every possible semantic misunderstanding. The editable brief and later acceptance checks remain necessary.

Once intent is settled, run focused reference/asset discovery and generate the technical plan. If discovery reveals a missing required capability, return a specific choice to the same conversation: find another asset, change the requirement, or stop. A native-delivery limitation is not permission to replace a requested interactive asset with a decorative primitive.

Build a complete representative interaction first where compatible with the accepted scope, evaluate it, then expand the approved plan. This is a validation order, not automatic scope reduction. Test concrete behavior such as touching a checkpoint, dying and respawning there. A successful compile, a polished summary or an extra decorative object does not satisfy that behavior.

## Token and spending controls

Start with one bounded interpretation call using the configured planning model. Keep raw user evidence available, but do not send the entire codebase or unrelated asset packets to decide which question matters. Give the call its own output limit and reservation inside the existing generation budget. Avoid an extra classifier call when the structured interpretation already supplies the decision.

Persist the brief and question IDs so answered questions are not repeated. A changed requirement invalidates dependent planning and execution evidence. Cache only inputs with matching request/context/schema/model identities. Existing `revise()` correctly invalidates downstream state conservatively. Selective reuse must be implemented with dependency hashes and regression tests before weakening that behavior.

Builders should receive the accepted brief, applicable requirements, required interfaces and relevant evidence. Existing task ownership and source-backed context remain useful. Keep detailed source packets available for inspection and review instead of replacing them with potentially lossy summaries. Record costs separately for interpretation, research, planning, building and repair.

Jev is a possible later decision component for a bounded choice, such as which unresolved question has the highest consequence. It cannot replace the free-form interpretation model or visual screen understanding. Its previous 16-call asset pilot did not test question selection, ambiguity detection or confidence calibration. Do not use a confidence threshold from that pilot as permission to skip clarification. [Previous pilot](jev-asset-pilot.md).

Measure total tokens, dollars and user effort through an accepted playable result. Saving tokens in the first call while causing more repairs is not an improvement.

## What Clicky's public code actually does

The original repository is `farzaa/clicky`, pinned to `a80fa80721a8aebe51a170a7780705024ebc6e46`, dated April 27, 2026. It is a macOS Swift app. Its README says the existing code stays public but new development is private. The reviewed Windows port is `emreyilmaz46/clicky_windows`, pinned to `74dbbbe50c3786b5337ebdf27f9c4c6509a9cd07`, dated April 10, 2026. Both snapshots contain MIT license notices. Retain their notices if reusing code. These findings do not describe other forks or the current private product. [Original repository](https://github.com/farzaa/clicky), [Windows port](https://github.com/emreyilmaz46/clicky_windows).

The original active voice path captures screens, sends screenshots plus conversation to Claude, parses a POINT tag, maps the coordinates and animates its own overlay. It speaks the answer through ElevenLabs. It also contains an `ElementLocationDetector` Computer Use helper, but the reviewed active companion path does not call it. A helper's presence does not prove it is used. [Active original path](https://github.com/farzaa/clicky/blob/a80fa80721a8aebe51a170a7780705024ebc6e46/leanring-buddy/CompanionManager.swift#L585).

The Windows port captures screens and asks Claude for a spoken answer. When a POINT is detected, it makes a second Computer Use request to refine coordinates. It parses the returned coordinate and raises `PointReceived`. `MainWindow` sends that event to `OverlayWindow.ShowTargetAt`. That is a visual marker, not an OS click. The inspected path has no action execution followed by verification of Studio state. [Windows response path](https://github.com/emreyilmaz46/clicky_windows/blob/74dbbbe50c3786b5337ebdf27f9c4c6509a9cd07/Services/CompanionManager.cs#L238), [coordinate parser](https://github.com/emreyilmaz46/clicky_windows/blob/74dbbbe50c3786b5337ebdf27f9c4c6509a9cd07/Services/ClaudeService.cs#L213), [overlay wiring](https://github.com/emreyilmaz46/clicky_windows/blob/74dbbbe50c3786b5337ebdf27f9c4c6509a9cd07/MainWindow.xaml.cs#L29).

Useful ideas to adapt are on-demand screen context, a small floating guide, concise instructions, interruptible voice and highlighting the relevant control. Shipping the Windows port unchanged would also introduce its own .NET/WPF app, Anthropic/AssemblyAI/ElevenLabs configuration, plaintext settings file and transcript logging. Its settings and logging code establish those behaviors. Takko should retain its own provider/credential flow and make voice optional. [Settings](https://github.com/emreyilmaz46/clicky_windows/blob/74dbbbe50c3786b5337ebdf27f9c4c6509a9cd07/Settings/AppSettings.cs), [logger](https://github.com/emreyilmaz46/clicky_windows/blob/74dbbbe50c3786b5337ebdf27f9c4c6509a9cd07/Helpers/Logger.cs).

No Clicky binary was installed, built or executed. No claim of measured pointing accuracy, Studio compatibility, latency or cost follows from this source review.

## A Studio assistant that does and teaches

Give the Studio panel three simple actions: **Do it**, **Show me**, **Explain**. Display Do it only when Takko has an implemented, verified capability for that operation. A screenshot of a button is not such a capability.

| Need | Proposed mechanism | Current limit |
| --- | --- | --- |
| Locate an object or explain a selected script | Read structured Studio selection and object context, then select/highlight the relevant object. | Needs an explicit Takko guide endpoint and object identity binding. Roblox exposes plugin `Selection:Get/Set`. |
| Change an owned object or source | Use the plugin's typed operations, property/source checks and undo recording. | Existing apply works in Takko's namespace. Arbitrary existing-game editing is not implemented. |
| Deliver retained native assets | Finish native transfer/apply through the plugin. | Fixture transport was verified previously, but the production receiver remains unimplemented. Clicky does not fill that gap. |
| Find a toolbar or settings control | Highlight the currently visible control with a one-step instruction. | Requires a Windows overlay and tested coordinate mapping. No current native verification. |
| Perform a genuinely UI-only step | Prefer an identified Windows UI Automation control, otherwise a fresh screenshot-based action with a checked result. | Studio's actual accessibility coverage must be measured. Pixel coordinates alone are insufficient. |
| Enable a permission, choose a publish destination or publish | Explain the consequence and guide or execute the specifically authorized step. | Preserve the user's control over permissions and destination. Do not silently change them as a setup side effect. |

Roblox documents plugin selection and undo APIs. Windows UI Automation provides element properties and action patterns, but support depends on what the application exposes. This is a proposed preference for semantic actions, not a claim that all Studio controls are accessible. [Selection](https://create.roblox.com/docs/reference/engine/classes/Selection), [ChangeHistoryService](https://create.roblox.com/docs/reference/engine/classes/ChangeHistoryService), [Windows UI Automation](https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-uiautomationoverview), [native delivery design](direct-studio-delivery.md).

For each supported action, bind the goal to the selected Studio process/place, capture the current state, execute one operation and read the result. A changed window, missing control or uncertain outcome returns a useful explanation rather than repeating clicks. Use existing session authorization for ordinary supported actions, not a confirmation dialog before every click. Keep Stop accessible and do not replay an uncertain mutation.

Show me should use the same goal and completion check as Do it. For example, explain the connection setting, highlight its control, and advance only after a real connection check succeeds. If the result can only be confirmed by the user, label it as user-confirmed. Guide mode should capture the selected Studio window on demand, avoid unrelated screens and refresh after each step instead of continuously streaming screenshots. An object diagnostic should prefer object/error data over an image.

## Recommended implementation order and evaluation

1. Add the interpretation record, compact choice card and editable brief. Preserve existing source evidence and approval semantics. This addresses the immediate waste before generation.
2. Add a capability-aware Studio help card using structured connection, selection and error information. Finish native delivery separately so routine transfers require fewer manual actions.
3. Prototype an optional Windows guide overlay for the manual steps that remain. Borrow Clicky's interaction pattern and selected code where useful. Do not introduce a general autonomous desktop agent as a requirement for every Takko user.

Before a paid evaluation, freeze a diverse request set with independently labeled missing decisions and explicit exclusions. Include well-specified requests, ambiguous references, delegated defaults, revisions, vague fixes and irrelevant injected text. Compare the current planner against the new stage on missed consequential ambiguity, unnecessary questions, extra invented features, preserved exclusions, total cost and user effort. Validate downstream behavior in Studio on representative accepted builds. No benchmark was run in this assessment.

For guide mode, test multiple Studio windows, display scaling, moved panels, missing targets, a changed selection, cancellation and interrupted operations. Measure correct target selection and verified task completion separately from successful highlighting. Require native checks before exposing Do it for a workflow.

## Evidence and session state

Preserved 26 original-repository files and 21 Windows-port files under `research/evidence/clicky-review-20260920`, with commit metadata and URL/hash manifests. All 47 files matched both recorded SHA256 and GitHub tree blob IDs. This is an integrity check, not a runtime test. `research/results/clicky-review-20260920/source-audit.json` also records hashes of the inspected Takko source files.

No implementation was made, so all `npm run check` stages were skipped: vitest, test:luau, test:plugin, test:guards, build, test:desktop, test:production and test:e2e. The prior turn's passing suite is not a test of this proposal. Two source-read probes needed correction, a PowerShell brace-expansion error and a nonexistent `desktop/main.ts` path. Neither changed files or ran third-party code.

At 18:28 UTC the current app was 4345/PID 30804, older app 4343/PID 31044 and static mock 4342/PID 28132. Ports 4318/4319/4320/4324/4335/4336/4340/4341/4344/4346 were absent. No process was started, stopped or restarted. No Studio session occurred, so no scripts, objects or mode were changed. Paid calls 0, cost $0. Last known key balance remains $1.528618224 at 2026-09-20T18:01:25.793Z, not refreshed. Generation remains paused. Preserve existing credentials, unrelated changes and historical failures. No commit or push.
