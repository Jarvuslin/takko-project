# Detailed context trace

This is a focused trace of the active transport/execution path and selected validation handlers. It is not an exhaustive review of every dependency, reflection entry, legacy processor, or test. Line numbers refer to original extracted source files. Recommendations are in the separate diagnosis document.

## Global state model

`App` owns a Core instance and reactive UI state. Core owns Tree, Watcher, Processor, StudioActions, RecordingManager, and StudioActionService. Tree's maps represent live instances, while `_lemonadeUniqueId` is stored on instances and can survive copies/reloads. The project machine owns pending agent work by inference from poll/result contracts; its durable state and queue semantics are unavailable.

Expected system invariants to validate: a result belongs to the session that received the request; a successful mutation has a recoverable acknowledgement; duplicate delivery does not repeat effects; source edits operate on the revision read; a test pass means its specified assertion actually ran; rollback status reflects actual restoration. These are desired contracts, not all properties satisfied by the current code.

Trust boundaries: browser identity to project selection; HTTP request to tool dispatch; tool parameters to DataModel mutation; play-session scripts to server/client capture; image buffers to upload destinations; result objects to agent reasoning. The client code does not expose the server-side implementation of any boundary.

## A. StudioActionService:_poll — 135-StudioActionService.luau:156

**Purpose.** Retrieves pending work for the attached project and starts the appropriate local processing. It also interprets version and project-machine lifecycle responses that affect whether polling should continue.

**Inputs and assumptions.** Uses mutable `self.projectId`, manifest version, HttpCore and JSON decoding. Assumes: the backend authorizes the user/project; request objects contain recognized tool names; response bodies match the expected schema; 403 means version incompatibility; 410 means machine absence; logging does not unexpectedly preempt cleanup.

**Outputs and effects.** Returns whether work arrived, spawns one task per request, can clear polling state, and can invoke the session-ended callback. It does not wait for each spawned action's completion.

**Block trace.** Missing project returns idle. HTTP request contains project and version. Status 403 decodes/logs then attempts to stop; status 410 stops and notifies. A valid 200 response dispatches requests, with task spawning intentionally preventing a yielding playtest from blocking future polls. Empty/204 responses return idle; malformed or unexpected responses are logged.

**Invariants/limits.** No request is sent if projectId is nil at entry. 410 stops before notification. Valid nonempty requests indicate activity even before execution succeeds. All dispatched actions share the same service/handler instance. There is no local lease/deduplication check in this function.

**Causal checks.** Why spawn? To avoid head-of-line blocking by yielding handlers. How is idle backoff decided? By presence of requests, not their successful completion. Why does cleanup depend on logging? Calls occur before stop in the version branch, so logger effects are part of the control path. First principle: acquiring work and executing work are separate state transitions; neither proves delivery of its result.

**Dependencies/external outcomes.** HttpCore can return nil, a synthetic timeout, or HTTP data. A late response may outlive the call's wait. The backend might duplicate/lease requests; this cannot be settled client-side. Studio global state can be changed concurrently by other requests or the user.

## B. _executeRequest / _postResult — 135-StudioActionService.luau:257 / 305

**Purpose.** Executes a named action and transports the terminal result back to the project machine. The local UI callback gives immediate feedback about a successful handler, independently of remote acknowledgement.

**Inputs and assumptions.** Request ID/tool/parameters/timestamp, actionHandlers, projectId, and HTTP helpers. Assumes: handler table remains available during dispatch; handler return is a result table; completed means the handler's intended local success; callback is safe; projectId still names the originating session; result delivery failures are recoverable elsewhere.

**Outputs and effects.** Arbitrary handler effects; a completed-path callback; optional sequential tile uploads; gzip result POST. An exception inside handler lookup/execution becomes a failed result. A callback or result-shape error outside that protected call is not covered by its pcall.

