# Provider Models results

Completed 2026-09-21. Models follows the supplied reference and uses validated provider connections shared across models. Windows saves keys encrypted. The existing desktop shortcut targets the final updated package with the existing taco artwork as its icon.

## Final verification

`full-check-4.log`: complete `npm run check` passed with `LUAU_BIN_DIR=.forge/tools/luau` and `VITEST_MAX_WORKERS=1` for this run. No committed test-runner configuration was changed.

- 1,377 unit/API tests across 85 files, 161.01 seconds.
- Six Luau combat scenarios and four generated-source compilations.
- Fourteen mocked plugin groups, plugin compilation and eight injected-source compilations.
- Six guard fixtures matched expected outcomes.
- TypeScript and Vite build.
- Ten desktop lifecycle/service tests.
- Production HTML, bundle, API and unknown-route smoke.
- 114 browser tests, 57 desktop and 57 mobile, 5.8 minutes.

No stage of the successful full run was skipped. After it, one mobile-only CSS spacing rule was adjusted to keep Test and Edit on the same row. The final change was checked by a fresh TypeScript/Vite build and four focused browser scenarios covering provider reuse, rejection, model saving, accessibility and both screen sizes. These passed in 31.2 seconds in `final-mobile-polish.log`. Final desktop TypeScript/build and packaged-resource native smoke also passed. A second full unit/Luau/plugin run was not performed for that final CSS rule.

Native Electron smoke passed against the built resources, the first package and the final package. It tested the sandboxed invisible renderer, API, locked Models catalog, Windows-storage label, CSP and owned-service shutdown. It did not launch or close an existing user desktop process. No native Roblox Studio session took place. No scripts, probes, imports or play-mode state were changed.

## Live provider and credential evidence

`live-auth-preview.json`: the existing saved OpenRouter key successfully authenticated through the new provider connection route at 2026-09-21T17:36:14.918Z. The real catalog returned 440 models during inspection. GLM Flash Latest was selected and saved through the actual UI in the isolated preview without entering the key again.

`desktop-key-restoration.json`: a fresh Node process loaded the copied Windows-encrypted desktop vault. The existing desktop model has a key available. The process starts with validation reset so browsing checks access again. Synthetic tests independently cover two models sharing one connection and removal of the original model without losing that connection.

Provider validation is not proof of successful inference or every model's permissions. OpenAI, Anthropic, Gemini and custom-provider auth handling were tested with synthetic transports, not live credentials. Custom compatible servers can have different authentication behavior. An endpoint that accepts arbitrary tokens only proves that endpoint accepted the request.

Actual paid inference cost $0. Reservations $0. No generation or paid inference was dispatched. Key balance was not separately refreshed or reported. Last previously recorded balance was $4.994992 at 2026-09-20T23:34:36.757Z. The paused v3 trial and stopped generation goal were not resumed.

## Desktop delivery

- Shortcut: `C:/Users/7474g/OneDrive/Desktop/Takko.lnk`.
- Final target: `D:/RobloxProjects/Roblox Gen/release/takko-models-20260921-final/Takko-win32-x64/Takko.exe`.
- Taco icon: `release/takko-models-20260921-final/Takko.ico`, converted from the existing mascot asset.
- Both the original package and initial package from this task remain available. The original shortcut is backed up under `.forge/models-provider-before/Takko.lnk`.
- All 32 built resource files match the final package. Electron Packager removes only the `private` package metadata flag. The initial strict byte comparison stopped on that expected metadata difference, which was inspected before using a semantic metadata comparison.
- The desktop workspace previously had no saved configuration or projects. Copied the current browser's one-model configuration, preset, current project and encrypted provider connection. Zero existing files were overwritten. Project copy hashes match. These are separate local copies, not continuous synchronization.
- The shortcut target, working directory and icon were read back and verified. Native smoke exercised packaged resources. The user-facing desktop window was not left running.

## Visual evidence

Inspected `models-final-desktop.jpg` at 1440 by 900, `add-model-final.jpg`, and `models-final-mobile.jpg` at 390 by 844. Earlier images preserve the initial oversized connection card and the mobile action-wrapping issue. The final card is compact, model selection collapses the duplicate catalog in the dialog, prices remain visible on mobile and row actions fit together. Temporary viewport overrides were reset.

Live preview: http://127.0.0.1:4358/?project=a84134d4-fced-42c4-a6fe-dcf4a2a4dc15#models. PID 20992. Separate data in `.forge/provider-models-preview-data`. It now holds an encrypted provider connection, so preserve it and do not restart it without permission. All pre-existing services remained running. Final listener inventory is `listeners-final.json`. Test-owned 4319 exited normally.

## Preserved failures

- `focused-1.log`: 39/41 passed. Two previous tests assumed unauthenticated catalog access or unvalidated key copying. Updated those fixtures for the explicit validation requirement. `focused-2.log`: 41/41 passed.
- `browser-focused-1.log`: 25/36 passed. The synthetic provider fixture initially sent public-only fields into the strict configuration schema, and unfinished route callbacks caused teardown errors. Corrected the fixture and awaited cleanup. Traces and context are preserved in `browser-focused-1-artifacts`. `browser-focused-2.log`: 36/36 passed.
- `full-check-1.log`: 1,377 unit/API tests and Luau/plugin/guards passed. Build caught a Test button mistakenly placed in preset markup. Moved it into model rows. Desktop, production and browser stages did not run in that failed attempt.
- `full-check-2.log`: 1,361 tests passed. Windows native worker exited with code 3221226505 while starting `tests/api.test.ts`. Later stages did not run.
- `full-check-3.log`: 1,367 tests passed. The same native worker exit occurred while starting `tests/chat-architecture.test.ts`. Later stages did not run.
- The fresh complete run with one Vitest worker passed. Both worker-failure logs remain unchanged.

Seventeen baseline-clean generated artifacts were archived here and restored to their prior tracked versions. Unrelated edits and the existing Git index lock were preserved. No commit or push. Source hashes are in `source-manifest.json` and pre-edit copies in `.forge/models-provider-before`.
