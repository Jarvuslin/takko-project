# Desktop setup

Run `npm run desktop` to build and open Takko. The development checkout requires Node.js and npm. Packaged applications include their runtime.

## Packaging

`npm run desktop:package` creates an unsigned Windows application directory at `.forge/update-stage/app/Takko-win32-x64`. Packaging refuses to overwrite existing output. Close an installed app before replacing its files. Keep one rollback until the replacement has been verified.

The package includes the web interface, local service and Studio plugin. An installed Luau compiler is copied when available. Missing compilation prerequisites produce an error.

## Data and credentials

Windows desktop data lives in `%APPDATA%/Forge Desktop`. Projects, settings and encrypted credentials are separate from this checkout. The legacy directory and `FORGE_*` identifiers are retained for compatibility.

Provider connections are encrypted with Windows CurrentUser DPAPI in `provider-keys.dpapi`. Failed decryption does not fall back to plaintext. Other platforms use session-only keys. The desktop does not import the repository's `.env` file.

## Connection and lifecycle

Electron starts a local service on an available loopback port. Service connection details show its address and project directory. Configure the Studio plugin with that address after a restart.

The supervisor owns its service process, handles startup deadlines and provides explicit retry. The renderer runs with sandboxing and context isolation. The local API is not an operating-system sandbox against other programs running as the same user.

Never replace or restart an existing user session as part of a test. Use disposable test workspaces.

## Tests

`npm run check` builds the app and runs offline, browser and Electron checks. `npm run test:desktop:native` is an additional invisible Electron smoke test. Neither command verifies Roblox gameplay or makes paid model calls.
