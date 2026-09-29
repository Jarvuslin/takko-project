# Takko settings workspace

Implemented the approved Figma settings design on 2026-09-20. Models, Routing and Budget are separate pages with focused editing dialogs. The native-component Studio delivery gap remains open.

## Interface

- Models has My models and Providers tabs, search, provider filtering, compact rows and an add/edit dialog. The provider directory uses the five supported adapters. Catalog lookup can preview an unfinished profile without saving it. Manual model IDs and configured rates remain available.
- Provider connection status reports whether a key is available. It does not claim that the provider has been tested. Keys remain per profile in server memory. Reusing another profile's key requires an explicit selection and matching provider and endpoint.
- Routing displays Research, Planner / lead, Builder, Reviewer and Repair. Each opens a drawer with one primary and up to two distinct fallbacks. The bulk primary action preserves other fallbacks. Existing component route overrides are preserved and shown under advanced details.
- Budget separates generation defaults, the project cap and repair rounds. Project spending, reservations and available budget use real state. A compact composer dialog sets a limit for the next explicit plan/build/repair action.
- Hash routes survive reload, including project-specific URLs. Unsaved forms guard navigation and dismissal. Dialogs retain keyboard focus and keep actions visible while their contents scroll. The desktop routing rows fit a 720-pixel-high view. Mobile uses stacked rows.
- The existing taco mascot, dark theme, project workspace, Marketplace and Studio flow remain in use. Previous Figma boards and design sources are preserved.

## Backend behavior

Section updates merge into the latest settings instead of replacing unrelated sections. Individual profile create/update/delete endpoints preserve other profiles and their credentials. Removing a profile removes its references from every route. Catalog previews validate endpoints and never persist the draft.

The optional generation limit covers planning, building, fallbacks, review and repairs for one brief. A persisted generation envelope records its budget and starting charge index. A fingerprint of the request, answers and attachments starts a new cycle when the brief changes. Retrying or updating an unchanged brief does not reset its spend. Active cycles retain their original limit when global defaults change. An explicit override changes the cap without clearing prior spend.

Call admission checks generation spend and outstanding reservations as well as the existing project and reservation limits. Unknown usage retains its conservative reservation. Configured rates and reservations are estimates. Actual provider charges can exceed them, so this is not an invoice-level guarantee. Legacy settings without a generation default or override retain the existing project-budget behavior.

## Studio gap

The current custom bridge rejects artifacts containing native components and directs users to the complete place export. For example, a captured rig includes an instance hierarchy and references beyond generated script text. The bridge does not yet deliver those components through its controlled apply path. Silently omitting them would produce an incomplete build.

This implementation does not add native-component transport, Rojo live sync, a unified MCP/plugin identity or arbitrary existing-game editing. Adding a Rojo connection alone would not establish those behaviors. See [the connection assessment](studio-connections-review.md). No native Studio session was performed.

## Verification

Full `npm run check` passed with exit 0, with no retry or skipped stages:

| Stage | Result |
| --- | --- |
| Vitest | 1,295 tests in 78 files passed |
| Luau | 6 offline combat scenarios passed |
| Plugin | 14 mock scenario groups passed, plugin and 8 injected sources compiled |
| Guards | 6 fixtures produced their expected outcomes |
| Build | TypeScript and Vite passed |
| Desktop | 10 tests passed |
| Production | HTML, bundle, API and unknown-route smoke passed |
| Browser | 68 desktop/mobile tests passed |

Log: [full check](results/settings-ui-check.txt). New coverage includes settings isolation, credential reuse, transient catalog lookup, route cleanup, persisted generation caps, retry behavior, budget admission, URL routing, unsaved changes, provider flows, accessibility and modal layout.

After the full build snapshot, a final CSS spacing refinement and budget explanatory copy were applied. A fresh TypeScript/Vite build and two desktop/mobile accessibility and layout tests passed, including a routing footer viewport assertion. See [final layout check](results/settings-ui-final-layout.txt). The other check stages were not repeated after these presentation-only changes.

Earlier failures are preserved. The initial browser launch failed on a malformed test regular expression, which was corrected. The focused browser rerun had 36 passes and 4 failures across 40 tests. Those failures identified delayed research-toggle feedback and escaping modal focus, each on desktop and mobile. Both defects were fixed before the successful full check. Logs and failure contexts remain in `results/settings-ui-browser-focused*.txt` and `results/settings-ui-focused-artifacts/`. The earlier focused unit run passed 12 tests before the final additional coverage was added.

Archived 19 changed prior result files under `results/settings-ui-check-artifacts/` and restored their original evidence files. Focused artifacts were separately preserved. Current `settings-ui-*.png` captures show the final presentation. Manual browser inspection covered the actual isolated app's Models, Providers, connection modal, Routing drawer and Budget page.

These checks use offline fixtures and mock providers. They do not verify paid-provider behavior, native Studio import, gameplay quality, animation, physics or an invoice hard cap.

## Runtime and cost

Actual app preview: http://127.0.0.1:4343/#models, PID 31044, exec session 92824, isolated data `.forge/settings-ui-preview`. It imports an empty provider environment. Existing static mock remains on 4342, PID 28132. At 02:55 UTC these were the only listeners among 4318, 4319, 4320, 4324, 4335, 4336, 4340, 4341, 4342 and 4343. Test-owned services exited. No existing Takko process was stopped or restarted.

Paid calls: 0. Cost: $0. Historical balance $1.529256456 recorded at 2026-09-16T22:44:44Z was not refreshed. Generation remains paused. No commit or push. Existing unrelated changes and earlier failure evidence were preserved. Ask before restarting any running Takko process because newly entered keys may exist only in its memory.
