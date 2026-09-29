# B foundation results

2026-09-21T16:28:14Z. Final full `npm run check`: exit 0.

| Stage | Final result |
| --- | --- |
| Unit/API | 1,369 passed across 84 files |
| Luau | Six offline scenarios passed, four generated sources compiled |
| Plugin | 14 mocked groups passed, plugin and eight injected sources compiled |
| Guards | Six fixtures behaved as expected, including negative rejection cases |
| Build | TypeScript and Vite passed |
| Desktop | Ten passed |
| Production smoke | HTML, bundle, API and unknown route passed |
| Browser | 112 passed, 56 desktop and 56 mobile, 6.5 minutes |

No required stage skipped. Native Studio not exercised. No claim of generated-game correctness or native animation playback.

Earlier results remain preserved: focused-1 13/18 passed, focused-2 9/10 passed, full-check-1 109/112 browser tests passed. Failure logs and traces describe mobile control overlap, review competing with the open dock, test locator/fixture naming errors and the old permanently visible project-list expectation. Final fixes passed the complete suite.

Original browser screenshots: workspace-final.jpg and inspector-final.jpg at1440x900, mobile-final.jpg at390x664. All visually inspected. First-pass captures remain. No image editing.

Cost: $0 actual, $0 reserved. No provider calls or credential reads. Balance not refreshed. Last known balance $4.994992 at2026-09-20T23:34:36.757Z. Keyless preview4357/PID13236 uses a copied project whose source hash remains unchanged. Existing services remain running. Test-owned4319 exited normally. No Studio changes and no native cleanup required. No commit/push.

Detailed report: ../../b-foundation-implementation.md.
