# UI polish verification

Final full check and actual packaged-executable verification passed on 2026-09-21. The desktop shortcut points to the verified build. The user approved restarting the existing desktop, but automatic approval review rejected the restart command as blocked by policy without a detailed reason. Its old process remains untouched. Manual closing and reopening through the desktop shortcut is still required.

## Final verification

`npm run check`, with `VITEST_MAX_WORKERS=1` and `LUAU_BIN_DIR=.forge/tools/luau`, exited 0. Log: `full-check3.log`.

| Stage | Result |
| --- | --- |
| Vitest | 1,383 passed across 86 files |
| Luau | Six offline combat scenarios passed, four generated sources compiled |
| Plugin | 14 mocked runtime groups passed, plugin and eight injected sources compiled |
| Guards | Six expected-outcome fixtures passed |
| Build | TypeScript and Vite passed |
| Desktop | 11 tests passed |
| Production smoke | HTML, bundle, API and unknown-route checks passed |
| Browser | 123 passed: 62 desktop and 61 mobile. One mobile resizer case intentionally skipped. 5.9 minutes |
| Actual executable | Final two-launch scenario passed. Zero renderer errors, zero violations in each of two axe scans |

All required check stages ran. `native-final/RESULTS.json` contains executable identity, security preferences, concrete browser/desktop geometry, and width persistence across ports 55467 and 54715. Both owned test instances exited normally. No paid calls were made.

## Build and evidence

- Final package: `release/takko-ui-polish-20260921-verified/Takko-win32-x64/Takko.exe`.
- The package comes from the shared source built by `npm run check`, followed by `node desktop/package.mjs` with a fresh output directory.
- `packaged-resources.json` compares 31 resource files byte for byte. Package metadata also matches after Electron Packager's expected removal of `private`.
- `source-manifest.json` and `diffs/` compare this task against `.forge/ui-polish-before`. No dependency changes, commit or push.
- `shortcut-verification.json` records the updated desktop link and its backup. The taco icon and original package are retained.
- `scripts/verify-ui-polish-desktop.ts` is the repeatable executable test. It uses fresh `.forge/ui-polish-native` profiles. Provider authentication/catalog data are mocked for the Models scenario. Real local project, preference and animation APIs are used.
- The native1 profile was moved intact from its accidental location beneath the report into `.forge/ui-polish-native/native1-archived`.

## Recorded runs

| Run | Result |
| --- | --- |
| Focused browser 1 | 7 passed, 2 failed, 1 skipped. Reopened custom-answer labeling failed. Corrected separate label/id binding. |
| Focused browser 2 | 52 passed, 7 failed, 1 skipped. Six old Models locators/copy expectations and one real mobile inspector-fit failure. Updated the tests for hidden known fields and shortened copy, and corrected mobile dock allocation. |
| Full check 1 | 1,383 unit/API tests passed across 86 files. All intermediate stages passed. Browser: 118 passed, 5 failed, 1 skipped. Two old task-list selectors, one drag failure, a Windows `ERR_NO_BUFFER_SPACE`, and an empty animation reload result. Packaging overlapped this browser run, so it was not used as final evidence. |
| Full check 2 | 1,377 of 1,383 unit/API tests passed across 85 of 86 files. Windows worker exited `3221226505` in `provider-connections.test.ts`. One unhandled error. Later stages did not run. |
| Native 1 | Harness failure from a tsx-injected `__name` helper in a serialized evaluation. Actual packaged identity/security checks passed before it stopped. |
| Native 2 | Harness failure because the default axe scanner requested a new Electron page, which the protocol does not support. Corrected to axe's same-page legacy mode. |
| Native 3 | Harness failure from a relative API URL in the reusable provider fixture. Corrected to resolve against the intercepted local request URL. |
| Native 4 | Interaction/accessibility/relaunch checks passed. The geometry comparison was later found to compare undefined results and is not accepted as parity evidence. |
| Native 5 | Passed the corrected concrete geometry assertions, actual executable interaction checks, two axe scans with zero violations, and width persistence across ports 61326 and 51169. Precedes the last Studio-placeholder polish. |
| Initial package manifest | Expected package.json normalization was incorrectly treated as a mismatch. Confirmed the only difference was removal of `private`, then explicitly verified that normalization and every other resource hash. |

Logs, failure traces and screenshots remain alongside this report. `full-check1-artifacts/` preserves its browser output before the next run. No failed trial was silently retried as paid inference. All calls in these tests are offline fixtures or local app APIs.

Archived 33 changed routine root-level results under `browser-final/` and restored their exact pre-task copies. Six nested routine browser snapshots were regenerated and also archived there. Historical named failure evidence and research originals were retained.

## Visual and interaction checks

The development UI was inspected live on port 4359. Browser screenshots cover 1440×900, the 860×640 desktop minimum and a 390px phone viewport. Native executable screenshots cover normal, minimum and maximized windows, and the restored window was checked through BrowserWindow state.

The native test checks pointer capture at extreme drag positions, keyboard resizing, reset, panel constraints, composer newlines, modeless Marketplace focus/escape, inspector modes, source/build/Studio drawers, history, build-plan rows, structured questions, native Enter activation, optional Skip, review/confirmation and reduced motion. It imports a synthetic R6 track through the real local API and verifies WebGL triangles and different rendered poses at different scrub times.

The browser suite adds multi-select retention, custom text, backtracking, required Continue disabling, focus looping, dismissal/reload retention, inline R6/R15 choices, saved receipt editing, provider failures, presets and R15/context-loss behavior. The horizontal divider case is deliberately skipped on phones because that layout stacks panels vertically.

The existing user's desktop project was inspected read-only. It had revision 2, no active job and zero reservations. Its four saved turns include one exact legacy clarification summary recognized as a two-answer receipt by the new renderer. Stored content was not changed.

## Limits and cost

This is verified UI behavior with offline fixtures. Provider inference quality, generated games, native Studio gameplay and Roblox animation playback were not tested. Models authentication in the executable scenario is mocked. Existing Studio disconnected/error states are displayed honestly. No Studio scripts, probe scopes, imports or play mode were changed, so no Studio cleanup was necessary.

Paid inference cost $0. Reservations $0. Balance not refreshed. Last known balance $4.994992 at 2026-09-20T23:34:36.757Z. Old generation work remains paused. Existing app processes and key services have not been stopped or restarted.


## Approved restart blocked

At 2026-09-21T21:18:24.8174548Z, read-only checks confirmed old desktop PID31724 and service PID41336 on port62434 remain running. The restart command was rejected before execution. The saved Punch & Practice Arena project remains draft revision2 with no active job and zero reservations. The public Models API reports windows-encrypted storage and a validated OpenRouter connection with a key. This confirms current state, not restoration by the new build. No paid calls or additional test suites ran during this deployment attempt. Evidence: restart-blocked.json and listeners-after-restart-block.json.
