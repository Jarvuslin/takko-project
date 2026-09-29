# Brief approval and Marketplace choices

Implemented and packaged an explicit brief approval and asset review flow, a Studio connection screen and a Creator Store-inspired Marketplace browser. The final executable discovers the live Studio session, returns20 actual free assets for a training-dummy query, loads their thumbnails and renders an imported WalkAnim clip. The desktop shortcut now points to the verified build. Close the user's existing Takko window and reopen that shortcut to use it.

## Studio connection and Marketplace polish

The user's running UI-polish executable returned HTTP502 with the generic Studio request error at port55258. Source inspection found that desktop/main.mjs excluded LOCALAPPDATA from its service environment, while resolveRobloxMcpExecutable requires it. The new shared serviceEnvironment whitelist includes LOCALAPPDATA and APPDATA. It still excludes provider credentials. Recovery messages distinguish an absent connector, startup failure, process exit and timeout without exposing raw diagnostics.

Native verification also exposed blocked external Creator Store links and thumbnails. The final desktop policy opens HTTPS create.roblox.com asset/documentation links through the system browser. It permits HTTPS rbxcdn.com images in both CSP and the request filter. Scripts, API requests, frames and arbitrary navigation remain restricted. The browser opener was intercepted in the native test to verify dispatch without opening an extra browser window.

Opening or creating a project checks the actual Marketplace connector before showing the architecture. A disconnected screen provides the Studio Assistant/MCP setup steps, retry and Continue offline. Offline mode preserves brief editing and approval while hiding architecture, the build plan and Studio tools. Reopening the project checks again. An active connection is rechecked every15seconds. The Takko build plugin remains a separate connection and is described separately. A Marketplace connection does not claim that the build plugin is paired.

The user selected Roblox Creator Store as the visual reference. The browser keeps Takko's existing fonts, dark surfaces, neutral palette and restrained borders. It uses a wider asset grid, large thumbnail areas, visible creator names, collection tabs and working Models, Animations, Sound effects, Visual effects and Environments shortcuts. It remains non-modal so desktop users can drag assets into the brief. Small screens use the Add action. The asset-choice dialog retains a modal review flow with real clip selection and approval.

