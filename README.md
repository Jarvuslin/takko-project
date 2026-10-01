# Takko

Takko is a local, desktop-only app that turns a Roblox game request and selected Marketplace assets into Luau, scene data and an exported place. It uses configurable model providers and a Studio bridge. Previously named Forge, it retains the `FORGE_*` identifiers and `Forge Desktop` storage directory.

**Current limitation:** automated playable generation remains unproven. Later paid probes completed review and produced code, but the original build passed 18/20 contracts without native gameplay proof. A [manually repaired derivative](docs/guided-demo-rehearsal.md) now passes ten scenarios in a reopened Studio export. That is not a successful Takko generation. See the [current diagnosis](docs/generation-diagnostic-brief.md) and [improvement plan](docs/improvement-plan.md).

## Start here

- [Current state, running app and budget](research/notes/continuation.md)
- [Documentation and source map](docs/README.md)
- [Desktop setup and storage](docs/desktop.md)
- [Cleanup and maintenance rules](docs/repository-maintenance.md)
- [Research evidence](research/README.md)

The installed app is `release/Takko-win32-x64/Takko.exe`. The Desktop Takko shortcut opens it with the default `%APPDATA%/Forge Desktop` workspace. Seven projects, five profiles, three presets and the encrypted provider connection survived two launches after consolidation. See the current-state file for live PIDs and the retained rollback directories.

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
