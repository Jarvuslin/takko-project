# Design lab verification

2026-09-21. Full final `npm run check` exited 0.

| Stage | Final result |
| --- | --- |
| Vitest | 1,369 passed across 84 files |
| Luau | Six scenarios passed, four sources compiled |
| Plugin | 14 mocked groups passed, plugin and eight injected sources compiled |
| Guards | Six fixtures behaved as expected, including negative rejection fixtures |
| Build | TypeScript and Vite passed |
| Desktop | Ten passed |
| Production smoke | HTML, bundle, API and unknown route passed |
| Browser | 108 passed, 54 desktop and 54 mobile, 4.5 minutes |

No required stage skipped. Native Studio was not exercised. Offline tests and browser previews do not establish a working generated game.

First full run: 105 browser passes and three failures. Two exact-label select locators were corrected to the accessible role/name. One mobile test was corrected to scroll the existing lazy preview into view before checking playback. Original log and traces remain in full-check-1.log and full-check-1-failures. Final log: full-check-final.log.

Final A/B/C screenshots are original browser captures at 1440×900, saved as JPEG without image editing. Each was visually inspected and refined. First-pass images and the failed inspector layout remain preserved. The final inspector has a separate screenshot.

Cost reconciled: no provider calls, actual $0, reservations $0. Balance not refreshed. Last known $4.994992 at 2026-09-20T23:34:36.757Z. No automatic retries of paid work, no credential reads, no Studio mutations.

Live isolated preview: http://127.0.0.1:4356/design-lab, PID35536. Existing preview4355/PID40768 and key service4347/PID30440 untouched. Test-owned4319 exited normally. Detailed design and limitations: ../../design-lab-implementation.md.