Sources consulted: [Roblox MCP setup](https://create.roblox.com/docs/studio/mcp), [Roblox AI workflow setup](https://create.roblox.com/docs/ai/accelerated-workflows), [Creator Store](https://create.roblox.com/docs/production/creator-store). Fab was considered before the user selected Creator Store. This is an adaptation of familiar browsing patterns, not a claim of matching Roblox's implementation.

## Behavior

- **Approve brief** accepts a completed concept or the original brief without asking the user to type an approval message. Existing clarification choices still need to be resolved and applied before accepting a concept.
- The example combat request produces six groups: practice dummy, fighting animation, sprint animation, walk animation, sound effects and visual effects. Search hints come from the brief, saved changes and answers. These are deterministic hints, not another paid inference call. Other briefs receive a general model query. Search queries are editable.
- Each group keeps up to three actual free Creator Store results. Search failures and empty results remain visible. Search metadata does not establish quality or suitability.
- Animation searches use Model packs because the installed Studio search API does not accept Animation as a search type. Preview loads up to eight supported clips per pack. The existing Marketplace pack browser remains available for larger packs.
- The dialog displays actual R6/R15 clip data with playback, scrubbing and camera controls. The user chooses an individual clip. A pack title alone does not make it an approved animation.
- Model preview reads detached primitive geometry, including actual positions, sizes, shapes and colors. It never parents the asset into the place or executes its scripts. Custom meshes, textures and runtime effects are not rendered. Omitted parts and effect counts are disclosed.
- Sound options link to the Creator Store for listening. This change does not add in-app audio audition or full VFX playback.
- **Approve assets & create plan** re-inspects selected references, rejects source-review findings and changed preview versions, saves the references with their intended roles and starts the configured planner. Approved choices are retained through reloads. Draft selections are stored per project revision in session storage.
- **Find later** explicitly records an unresolved need. Disconnected users can defer discovery and create a plan. This does not claim that missing assets were found or remove those requests from scope.
- **Change asset choices** reopens the review and invalidates the previous plan. Changed briefs invalidate prior approval and search results. Late results from an older revision cannot overwrite the new brief.
- The planner receives the selected references and unresolved choices. Selected published animation IDs count as supplied references. Unselected clips do not. The later native asset loop is limited to the approved candidates and stops if it needs an unapproved replacement. Audio still requires the existing acquisition and native listening/playback evidence.

Direct planning remains available for existing workflows and older running servers. New asset-choice controls are gated by the backend capability flag. Browser and Electron use the same renderer.

## Live observations

An isolated keyless service searched from the exact combat brief against the connected Untitled Experience, place122588481889475, Studio9a2d384f-1a8f-4da1-890b-d06532c12ede. All six groups returned three results.

Training Dummy asset8767186735 returned six renderable primitive parts. Animation pack127891474281876 returned eight loadable R6 clips. This establishes search and extraction, not that the pack contains suitable fighting moves. The recorded names include generic Animation entries. Preview is necessary to judge fit.

Evidence is under `docs/results/asset-choices/live/`. The isolated HTTP service on50907 exited. No asset was inserted into the place, no user script was edited and no animation was applied to a game. Loaded detached assets and preview rigs were destroyed by the existing extraction paths. Studio was checked afterward and remained in Edit mode. No probe scope, temporary import or test service remains from this live check.

Roblox documents [Creator Store queries](https://create.roblox.com/docs/projects/assets/api) and [audio permissions](https://create.roblox.com/docs/audio/assets). These sources describe platform capabilities. The observations above come from this app's real local API and the connected Studio.

## Verification

Detailed logs and exact final counts are recorded in `docs/results/asset-choices/RESULTS.md`. Earlier failures are preserved:

Existing workspace regression cases use an explicit status fixture that disables the new connection capability. This isolates their existing editing, layout and generation scenarios and verifies compatibility with older running services. New studio-connection browser cases use the real capability and cover both project creation and opening, disconnected guidance, offline architecture hiding, reload and reconnect. Native verification checks actual connector discovery and free search before installing any test routes.

- Focused unit1:64 passed,1 failed. A source assertion mistook the equality check `Parent==nil` for an assignment. Corrected the assertion.
- Focused unit2:65 passed across3 files.
- Focused browser1:21 passed,4 failed,1 intentional mobile resizer skip. Two test locators used the wrong slider label. Two tests caught disconnected Studio guidance being exposed as a critical alert. Fixed the locator and changed disconnected guidance to ordinary status text.
- Focused browser2:16 passed across desktop and mobile, including two zero-violation axe scans of the selection dialog.
- Focused unit3:28 passed across the asset-choice and animation suites.
- Full check1:1395 of1400 tests passed across86 of87 files. The `api.test.ts` worker exited3221226505. Later stages did not run. This is not a full pass.
- Full check2:1401 passed,1 failed across87 files. The status API assertion needed the new assetChoices capability field. Updated the assertion. Later stages did not run.
- Full check3:1402 unit/API tests and all intermediate stages passed. Browser127 passed,2 failed,1 intentional skip. The existing UI-polish request-log assertion read before the concept POST completed. Replaced it with a waiting assertion. The final source additionally exposes discovery and approval on already-planned briefs and aligns the selection radios.

## Limits and cost

No paid inference was authorized or performed. Actual cost $0 and reservations $0. Balance was not refreshed. Last known balance $4.994992 at2026-09-20T23:34:36.757Z. The paused v3 trial and old generation goal remain paused.

Search hints are bounded keyword matching, not semantic understanding of every genre or negated instruction. The user can edit searches and reject suggestions. Static inspection is limited screening, not a safety guarantee. Preview availability does not establish permission to publish an animation in another experience. The tests do not establish generated gameplay, full asset integration or native runtime behavior. The app still stops at ready to test.

Existing user desktop and other running services are not restarted by this task. The prior automatic approval block on restarting the user desktop remains recorded. No commit or push.

## Final verification and desktop handoff

Full npm run check6 passed:1405 unit/API tests across88 files, six Luau scenarios plus four source compilations,14 plugin mock groups plus plugin/eight injected compilations, six guard fixtures, TypeScript/Vite,12 desktop tests, production smoke and135 browser tests. One intentional mobile horizontal-resizer skip. Both earlier heading-order and slow-poll regressions passed on desktop and mobile.

After that full run, desktop-only external-link and thumbnail policy fixes passed test:desktop with14 tests, followed by actual packaged verification in native3. Unit/API, Luau, plugin, guards, frontend build, production and the complete browser suite were not repeated after those desktop-only policy changes. The renderer and backend are unchanged from check6. The final package was rebuilt from dist-desktop. All34 checked resource files match, with package metadata compared separately after Packager removes private.

Native3 ran release/takko-asset-choices-20260921-ready/Takko-win32-x64/Takko.exe with an isolated profile. It verified real Studio discovery and search before installing any mocks, actual thumbnail pixel loading, browser-link dispatch, the disconnected screen and offline architecture hiding. Mocked approval actions then exercised the whole button flow with exactly one plan request and no inference. The retained real Studio WalkAnim extraction rendered and changed pose when scrubbed. The review worked at normal and860×640 minimum window sizes. Zero detected axe violations and zero uncaught renderer errors. Screenshots were inspected. The owned app/service at62976 closed normally. These observations do not establish generated gameplay or native animation playback in a published experience.

Native1 and native2 failures remain in their result folders. Native1 proved the connection fix but exposed blocked thumbnails and a harness assertion on an offscreen lazy viewer. Native2's stronger image assertion exposed the remaining desktop request filter. Native3 passed after both policy layers and the harness scroll were corrected. Earlier package candidates were never linked from the user's shortcut.

Shortcut C:/Users/7474g/OneDrive/Desktop/Takko.lnk targets the ready package. Its former target is backed up at .forge/asset-choices-shortcut-before.lnk. The taco icon is preserved. The user's old main PID23528 and service PID20644 on55258 remain untouched. The normal profile still reports an encrypted provider key present, with validation false in the last read-only snapshot. No credential value was read or logged, no provider validation was attempted and no normal-profile project was changed. Normal-profile launch of the new build remains pending the user's manual restart.
