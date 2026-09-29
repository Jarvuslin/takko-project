# Asset choices verification

The final package passed native verification and is linked from the desktop shortcut. Full check6 passed before the last desktop-only policy fixes. Those fixes passed14 desktop tests and native3. Earlier failed runs remain preserved below.

## Completed focused checks

| Run | Result |
| --- | --- |
| focused-unit1.log |64 passed,1 failed. Incorrect static assignment assertion. |
| focused-unit2.log |65 passed across3 files. |
| focused-unit3.log |28 passed across2 files. |
| focused-browser1.log |21 passed,4 failed,1 intentional mobile resizer skip. Wrong slider locator and disconnected status semantics. |
| focused-browser2.log |16 passed, desktop and mobile. Two axe scans had zero violations. |
| full-check1.log |1395/1400 passed,86/87 files. Windows worker exit3221226505 in api.test.ts. Subsequent stages did not run. |
| full-check2.log |1401 passed,1 failed across87 files. Updated the status API assertion for the new assetChoices capability. Subsequent stages did not run. |
| full-check3.log |1402 unit/API tests passed and every intermediate stage passed. Browser:127 passed,2 failed,1 intentional skip. An existing request-log assertion raced the asynchronous concept request in desktop and mobile. Changed it to wait for the expected requests. A later source pass also covers asset discovery on already-planned briefs and aligns the radio controls. |
| full-check4.log |Interrupted after1402 unit/API tests, intermediate stages and30 browser passes. The owning execution session and test server no longer existed when resumed. Cause not established. This is not a full pass. |
| connection-unit.log |22 tests passed across2 files. Connector recovery errors and asset-choice routes. |
| connection-browser1.log |16 passed,2 failed. The first wider browser used a modal and blocked desktop drag/drop. The mobile close-button locator also needed the new shared header. |
| connection-browser2.log |9 passed,1 failed. The non-modal browser still overlapped the drag target. Changed the desktop layout to reserve visible space for the brief. |
| connection-browser3.log |2 passed. Desktop drag/drop, mobile Add, category controls and zero-violation axe scans. |
| full-check5.log |1405 unit/API tests across88 files and every intermediate stage passed, including12 desktop tests. Browser131 passed,4 failed,1 intentional skip. Heading order in the new summary and overlapping slow polls after opening details failed on desktop/mobile. Changed the summary to h2 and removed the irrelevant tab dependency from polling. Failure traces preserved in full-check5-artifacts. |
| full-check6.log |PASS.1405 unit/API tests across88 files, six Luau scenarios/four source compilations,14 plugin groups/plugin plus eight injected compilations, six guards, TypeScript/Vite,12 desktop tests, production smoke,135 browser tests. One intentional mobile resizer skip. |
| desktop-final.log |13 desktop tests passed after the external-link policy fix. |
| desktop-final2.log |13 desktop tests passed after the CSP image change. Native2 exposed the separate request filter below. |
| desktop-final3.log |14 desktop tests passed after both thumbnail policy layers were fixed. |
| native1/RESULTS.json |Real packaged discovery/search HTTP200,20 results. Mock approval and axe checks passed. Offscreen lazy-viewer assertion failed. Visual inspection also exposed blocked thumbnails. Owned instance59773 closed. |
| native2/RESULTS.json |Discovery/search passed. Stronger image pixel assertion failed because the request filter still blocked CDN images. Owned instance55190 closed. |
| native3/RESULTS.json |PASS. Real packaged discovery/search/thumbnails, browser-link dispatch, offline architecture hiding, mocked button approvals and one plan request, zero axe violations/uncaught renderer errors, retained real WalkAnim pose change, normal/minimum sizes. Owned instance62976 closed. |
| live/RESULTS.json |Six actual searches,18 options. Six dummy parts and eight loadable animation clips extracted. No approvals, imports, model calls or native playback. Owned service closed. |

Tests use offline fixtures. The browser regression server now explicitly uses an offline Marketplace provider and does not import environment credentials. Native Studio extraction observations are separately identified in `live/` and do not prove gameplay.

Paid inference $0. Reservations $0. Last known balance $4.994992 at2026-09-20T23:34:36.757Z, not refreshed. Studio remains in Edit mode. No user scripts or place objects were changed.

Final executable: release/takko-asset-choices-20260921-ready/Takko-win32-x64/Takko.exe. The desktop shortcut targets it, with the prior link backed up. Final resource hashes are in package-ready-hashes.json. No running user app was restarted.

The final policy-only changes were followed by test:desktop and native verification. Unit/API, Luau, plugin, guards, frontend build, production and the full browser suite were not repeated afterward. Their last results are full-check6. The frontend/backend source did not change after that run.