**Block trace.** Resolve method by name; call with the handler object as self. Convert exceptions to failure. On completed result, notify UI. If top-level tiles exist, POST individually and remove inline tiles only if all succeed; otherwise retain original tiles. Send gzip result. Only nil/encoding failure produces a second, minimal failure attempt. Other unsuccessful responses are logged.

**Invariants/limits.** All successful tile uploads precede metadata-only POST. Failure to upload one tile retains the full tile set for fallback. Local UI notification happens before result acknowledgement. No request-ID cache or result outbox is present. Origin project context is not an explicit argument to _postResult.

**Causal checks.** Why separate tiles? Smaller individual payloads. How does fallback change semantics? Some tiles may already have arrived before full payload fallback, so receiver reconciliation matters. Why does a successful UI update not establish agent knowledge? It occurs before HTTP result delivery. First principle: a distributed mutation requires separate execution and acknowledgement states.

**Dependencies/external outcomes.** Backend may reject/lose/duplicate result ingestion; plugin cannot infer acceptance from a timeout. A session can end while handler yields. Tile endpoints may partially succeed. Nine-probe harness exercises selected delivery/session cases; backend recovery remains unknown.

## C. HttpCore.request — 128-HttpCore.luau:74

**Purpose.** Centralizes JSON HTTP calls and bounds the caller's wait. It also supplies the Studio user identifier and repairs invalid UTF-8 before encoding when possible.

**Inputs and assumptions.** Method/path/body/extra headers/compression flag; backend URL from default or plugin setting; captured Studio user ID. Assumes: caller supplies a suitable URL; headers identify rather than independently prove authorization; payload can be encoded after sanitization; RequestAsync response has expected shape; timeout means an uncertain outcome; caller handles nil/errors.

**Outputs and effects.** Adds content type and user ID, applies override URL, sends optional gzip JSON, returns response/nil/synthetic timeout. It spawns an underlying HTTP call, waits in 0.1-second increments, and does not cancel that call on its own deadline.

**Block trace.** Compose headers and URL; remove the internal override header from transmitted headers. Encode body; sanitize/retry encoding; return nil if still unencodable. Spawn RequestAsync. Wait at most 20 seconds, except 180 for a legacy named batch path. Return timeout if unfinished; otherwise log and return response.

**Invariants/limits.** Override header is not sent. No body is sent after unrecoverable encoding failure. Timeout does not imply server nonexecution. This function contains no general response retry. Binary helpers are separate and do include one retry.

**Causal checks.** Why sanitize? Invalid text should not hang the tool-result pipeline. Why cannot a timeout be treated as a negative acknowledgement? The spawned request can complete afterward. How can retries be safe? Receiver idempotency and immutable request identity are prerequisites. First principle: waiting less changes caller latency, not external side effects.

**External outcomes.** Encoding can fail; networking may throw, timeout or return a rejection; the remote side may accept a request whose response is lost. URL authorization and remote decompression/storage are not visible here.

## D. batchRollback main handler — 062-batchRollback.luau:350

**Purpose.** Applies a list of inverse operations for a message and returns per-operation outcomes. It restores objects/source/properties through local helper functions rather than invoking native undo as its main mechanism.

**Inputs and assumptions.** Operations and message ID; tree maps; instance APIs; property converter; serialized state. Assumes: inverse operations are already ordered correctly; before-images are accurate; referenced parents still exist; serialized classes/properties remain valid; caller interprets operation failure counts; earlier successful operations need not be automatically reversed here.

**Outputs and effects.** Applies each inverse operation, accumulates results, counts success/failure, returns completed plus those counts. Mutations applied before a failure persist.

**Block trace.** Start timer; for each operation dispatch by type inside pcall; synthesize failure for unknown type/exception; append result; update counters. Continue after failures. Return aggregate status with no second compensation pass.

**Invariants/limits.** Each input gets a result when dispatch completes normally. Failure does not break the loop. Completed describes completion of processing, not complete restoration. Counters sum to processed operations. Nested helpers can log failed property assignments without making every operation fail.

