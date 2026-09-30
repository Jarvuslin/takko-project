# Repository cleanup

Cleanup started 2026-09-30 UTC. Scope is repository and disk cleanup only. Generation changes, workspace migration, app updates and paid tests are deferred.

## Before deletion

The working tree was clean at `4622b0f`. That commit preserves the historical reports, scripts and root exports. This report is committed before removing tracked files.

The active app is `release/takko-chat-clean-20260929/Takko-win32-x64/Takko.exe`, main PID 29192, service PID 45400 on port 64119. Its workspace is `.forge/chat-clean-20260929`. Studio PID 45456 and seven StudioMCP processes are left untouched. The original `%APPDATA%/Forge Desktop` workspace also contains projects and an encrypted vault and is preserved.

## Cleanup decisions

- Remove inactive generated release bundles after checking running executable paths and checking for local project or credential files.
- Remove only byte-identical duplicate files from old evidence-copy directories under `.forge`, retaining unmatched files for review. Do not discard unique evidence, projects, settings or credentials.
- Consolidate historical task reports into current product, development and maintenance documents. Git at `4622b0f` retains the exact historical reports and exports.
- Retain run evidence used by tests, recorded failures, third-party evidence and diagnostic scripts with uncertain callers.
- Update agent instructions to prevent dated delivery workspaces, evidence copies and duplicate state documents.

## Verification

Pending cleanup and the full offline check. No paid calls or balance query authorized. Cost: $0.

## Documentation phase

Removed 147 superseded top-level task reports, keeping their exact contents in Git at `4622b0f`. Replaced the root README, research index, old TODO checklist and duplicated agent state with current entry points. `docs/README.md` maps the source and retained reports. Historical links in retained top-level documents now point to the pre-cleanup Git snapshot. Existing evidence files are unchanged.

Updated `AGENTS.md` and desktop guidance to prohibit repeated dated deliveries, fresh user workspaces and evidence-copy trees. Kept the 66 scripts because many are test imports or native diagnostics and absence from package scripts is not evidence that they are disposable.

## Desktop shortcut

`C:/Users/7474g/OneDrive/Desktop/Takko.lnk` pointed at the obsolete `takko-fighting-recovery-20260923-ready` bundle. It now points at the active chat-clean bundle with the explicit existing `.forge/chat-clean-20260929` workspace. Target and arguments were read back and verified. No app launch or restart occurred. Updates in place and consolidation into the original AppData workspace remain future work.

## Product issues remain

| Reported issue | Cleanup finding or evidence boundary |
| --- | --- |
| A, B, F: planning failures and cost | The prior source/run diagnosis in research report 31 identifies area-planning overhead and fatal output validation. Cleanup does not fix those paths or measure a cheaper run. |
| C: broken exported game | Root exports and native evidence are retained. The animation contradiction and full user-game behavior remain unresolved. |
| D: chat/assets/Studio | Latest implementation report is retained. No new live acceptance claim. The desktop shortcut did point to an older build and was corrected. Seven existing StudioMCP processes were observed and left alone. |
| E: green tests versus failed use | Offline checks cannot establish model quality or native gameplay. The improvement plan requires real-input regression tests and an authorized Studio acceptance run. |
| G: repository and delivery clutter | Dated bundles, copied evidence trees, per-task reports and duplicated state documentation accumulated. Those are the cleanup targets. Multiple data workspaces still need a deliberate migration. |
