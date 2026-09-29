# Takko UI polish

Implemented and verified in the browser and actual packaged Windows executable. The desktop shortcut points to the verified build. The user approved restarting the desktop, but automatic approval review rejected the restart command as blocked by policy without a detailed reason. The original running desktop and services have not been restarted. Closing Takko and reopening the desktop shortcut manually remains necessary.

## Audit and scope

The [initial audit](ui-polish-audit.md) followed live navigation and source inspection. It covered the workspace, agent feed, decisions, inspector, source/build/Studio drawers, Models, presets, Marketplace and the Electron build path. The supplied screenshots were additional user observations.

Beyond the reported problems, this pass found three competing inspector scroll areas, duplicate Models/Marketplace icons, a disabled-fieldset gap in dialog focus trapping, repeated specification counts, an oversized Studio placeholder, and an ephemeral desktop port that would discard a browser-only panel preference between launches.

## Implemented

- Shared `Clarifications` and `ClarificationDialog` components reuse the existing native dialog wrapper. Multiple decisions use one focused question at a time and a review step. Native radio buttons, checkboxes, free text, Other, explicit delegation, optional Skip, Back, Continue and confirmation are supported. One short single-choice question stays inline.
- Answers remain in the draft through Back, dismissal and browser reload for the same project revision. Confirmation keeps the choices. Updating a concept or plan remains an explicit separate action. Edited saved answers invalidate the planning action until the concept is refreshed.
- Conversation turns retain typed clarification receipts. Exact legacy question/answer summaries can display as receipts without rewriting stored history. Unrecognized prose is preserved. Receipts offer Edit answers.
- The agent panel has a 12px pointer-captured divider, 320px minimum and 640px maximum width, further constrained to preserve a 380px canvas. Keyboard arrows, Shift+arrows, Home, End and double-click reset work. Direct dragging updates the grid without rerendering every child. Width saves locally and in a validated workspace preference file for desktop relaunches. Phones use stacked panels.
- Composer text expands as needed and reflows with panel width. Enter sends, Shift+Enter inserts a newline, and IME composition does not trigger submission. Focus belongs to the composer surface. Generation and inspection guards remain in place.
- Build plans use compact expandable task rows, completion counts, dependency names and truthful planned/waiting/complete states. Empty plans use one line. No task progress is fabricated.
- Proposal, activity, specification, answer and artifact surfaces have less nesting. The original brief starts collapsed. Duplicate requirement headings are removed. Timestamps and revision metadata are more readable.
- The existing bottom inspector separates system editing from connection editing in one scrolling area. The selected node remains visible. Empty architecture has a centered explanation and an Ask Takko action.
- Add Model has compact provider choices, concise connection status, a management disclosure, a clear selected model, hidden catalog-populated fields and advanced options. Catalog loading retains row structure. Models has a distinct navigation icon.
- Marketplace focuses search when opened, closes with Escape and returns focus. It stays modeless so assets can still be dragged into the composer.
- Studio's empty preview is a compact neutral section, keeping connection steps closer to the top. Source, Studio and build diagnostics remain available through their existing drawers.
- Shared focus, control, spacing, surface and motion styles preserve Takko's charcoal palette. Brief dialog/step entrances use opacity and transform, with reduced-motion alternatives. There is no animated panel width and no decorative continuous motion.

## Desktop

The shortcut resolves to an Electron application named `Takko.exe`, not a separate UI implementation. `desktop/main.mjs` starts its own supervised local service. The package contains the same built web assets. `desktop/package.mjs` packages `dist-desktop`, which embeds the Vite output, local service, plugin and native helpers.

The default profile remains `Forge Desktop`. The main process now honors an explicit `--user-data-dir` for isolated executable testing. Sandbox, context isolation, disabled Node integration, navigation restrictions, CSP and denied permissions remain intact. No binary was edited and no new frontend framework was installed.

Final package and shortcut deployment status are recorded in [RESULTS](results/ui-polish/RESULTS.md).

## Verification

Full `npm run check` passed: 1,383 unit/API tests across 86 files, six Luau scenarios and four source compilations, 14 mocked plugin groups plus plugin/eight injected-source compilations, six guard fixtures, TypeScript/Vite build, 11 desktop tests, production smoke and 123 browser tests. All required stages ran. One phone-only horizontal-resizer case was intentionally skipped because phones use stacked panels. Failures are recorded in [RESULTS](results/ui-polish/RESULTS.md).

The packaged test launches the actual executable twice, checks `app.isPackaged` and its executable path, exercises window minimum/maximize/restore, drag and keyboard resizing, and verifies width persistence across different service ports. Final native verification passed on ports 55467 and 54715, both closed after the owned test instances exited. Dialog and Models axe scans found zero violations. No renderer page errors occurred.

Native captures cover workspace, inspector, connections, build plan, source/build/Studio drawers, history, composer, Marketplace, decisions/review, Models, Add Model, presets and a real WebGL animation track. They are renderer screenshots from the packaged Windows application. Window behavior is verified through Electron's actual BrowserWindow API. Chromium and Electron use identical measured canvas/chat/composer geometry at 1440×900 in the final comparison.

Accessibility checks use axe plus native keyboard interaction tests. Tests exercise focus trapping, restoration, Escape, custom answers, Back, multi-select, optional skip, simple inline choices and saved-answer editing. API tests cover bounded preference persistence and cross-origin rejection. Existing browser suites exercise provider connection errors, preset save/discard, source inspection, Studio recovery, graph editing, asset attachments and R6/R15 playback.

## What this does not establish

Offline fixtures and mocked provider connections are not paid inference or native Studio integration tests. Real WebGL track motion is verified, but it does not verify Roblox animation playback or gameplay. No Studio session, scripts, imports, probe scopes or play-mode state were changed, so no Studio cleanup was required. The app still stops at ready to test.

Provider routing, billing authorization, encrypted key storage, generated-game contracts and the Studio plugin protocol were deliberately retained. The design-lab alternatives were retained as historical experiments. No live generation was started or resumed.

Cost: $0 paid inference and $0 reservations. Balance was not refreshed. Last recorded balance remains $4.994992 at 2026-09-20T23:34:36.757Z. Existing generation work remains paused.

## Skills actually read

| Local skill | Contribution |
| --- | --- |
| choose-skill | Located the installed catalog without reinstalling it |
| frontend-design | Preserved the current visual direction and defined a focused polish pass |
| ui-ux-pro-max | Checked interaction density, feedback and responsive guidance against the existing product |
| baseline-ui | Consistent typography, restrained surfaces and native semantic controls |
| fixing-accessibility | Dialog reuse, focus behavior, keyboard actions and accessible decisions/resizer |
| fixing-motion-performance | Short opacity/transform motion, reduced motion and direct resizing |
| react-best-practices | Shared components and isolated drag updates instead of feed-wide rerenders |
| electron-development and detailed guide | Actual packaged-entry testing, profile isolation, lifecycle and preserved renderer security |

Source baseline: `.forge/ui-polish-before`. The manifest and per-file diffs in `docs/results/ui-polish` distinguish this work from the pre-existing dirty tree. No commit or push.
