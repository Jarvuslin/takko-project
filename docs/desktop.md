# Takko desktop implementation

Takko is the current product name. Existing desktop storage deliberately remains in the legacy `Forge Desktop` directory, preserving projects, saved model profiles and pairing state. Internal `FORGE_*` settings and project namespaces are unchanged.

The first desktop slice keeps the current React interface and Node backend. Electron owns one local service process and one sandboxed window. It runs independently of the existing browser development server.

## Run and package

```powershell
npm run desktop
```

This builds the existing UI and bundled service, then opens Takko. A development checkout requires Node/npm for the build; the packaged application includes its runtime.

```powershell
npm run desktop:package
```

Creates an **unsigned application directory** in `release/Takko-win32-x64` on this Windows host. Open `Takko.exe` inside that directory. This is not an installer, signed release or automatic-update deployment. Keep the whole directory together. Packaging intentionally refuses to overwrite an existing output directory; move a previous local bundle aside explicitly before producing another at the same version.

Versions are pinned in the lockfile: Electron 44.3.0, esbuild 0.28.2 and Electron Packager 20.3.0. The service is bundled as CommonJS; runtime code does not depend on the repository's `node_modules`, Vite or TSX. Static web and plugin resources are copied into the application directory. Existing locally installed Luau compiler is copied if present; otherwise compilation continues to report a missing prerequisite, never a fabricated pass.

## Project and connection behavior

- Desktop projects live under `%APPDATA%/Forge Desktop/projects` on Windows, separate from this checkout's `.forge/projects`.
- Desktop does not import repository `.env` files, existing browser projects, provider profiles or session-only keys. Configure provider access in its existing Models interface.
- The service binds `127.0.0.1` on an available OS-assigned port. **Service → Connection details** displays the current address and project directory.
- The Takko Studio plugin has an editable endpoint field. Downloading a plugin from the desktop service sets its initial endpoint to that service's current port. An already installed plugin needs the new endpoint after a desktop restart; persistent discovery is future work.
- Existing browser server processes and session keys remain untouched. There is no attach-to-existing-server path and no PID search or broad process termination.

## Lifecycle and boundary

`desktop/supervisor.mjs` manages starting, ready, failed, stopping and stopped states. A child reports its port through private process messaging with a fresh nonce. The window never adopts a service by polling an occupied port. A startup deadline handles hung launches. Explicit **Service → Retry service** handles recovery without silently restarting a worker and discarding session-only keys.

Shutdown sends an authenticated process message, closes the service's listener and idle HTTP sockets, then enforces a termination deadline against only the owned process. A heartbeat lease also stops a service whose desktop owner disappears. Interrupted generation is subject to the backend's existing persisted recovery behavior; this is not a promise of resuming an in-flight model request.

The renderer has no Node integration, preload API or renderer-to-main IPC. Context isolation, sandboxing, same-origin navigation/network restrictions, blocked popups/webviews, denied permissions and a restrictive CSP are configured. The backend retains its existing origin and Studio pairing checks. The loopback API is not an OS sandbox against another process running as the same user.

## Verification

```powershell
npm run test:desktop
npm run test:desktop:native
```

`test:desktop` builds desktop resources from the current `dist` web build, then checks lifecycle races, readiness ownership, startup failure, lost IPC, shutdown escalation and policy decisions. A real bundled Node worker test uses a disposable OS temp directory, serves the interface/plugin and local API, ignores a wrong shutdown nonce and exits gracefully. `npm run check` runs this after rebuilding the web UI.

`test:desktop:native` is a separate native Electron smoke: actual utility process plus an **invisible** sandboxed browser window, local API response, CSP and shutdown. It does not open Studio or make model calls. Chromium can retain cache handles until process exit, so its printed temporary smoke directory may remain for later OS cleanup.

These checks are distinct from Roblox Studio integration tests, game-quality evaluation, a signed distribution test and visual review of the visible desktop app.

Verified in this implementation pass: all nine desktop tests passed, the separate native Electron smoke passed, and an unsigned Windows x64 bundle was produced successfully. The native smoke caught an ESM startup deadlock caused by awaiting readiness at module top level; the desktop now registers its readiness callback without blocking module evaluation. The visible desktop app and packaged executable have not been manually reviewed.

## References

- [Electron security recommendations](https://www.electronjs.org/docs/latest/tutorial/security)
- [Electron utilityProcess API](https://www.electronjs.org/docs/latest/api/utility-process)
- [Electron Packager options](https://electron.github.io/packager/main/interfaces/Options.html)

## Provider keys

Models now validates a provider before browsing its catalog or adding a model. One connection serves all models at that provider and endpoint. Windows stores connections in `%APPDATA%/Forge Desktop/provider-keys.dpapi`, encrypted for the current Windows account. Reopening Takko restores keys without putting them in browser storage or project JSON. Replace key validates the replacement before saving. Disconnect removes the provider key and keeps model profiles. A failed unlock does not fall back to plaintext. Other platforms remain explicitly session-only.

A dated package can be built with `TAKKO_PACKAGE_OUT` pointing to a new directory under `release`, then updating the desktop shortcut to that package. This leaves existing packages available for rollback. Do not overwrite a running app.
