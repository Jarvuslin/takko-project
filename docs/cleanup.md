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
