# Connection and reply recovery results

## Evidence boundaries

No paid inference was authorized or performed. Actual cost and new reservations are $0. The last recorded key balance, $4.994992 at 2026-09-20T23:34:36.757Z, is stale and was not refreshed. The user's subsequent saved charges were inspected only to diagnose their failure. No generation was retried, and no budget was raised.

`observed-failure.json` records the read-only project failure, output token counts, empty trace lengths and public Sonnet 5 reasoning metadata. It contains no provider credentials. Reasoning exhaustion in the old responses is an inference because their traces did not retain a reasoning breakdown. New mock tests verify that future reported reasoning counts are preserved without double billing.

## Automated checks

Final `npm run check` passed every stage in `connection-full3.log`: 1,417 unit/API tests across 90 files, 6 Luau scenarios plus 4 source compiles, 14 plugin mock groups plus the plugin and 8 injected source compiles, 6 guard cases, TypeScript/Vite, 14 desktop tests, production smoke, and 151 browser tests. One intentional mobile horizontal-resizer test is skipped. Browser duration 8.2 minutes. No check stage was skipped.

Earlier runs are retained:

- `reply-unit1.log`: 82 passed and 1 failed. The existing Gemini result assertion did not include the newly retained reasoning count.
- `reply-unit2.log`: all 83 targeted provider/engine tests passed.
- `connection-browser1.log`: 2 passed and 2 failed. The harness counted the separate project-entry connection request as the refresh it meant to hold.
- `connection-browser2.log`: 2 passed and 2 failed. The revised harness did not enable its held-response mode before clicking. Both failures are harness issues, retained with traces.
- `connection-browser3.log`: all 4 targeted desktop/mobile recovery tests passed.
- `connection-full1.log`: 1,416 passed and 1 failed across 90 unit files. The audio fixture had another exact-result assertion that needed its reported reasoning count. The chain stopped before later stages.
- `connection-full2.log`: all pre-browser stages passed. The browser stage was interrupted after 84 passed and 3 failed, while finalizing the Marketplace search-row CSS. The failures were old connection copy and an unscoped status locator that now matched both attachment and connection status. The interrupted run is not a complete check. Its traces remain under `full2/`.

## Packaged application

Final candidate: `release/takko-connection-recovery-20260922-ready/Takko-win32-x64/Takko.exe`.

`native4/report.json` passes on the final executable in its own isolated profile. The actual connector reported no Studios. The app displayed Studio disconnected after a real refresh. A connection fixture was then introduced and labeled "Connection test fixture". Both Marketplace and the chooser loaded 30 actual public Creator Store results, with real votes and loaded thumbnails. This establishes packaged search and image loading, not an active Studio session.

The same native run verified the held refresh spinner and disabled button, failed initial search followed by exactly one retry, clearing a stale Studio after connection failure, reconnecting without replacing existing results, one-pixel control alignment, minimum 860 by 640 outer window, a reachable truncation recovery action, and opening Models without a generation request. There were no uncaught renderer errors. The tested Marketplace dialog had zero axe violations. It closed the isolated executable afterward.

`native1/` retains a failed alignment measurement during the dialog entrance transform. The assertion now waits for stable geometry and retains the one-pixel tolerance. `native2/` and `native3/` passed before the final Marketplace row correction. Native3 added a loaded-thumbnail assertion for the chooser. Native4 includes that assertion and a scrolled, visible error-recovery screenshot.

`package-hashes.json` verifies all 34 packaged resources and normalized package metadata against `dist-desktop`. `source-manifest.json` records 148 source/build files. The desktop Takko shortcut was updated after the full check passed. `shortcut.json` records its target, preserved taco icon and backup. All 148 source/build hashes still match the packaged baseline. The user must close and reopen the shortcut to load this version.

## Studio and user process safety

No user Takko process was closed or restarted. At initial inspection, the user's surgical-UX app was main PID33760, service PID22024 on port58479. Only owned test profiles were launched and closed. No Studio instance is currently detected, no play mode was changed, and no scripts, probe scopes or imports were created. There is no new live plan or gameplay verification. The paused v3 trial and old generation goal remain untouched.
