# Desktop and execution foundation

Implementation date: 2026-09-14. This is the first build slice following the [55-resource architecture review](../research/18-resource-survey-and-architecture.md).

## Delivered

Forge now has a runnable Electron desktop shell around its React interface, with a supervised local backend. The existing custom Studio bridge now records delivery before sending a command, rejects stale work and preserves uncertain outcomes. This establishes a local execution foundation for later native MCP, asset and gameplay-testing work.

Three subagents handled the desktop service/shell, durable bridge, and independent review/compiler support. The lead integrated the API, UI, plugin and regression tests. Independent review found overlapping-click, reconnect and concurrent-edit races; these have dedicated mock regressions. This division was used to implement Forge; the application itself still uses its existing model pipeline. No token-saving comparison was measured.

### Desktop

- One sandboxed Electron window and one owned service process, with private readiness messages, a startup deadline, heartbeat lease, graceful shutdown and explicit retry.
- Separate desktop project storage and an OS-assigned loopback port. Existing browser projects and in-memory provider keys are not automatically transferred.
- Packaged web/plugin resources and Luau compiler discovery outside the repository. An explicit invalid compiler location fails instead of silently falling back.
- An unsigned Windows application directory, with its runtime included. See [launch, packaging and connection instructions](desktop.md).

### Studio command lifecycle

| State | Meaning and permitted recovery |
| --- | --- |
| `queued` | Never delivered under protocol 2. Can be cancelled; expires if not delivered in time. |
| `dispatched` | Delivery recorded durably before returning the command. Awaiting plugin confirmation/execution and receipt; never redelivered automatically. |
| `unknown` | Dispatch may have run. Blocks project writes and further work on that Studio session until a matching receipt resolves it. |
| `done` | Matching receipt accepted; success and failure remain distinct. |
| `cancelled` | Cancelled while queued, invalidated before delivery, or the plugin confirmed execution never began. |
| `expired` | Queue deadline passed before delivery. |

The default start deadline is 60 seconds from enqueue. Delivery has a separate 10-minute outcome deadline. A plugin confirmation after the start deadline does not run the command; it reports `not_started`. If a backend restart interrupts dispatched work, it becomes unknown; a matching late receipt can settle it.

Receipts bind the Studio session, operation, dispatch identifier, project revision and artifact hash. Test work also snapshots the expected test identifiers and sources. Empty suites, missing checks, duplicate checks and nonpassing checks cannot establish test success. Project eligibility is checked again before delivery and confirmation.

The app rejects project mutations while that project has dispatched or unresolved Studio work. Queued work can become stale and is checked before delivery. The plugin serializes confirmation and connection changes, retains delivered work through heartbeat polls, retries lost acknowledgments, and rechecks owned objects after source staging yields. Failed staging preserves the existing scene; failed harness setup removes temporary instances. Timed-out test threads are cancelled.

### Compatibility and limits

- Existing version-1 pairing data is preserved, but old plugin sessions cannot start new operations. Download the updated Forge plugin and reconnect. Previously queued version-1 commands become unknown because historical delivery cannot be proven.
- The plugin receipt outbox is still in memory. If Studio or the plugin dies after dispatch and loses its receipt, the backend conservatively keeps the operation unknown. There is no manual reconciliation UI yet; this is not automatic recovery of completed Studio actions.
- Local API write guards and plugin ownership checks reduce races; they are not a distributed transaction or a general sandbox for generated Luau.
- The desktop port can change on restart. The downloaded plugin embeds the current endpoint; an existing installation needs its endpoint updated. Persistent discovery is pending.
- The existing Forge namespace restriction remains. Arbitrary existing-game editing, native MCP integration, asset generation/retrieval and independent gameplay scenario runners are later slices.

## Verification

All new automated tests use isolated data or explicit doubles. The full repository check covers unit/API behavior, offline Luau, plugin mocks, guard probes, TypeScript/build, desktop service lifecycle, production serving and desktop/mobile browser behavior. A separate hidden Electron smoke runs a real utility process and sandboxed renderer.

`npm run check` passed: **152 unit/API tests, nine desktop tests and 34 browser cases**, plus offline Luau, plugin compilation, guard probes, build and production smoke. The final reconnect change was subsequently rechecked with `npm run test:plugin`: **10 mock scenario groups**, with the plugin and eight injected sources compiled successfully. Native Electron smoke and unsigned packaging also passed; [desktop documentation](desktop.md) describes their scope.

No native Roblox Studio apply/playtest was performed for these changes. Historical native results apply only to their recorded builds and fixtures. No new paid model calls, hosted deployment, remote Git setup, installer, signing or updater was performed. The existing live server and Studio place were preserved.

## Next implementation gates

1. Verify protocol-2 apply, failure, lost-acknowledgment and playtest behavior in a confirmed disposable Studio place.
2. Add an explicit reconciliation workflow for lost plugin receipts, with recorded inspection evidence; never infer that a timed-out command failed.
3. Add the official Studio MCP adapter with session/capability discovery and the same operation ownership rules.
4. Introduce independent scenario definitions and observations before expanding agent autonomy; add asset jobs and verified project retrieval afterward.

The broader game-generation architecture remains in progress. These changes do not establish production readiness, complete Lemonade parity or model-quality parity.
