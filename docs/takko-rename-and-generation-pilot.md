# Takko rename and live generation pilot

Date: 2026-09-15. The user authorized the Takko brand, paid generation tests, and disposable use of Studio Place1.

## Application

The web interface, desktop application, plugin display name, downloads and startup messages now use Takko. The existing `Forge Desktop` application-data directory, `FORGE_*` environment variables, plugin protocol IDs and generated instance namespaces remain compatible with existing projects. Historical research retains its original product names.

Windows package: `release/Takko-win32-x64/Takko.exe`. The desktop shortcut is `Takko.lnk`. This is an unsigned local build.

The shortcut was created and its target verified. Automatic approval review rejected the combined close/replace/launch action with “blocked by policy,” so the previous desktop remains open and the new visible launch has not been verified. The user can close the old Forge window and open Takko manually. Packaged resources passed the hidden Electron smoke.

## Original controlled pilot

Four real OpenRouter candidates received the same approved collect-and-sell specification, two sequential implementation tasks, an 8,000-token output allowance and a fixed Sol reviewer. Planning was intentionally excluded. A successful pipeline result means ready for Studio testing, not verified gameplay.

| Worker | Observed result | Recorded cost, USD |
| --- | --- | ---: |
| GPT-5.6 Luna | Rejected twice for emitting the future client's owned file; second response used a comment-only placeholder | 0.011315 |
| MiMo V2.5 | Provider request timed out after 120 seconds | 0.006307 estimated |
| DeepSeek V4.1 Flash | Output truncated at the configured allowance | 0.014437 |
| GPT-5.6 Sol | Three scripts and eleven scene nodes; compilation and model review passed | 0.171283 |

Total recorded: **$0.203342**, including the timeout estimate. Conservative dispatch reservations: **$0.890284**. Reservations are estimates rather than a provider-enforced spending cap. The combined original and follow-up reservations are limited to the announced $2. Credentials remain in memory and are omitted from evaluation artifacts.

Original immutable records: `.forge/evaluations/takko-generation-20260915/`. Sol's exact artifact is exported under its `exports/` directory. This is one sample per model with fixed ordering; provider latency, truncation and harness requirements prevent a broad model-quality ranking.

## Improvement driven by the trace

Luna's ownership failure exposed an instruction ambiguity: “complete JSON” was interpreted as retaining the entire game, including a placeholder for another task. Builders now receive an explicit current-task output contract listing their required files, permitted requirement IDs and files reserved to other tasks. Validation requires removing foreign entries entirely. It still rejects placeholders and does not silently discard model output.

A separate Luna retry uses the corrected prompt and the original 8,000-token allowance. Its cap is the original $2 minus the first pilot's full reservations, with no refund of unused reservation estimates. This is a targeted repair experiment, not part of the original comparison.

The retry completed both tasks, produced three scripts and eleven scene nodes, and passed compilation and model review. It made three Luna builder calls ($0.012362 total) and one Sol review call ($0.068069), totaling **$0.080431**. Native verification remains separate. In this sample, review dominates cost; reducing reviewer context or routing routine review more cheaply is worth evaluating only after independent gameplay checks.

Combined recorded cost: **$0.283773**, of which $0.006307 is the timeout estimate. Combined conservative reservations: **$1.245680**, below $2. No further paid calls were dispatched. Retry records and the exact Luna export are in `.forge/evaluations/takko-generation-retry-20260915/`.

## Native Studio boundary

The official installed Studio MCP connected to Place1. Inspection succeeded, but parenting newly created scripts into normal services failed with a capability error (`LoadUnownedAsset` and additional capabilities). Temporary probe folders were removed. No capability controls were weakened.

The supported manual handoff is opening the exported `.rbxlx` through Studio. The user was given the concrete Sol file path. Until that handoff and live assertions complete, native gameplay remains **not run**.

The user's first opening attempt produced a malformed path prefixed with `C:/WINDOWS/system32/` and embedded quotes; this was a file-opening error, not a runtime game result. An identical, hash-verified copy with valid XML syntax is available at `C:/Users/7474g/Downloads/Takko-Sol.rbxlx`. Use Studio's file picker to select it directly from Downloads.

The independent oracle in `tests/native-generation-acceptance.luau` uses real client remotes and independent server/HUD observations, with JSON-safe state across fresh MCP executions. It covers malformed actions, distance checks, burst cooldown, capacity, sale/reset, empty sale, respawn retention and repeated sale. Solo checks cannot establish multiplayer isolation or real keyboard/button usability; those require separate live evidence.

## Validation

The final `npm run check` passed with all changes: **174 unit/API tests**, **10 desktop tests**, **34 browser scenarios**, six offline combat scenarios, ten plugin mock scenarios with injected-source compilation, six guard cases, TypeScript, production build and HTTP smoke. The task-output correction also passed 49 focused engine/task tests. The native oracle passed its offline cursor regression and Luau compilation. These checks do not establish Roblox gameplay success.
