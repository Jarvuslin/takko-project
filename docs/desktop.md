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

Creates an **unsigned application directory** in `.forge/update-stage/app/Takko-win32-x64` on this Windows host. Packaging refuses to overwrite existing output. After approved shutdown, install that candidate at the single stable path `release/Takko-win32-x64`, retaining the previous working delivery for rollback. See `research/notes/continuation.md` for the app currently running. Initial cutover is complete with seven original projects and encrypted connection restoration verified across two launches. Do not create another dated user-facing bundle.

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

The service tracks StudioMCP children it actually starts and closes them on normal exit and shutdown, including lease expiry. It does not kill processes by name. Forced OS termination cannot execute those exit hooks. The source server also closes owned children on SIGINT/SIGTERM.

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

`TAKKO_PACKAGE_OUT` remains available for isolated packaging tests. Do not use it to accumulate dated user-facing deliveries. Keep the current shortcut, bundle and workspace until a verified update/migration is ready. Never overwrite a running app.


## Live service investigation, 2026-10-01T00:51:43.073Z

Read-only diagnosis of the September 30 service disappearance. No app, service, Studio, project or vault was changed. No inference, restart or launch occurred.

Most likely cause, not proven: the service's wall-clock heartbeat lease expired on wake. Windows Power-Troubleshooter event 1 records sleep at 2026-09-30T19:34:32.762Z and wake at 22:05:55.758Z (15:34 to 18:05 Toronto). This matches the reported 18:05 loss of the service while the main process remained alive. The installed release, not just source, contains Date.now() - heartbeatAt > 10000 followed by shutdown (service.cjs lines 96546-96571). The supervisor sends heartbeats every two seconds. Neither component handles suspend/resume. If the service timer executes before the first post-wake heartbeat, it exits normally even though its parent remains alive. Scheduling at the actual incident was not recorded, so causation cannot be proved.

Correction: the service survived the same day's 02:40–09:08 Toronto sleep. The preserved session read `/api/models` on port 56794 at 09:36 and recorded "Confirmed alive" at 12:19. Lease expiry is therefore a wake-ordering race, not a deterministic consequence of sleep. Heartbeat-first ordering survives while the old check-first ordering can exit. This correction does not prove the later incident's cause.

No Takko-specific Application Error, Application Hang or Windows Error Reporting event was found in the inspected September 30 window. No process-termination audit event 4689 was available. Canonical storage has no service/heartbeat lifecycle log. Installed main.mjs discards service stdio (line 51), and supervisor.mjs does not preserve exit code, signal or reason. The lease itself exists only in memory. Historical kernel WER reports emitted near wake reference older dump dates and are not evidence of a new Takko crash.

Reviewed test and rehearsal cleanup uses its owned child/app objects, with isolated data directories. No evidence was found of a command targeting the live service. This does not substitute for missing process-exit telemetry or conclusively rule out every external cause.

A later, separate event changed current state: Windows reports last boot at 2026-10-01T00:20:59.500Z (September 30, 20:20:59 Toronto), with Kernel-Power event 41 at 20:21:07 reporting an unclean prior shutdown. No Takko process exists at this investigation. This later reboot explains why the old main PID is now gone, not the earlier service-only disappearance.

Data checks: all eight canonical top-level project JSON files parse successfully and their modification timestamps predate the incident. The encrypted provider-keys.dpapi remains present, 456 bytes, last modified 2026-09-30T04:14:46Z. No corruption or incident-time write was observed. Vault decryption was deliberately not attempted, so decryptability and any unsaved renderer state are not established.

Safe recovery: normal close and reopen of the existing installed Takko application, preserving canonical data and the existing encrypted vault. Since it is currently closed after the reboot, the user can open release/Takko-win32-x64/Takko.exe normally. Do not install the staged candidate or restore/copy data as a recovery step. No recovery was performed here.

Proposed follow-up, not implemented: make liveness checks suspend/resume-aware, allow heartbeat re-establishment after wake while preserving orphan cleanup, and persist bounded redacted lifecycle records including exit code/signal, last heartbeat age and shutdown reason. Add sleep/resume ordering and genuine parent-loss regression tests. No runtime code changed and no test suite was run for this read-only diagnosis.

## Step 1b: service ownership and wake ordering

The follow-up is now implemented in source. A dedicated transferred IPC port makes parent disconnection the primary orphan signal. Electron 44.3.0's `parentPort` only exposes message delivery, so the main process retains one `MessageChannelMain` endpoint until its worker exits. The service listens for the other endpoint's `close` event. Node fork tests use Node's native `disconnect` event. See [Electron MessagePortMain](https://www.electronjs.org/docs/latest/api/message-port-main).

The two-second backup check grants a fresh ten-second heartbeat window when its callback arrives more than four seconds after the previous check, or when the clock moves backwards. It does not fabricate a heartbeat. Normal checks still expire an orphan without heartbeats, including after a wake grace period. IPC loss exits immediately regardless of lease grace. Long event-loop stalls receive the same conservative grace as sleep.

Each managed exit overwrites `service-exit.json` in that service's own data directory. Its fixed fields are version, UTC time, PID, reason, exit code and heartbeat age. No key, nonce, request, source, stack or provider response is serialized. A write failure cannot block exit. Forced OS termination or power loss can bypass the exit hook, so an absent record is not proof of any specific cause.

Focused verification: 21 desktop tests passed, including both wake orderings, exhausted wake grace, ordinary heartbeat loss, clock rollback, real bundled Node IPC disconnect and redacted exit fields. A separate real Electron utility-process test passed when its transferred owning port was closed, with `parent-disconnect` recorded before lease expiry. These isolated checks do not reproduce an actual Windows sleep or prove the historical incident's cause. No paid calls or live-process changes occurred.

Step 2 completed on the step 1b source (`003478e`): one clean `npm run check`, exit 0. Build/typecheck, 1876 unit tests in 148 files, 6 Luau scenarios, 16 plugin scenarios plus plugin/8 injected source compilations, 6 guard cases, CSS lint (0 errors, 274 existing warnings), 21 desktop tests, production smoke, 107 browser tests and all 10 Electron journeys passed. No worker crash or rerun. Log: `test-artifacts/service-fix-full-check.log`. The unsigned candidate is staged at `.forge/update-stage/app/Takko-win32-x64`, not installed. Previous stage retained at `.forge/update-stage/previous-staged-app` after automatic approval review blocked deletion. The user's installed process and data were untouched.
