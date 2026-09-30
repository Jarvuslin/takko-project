# Takko

Takko is a local, desktop-only app that turns a Roblox game request and selected Marketplace assets into Luau, scene data and an exported place. It uses configurable model providers and a Studio bridge. Previously named Forge, it retains the `FORGE_*` identifiers and `Forge Desktop` storage directory.

**Current limitation:** the two latest paid runs failed during planning before writing game code. Successful offline checks do not establish playable generation. See [the diagnosis](research/31-planning-overhead-and-direct-build.md) and [the improvement plan](docs/improvement-plan.md).

## Start here

- [Current state, running app and budget](research/notes/continuation.md)
- [Documentation and source map](docs/README.md)
- [Desktop setup and storage](docs/desktop.md)
- [Cleanup and maintenance rules](docs/repository-maintenance.md)
- [Research evidence](research/README.md)

The running bundle is `release/takko-chat-clean-20260929/Takko-win32-x64/Takko.exe`. Its shortcut selects `.forge/chat-clean-20260929`. A seven-project consolidation is staged in `.forge/update-stage/workspace`, with its encrypted vault verified by reopening. Cutover to `release/Takko-win32-x64/Takko.exe` and `%APPDATA%/Forge Desktop` requires approved shutdown and a fresh migration check. Use the current-state file before touching a running app.

## Development

```powershell
npm ci
./scripts/setup-luau.ps1
npx playwright install chromium
$env:LUAU_BIN_DIR = '.forge/tools/luau'
npm run check
```

`npm run dev` serves browser development on port 4318. `npm run desktop` builds and opens the desktop app, normally using `%APPDATA%/Forge Desktop`. Do not launch it as a replacement for the user's current app without checking the current workspace and getting restart approval.

`npm run check` runs build/typecheck, Vitest, Luau, plugin mocks, guards, CSS lint, desktop lifecycle tests, production smoke, desktop browser tests and Electron journeys. Native Studio gameplay and paid model trials are separate.

## Product boundaries

Describe the game, answer consequential questions, review attached assets, then approve the proposal and build. Review the generated source and export a place or apply through the Takko plugin. The adapter works in its own namespace. It does not edit arbitrary existing games.

On Windows, validated provider connections can persist through CurrentUser DPAPI encryption. Never move or reset a workspace casually. Provider settings, projects and encrypted credentials belong to the user.

Takko stops at **ready to test**. Animation permissions, physics, visuals, multiplayer behavior and complete gameplay require a real Studio test. Static asset inspection is screening, not a guarantee of safety.

Private repository: [Jarvuslin/takko-project](https://github.com/Jarvuslin/takko-project).