**Causal checks.** Why per-operation reporting? Restoration can fail due to changed references and state. How is atomicity established? It is not established by sequential pcall alone. Why can a later failure not undo earlier success automatically? No saved forward-operation compensation pass is present. First principle: a batch is not a transaction merely because it is one function call.

**External outcomes.** Instance lookup can fail; property conversion/assignment can reject; deserialization can fail; user state can change. The probe uses actual update/aggregate logic with mock instances and confirms partial completion semantics, not full Roblox restoration fidelity.

## E. runTests handler — 091-runTests.luau:40

**Purpose.** Runs a bounded simulation and converts observed log warnings/errors into a single aggregate smoke-test result. Its counters are not a count of user-authored assertions.

**Inputs and assumptions.** Timeout, RunService, LogService; defaults to ten seconds and caps at thirty. Assumes: the relevant failure executes within that window; log capture observes it; warning-as-failure is desired; Run/Stop succeeds; absence of logs is adequate for this smoke check; script-path parsing matches log text.

**Outputs and effects.** Starts/stops simulation, collects logs, reports elapsed milliseconds and one pass/fail. Startup failure returns failed status and disconnects capture.

**Block trace.** Attach MessageOut; filter own marker; classify warning/error together and parse source hints. Run simulation in pcall. Wait, Stop in pcall, disconnect listener. Return one test, passing iff errors array is empty.

**Invariants/limits.** totalTests is always one on normal completion. A warning can fail that test. No assertion-specific execution is required. Empty logs cannot prove a purchase, jump, persistence operation or multiplayer interaction occurred.

**Causal checks.** Why do silent bugs escape? They need assertions, not an error signal. How does a warning fail? It enters the same array as runtime errors. Why are stack traces uncertain? The callback captures its own stack. First principle: observation of no exceptions is weaker than observation of intended behavior.

**External outcomes.** Run/Stop can fail; unrelated logs can pollute the result; required gameplay events may never happen. The newer playtest path is analyzed separately and must not be conflated with this smoke handler.

## F. renderToBuffer — 089-renderContentId.luau:138

**Purpose.** Resolves captured content to raw RGBA for the direct upload path. It deliberately supports a single bounded image instead of returning multiple tiles.

**Inputs and assumptions.** Content ID, maxWidth, AssetService. Assumes: content resolves after play ends; EditableImage is available; dimensions are positive; caller's chosen width also keeps proportional height within the limit; allocation succeeds; returned bytes fit upload budgets.

**Outputs and effects.** Returns width/height/raw buffer and destroys image resources along successful paths. Oversized dimensions destroy the source image and raise an error.

**Block trace.** Create editable source; read dimensions; choose min(requested width, source width); compute proportional height. Reject either dimension above 1024. Read source pixels directly if unchanged; otherwise render a resized image, read pixels, destroy both images, return buffer.

**Invariants/limits.** Successful output is at most 1024 in each dimension. Width never exceeds the source width. Aspect ratio is retained apart from integer rounding. Width-only scaling can reject portrait images even when a smaller valid image exists. Resource cleanup for arbitrary API exceptions requires review beyond the explicit oversized branch.

**Causal checks.** Why reject? Direct upload expects one image reference. How does portrait fail? Width 1024 scales 1920/1080 height to 1820. Why not assume the general screenshot path fails? It has tiling and/or a forced landscape emulator. First principle: a two-dimensional constraint requires satisfying both dimensions.

**External outcomes.** Capture content can expire/fail to resolve; image allocation/read can throw; upload bandwidth can dominate after rendering. The mock reproduction confirms the exact dimension arithmetic/rejection branch, not actual device rendering performance.

## Scope corrections retained

- Older online descriptions understate current visual and playtest capabilities.
- Older source comments about bidirectional syncing, manager delegation, atomic rollback and R2 fallback are not always consistent with current executable paths.
- Recorder existence is not proof it is called.
- The richer playtest's supplied assertions and backend stopping rule are still unknown.
- No per-generation model choice, queue lease policy, production failure rate, full private UI inventory, or complete license provenance was learned from this snapshot.
