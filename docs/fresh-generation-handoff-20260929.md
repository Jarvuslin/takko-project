# Fresh generation handoff

Takko 0.2.0 is packaged and open with a fresh desktop workspace. The browser fallback is running on 4318. No live generation or paid provider call was made. Cost: $0.

## Launch

- Executable: `D:\RobloxProjects\Roblox Gen\release\takko-fresh-20260929\Takko-win32-x64\Takko.exe`.
- Reopen this clean setup with `D:\RobloxProjects\Roblox Gen\release\takko-fresh-20260929\Start Takko Fresh.lnk`. It supplies `--user-data-dir="D:\RobloxProjects\Roblox Gen\.forge\fresh-desktop-20260929"`. Opening the executable without that switch uses the existing default Forge Desktop workspace.
- Packaged with `npm run desktop:package` and `TAKKO_PACKAGE_OUT=release/takko-fresh-20260929`, from committed application source `0c25e2b`. File and product version both report 0.2.0.
- Desktop main PID 32384. Its service currently uses `http://127.0.0.1:65219`, PID 41392. Desktop service ports are allocated at launch. The Service menu shows the current endpoint for the plugin.
- Browser: `http://127.0.0.1:4318`, PID 47716, data `.forge/fresh-browser-20260929`. Launcher `.forge/fresh-browser-start.ts` runs current source with an empty environment configuration and never loads `.env`.
- The user authorized closing the older desktop app. Its main PID 46464 received a normal window close and its processes exited. Port 4340 remains on PID 26772. Neither its store nor project c8550a5b was changed.

The two new workspaces received only schema-validated settings from `.forge/world-policy-live-20260928/configuration/models.json`: Claude Sonnet 5, Jev, the exact routes, My first preset, the active preset ID, $8 budget and repairLimit 0. No existing vault, key or `.env` was opened or copied. Both APIs reported zero projects, zero provider connections and no profile with a key. Connect OpenRouter in Models separately in each workspace.

## Drag fixes

The initial proposal request previously omitted the selected-asset context even though later planning included it. It now supplies the actual inspected attachments and user usage notes. Asset needs can bind to a supplied attachment through `selectedAssetId`. Proposal validation rejects invented attachment identities.

Asset-card initialization now restores bound choices from the actual inspection cache without searching for replacements. Unbound legacy attachments remain visible in their own rows rather than being guessed into unrelated needs. Normal inspection warnings, exclusions, script review and animation clip requirements remain in force. An attached animation pack is captured once when Studio is available. A pack still needs a real playable clip selection before it is Ready.

A Marketplace card dropped onto an asset row now assigns that exact listing through the existing persistent choice and verification endpoint. It does not need to appear in a prior search for that row. Cached inspections are reused. Wrong asset types and blocked inspections still stop approval. Interrupted saved checks become explicit retryable problems.

Both UIs say that Studio is disconnected and animation clips need the Takko plugin. The project layout accounts for this notice. In a short desktop window, attachments scroll inside the composer while the Send control stays visible.

## Verification

- Focused unit/integration: 34 passed across asset-picking and conversation-planning tests.
- Focused browser: 14 passed across asset picking, Marketplace, animation drops and Studio connections before the final layout adjustment. The short-window regression passed after that adjustment.
- Final full `npm run check` exited 0: build, 1,757 unit tests across 130 files, 6 offline Luau scenarios, 15 plugin mocks, 6 guards, CSS lint, 14 desktop tests, production smoke and all 100 desktop browser tests passed. No skips. Final log: `test-artifacts/fresh-full-check-passed.log`.
- `npm run desktop:package` exited 0.
- Actual packaged Electron renderer and a separate desktop Chromium browser were inspected. Both rendered the refreshed home screen and Geist font, opened Models, displayed the Studio/plugin message, and returned matching routes, profiles, presets and limits without connected credentials.
- GET `/` on 4318 returned HTTP 200. GET project, model and status APIs confirmed the empty workspace and configuration. Screenshots and verification data are in `test-artifacts/fresh-ready/`.
- Final liveness check at 2026-09-29T18:13:45Z: browser 4318 and desktop 65219 both returned HTTP 200. PID 26772 still owned 4340. Test service 4319 had stopped.

Failures are retained. Initial focused fixtures failed on outdated Jev responses and pre-PC control wording, then on an unscoped status locator. Those fixture issues were corrected. The first full-check attempt was deliberately interrupted during Vitest to fix interrupted-choice recovery. The next complete attempt passed all stages except one short-window browser test, with 99 browser passes and one failure. An initial layout adjustment still failed that test. The final composer sizing change passed it. Logs remain under `test-artifacts/fresh-*`.

CSS lint reports 267 existing warnings and zero errors. Build output includes the existing chunk-size and browser-externalized node:crypto warnings.

These checks establish offline data flow, persistence, UI behavior and package launch. Mock planner/provider and Studio fixtures are not evidence of live model quality, asset playback, permissions or a playable generated game. No native Studio session was opened or modified. The user runs generation and Studio testing themselves.
