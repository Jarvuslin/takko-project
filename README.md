# Takko

Takko is an experimental desktop app for building Roblox projects from a game request and selected Creator Marketplace assets. It combines configurable model providers, Luau generation, asset inspection and a Roblox Studio bridge.

The app produces projects that are **ready to test**. Exported code and passing offline checks do not establish that a game works in Studio.

## Development

Use Node.js 24, npm and Roblox Studio on Windows.

```powershell
npm ci
./scripts/setup-luau.ps1
npx playwright install chromium
$env:LUAU_BIN_DIR = '.forge/tools/luau'
npm run check
npm run desktop
```

`npm run dev` starts browser development on port 4318. The product targets desktop layouts.

Configure models and provider credentials through the Models interface. Windows provider connections are encrypted for the current user. Never commit `.env`, credentials, project workspaces or exported user games.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run desktop` | Build and open the Electron app |
| `npm run desktop:package` | Create an unsigned Windows application in `.forge/update-stage/app` |
| `npm run build` | Typecheck and build the web app |
| `npm test` | Run offline unit and integration tests |
| `npm run check` | Run the complete local verification pipeline |
| `npm run benchmark -- --help` | Inspect the benchmark command interface |

See [desktop setup](docs/desktop.md) and the [source map](docs/README.md).

## Storage and Studio

Desktop data lives in `%APPDATA%/Forge Desktop`. The earlier Forge name remains in storage paths, `FORGE_*` environment variables and `plugin/Forge.plugin.luau` for compatibility.

Install the Studio plugin through the application and connect it to the local service. The adapter builds inside its own generated namespace. It does not edit arbitrary existing games.

Tests use mocked model responses. Native Studio gameplay verification and paid inference are separate, explicit operations. Test output is ignored by Git.
