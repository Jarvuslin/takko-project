# Bottlenecks and concrete fixes

Priorities below are **proposed engineering order**, not production incident severity. The source review identifies mechanisms; isolated reproductions verify selected local behaviors. Production frequency, user impact, and time/cost share need instrumentation.

## 1. Result delivery can lose the agent's knowledge of a successful mutation

**Evidence:** `135-StudioActionService.luau:305` posts results once. A non-200 response is logged and not retried. The alternate small failure payload is only used when serialization returns nil. `128-HttpCore.luau:145` bounds how long the caller waits, but the underlying spawned HTTP request is not cancelled when that deadline expires.

**Reproduced:** a mocked HTTP 503 produces exactly one result-post attempt. The same delivered request ID executes a mutating handler twice if `_executeRequest` is called twice. This proves the absence of client-side replay suppression, not that the backend actually redelivers requests.

**Consequence:** if the game was changed but the acknowledgement is lost, the agent can time out, repeat work, or reason from outdated state. This can look like poor generation even if the original action was correct.

**Fix:** give each action an immutable `(projectId, sessionEpoch, requestId)` envelope. Journal the terminal result locally before reporting it; retry with bounded exponential backoff/jitter until acknowledgement or explicit session expiry. Maintain an in-progress/completed request cache, and return the recorded result on duplicate delivery. Coordinate this with backend leases and idempotent result ingestion. Do not merely retry mutations blindly.

**Acceptance:** drop the first result response after a successful create; reconnect and replay the request; exactly one instance exists and the agent receives the original result. Record queue time, action time, result-post time, retries, duplicates suppressed, and unresolved outcomes.

## 2. Disconnect and parallel work lack a complete session lifecycle

**Evidence:** requests are individually spawned at `135-StudioActionService.luau:227`. `stopPolling` clears `projectId` and `actionHandlers` but does not join/cancel in-flight handlers or retain their original request context. `_postResult` reads `self.projectId` later.

**Reproduced:** a handler that yields, then finishes after `stopPolling`, posts with an empty project header. Reusing the same service object for another project instead posts the old result with the new ID. The latter is a module-level hazard; `App` normally creates a new Core on reconnect, so it is not claimed as a demonstrated normal cross-project production incident.

**Related risk:** unbounded handler dispatch permits edit/play/capture operations to overlap. Dedicated screenshot device changes have a lock already (`063-captureDeviceSimulator`); a blanket statement that the plugin has no locking would be false. The general action dispatcher has no visible global play-session or write scheduler.

**Fix:** freeze context at dequeue; stop accepting work when draining; wait for or explicitly terminate work with resource-specific cleanup; report an unambiguous cancelled/expired status. Use parallel lanes for independent reads, serialize conflicting writes, and require one Studio play-session lease. Never cancel a mutation halfway without a journal/recovery policy.

**Acceptance:** disconnect during an edit, capture, and playtest; reconnect to the same/different project; no orphan helper scripts, wrong-session acknowledgement, or duplicate mutation. Cancellation during machine startup must leave the plugin disconnected (also review `App:connect`'s post-cancellation path).

## 3. Polling and startup add latency and shared backend load

**Evidence:** one-second active polling, a 20-empty-poll grace, exponential backoff to five seconds. The source specifically mentions avoiding saturation of the Convex concurrent-action cap. Machine connection separately waits two seconds, then polls readiness with two-second sleeps and up to 60 attempts.

**Reasoned cost model, not a measurement:** if server polls return immediately and command arrivals are uniform, a one-second interval adds roughly 0.5 seconds average pickup delay; a five-second interval adds roughly 2.5 seconds. Chained tools accumulate waiting. Actual behavior changes if requests are held open server-side.

For N clients, client round-trip duration L and sleep I, approximate request rate is `N / (I + L)`. Concurrent backend actions are approximately arrival rate times **server action residence time**, which must be measured separately from client round-trip duration. No deployment plan or actual concurrency count is known.

**Fix:** instrument first. If idle polling is the bottleneck, move long-lived command delivery out of a scarce shared action pool, or use a suitable direct authenticated connection/long-poll bridge. Keep auth/billing/project records in the service layer. Batch related operations and reads; negotiate capabilities; use readiness events or adaptive startup probes. Respect transport support of the target Studio version—do not assume WebSocket support or propose longer-held Convex actions as a free scaling win.

**Acceptance:** compare p50/p95 enqueue-to-start latency and idle requests per connected minute at representative concurrency. Track machine cold-start separately from model latency. A larger model cannot fix this delay.

## 4. Rollback is best effort, despite an atomicity comment

**Evidence:** `062-batchRollback.luau:350` processes operations in order and records individual failures. At line 462 it returns `status = "completed"` even when some operations failed. No compensation of previously successful operations occurs in this handler.

**Reproduced:** a successful source restoration followed by an unsupported operation keeps the source change, reports one failure, and returns completed. This is a legitimate per-operation result format, but consumers must not interpret completed as a successful all-or-nothing undo.

`RecordingManager` exists, but a scoped search across extracted sources found no invocation of `beginRecording` outside its definition/type declaration. Core injects the manager and finishes recordings on stop. Therefore automatic grouping of ordinary agent mutations into native undo recordings is **not established by this build**. The custom rollback path is separate.

**Fix:** preflight operation references and before-images; group mutations in a real recording/journal lifecycle; return `completed`, `partial`, or `failed` with explicit success counts. If all-or-nothing semantics are required, stage/validate first and compensate failed application with verified restoration. Test both Studio native undo and message-level rollback. Never label best effort as atomic.

**Acceptance:** injected failure midway restores the exact prior state or surfaces a partial rollback with recoverable remaining operations. Include instance references, scripts, attributes, sibling order where relevant, and shared dependencies.

## 5. Error-free execution is not gameplay correctness

**Evidence:** `091-runTests.luau` calls Run/Stop, collects log messages for a bounded period, sets `totalTests = 1`, and declares pass when its error list is empty. Warnings count as errors. `debug.traceback()` inside its log callback is not necessarily the original failing script's stack.

**Reproduced:** a mock run with no assertions reports one passing test; a warning-only run fails it. These are semantics of a smoke check, not proof that the tool itself is broken.

**Important qualification:** the newer `085-playtest.luau` is materially richer: injected server/local scripts, chronological logs, frame capture, and test-session controls. Its presence means we cannot claim Lemonade has no functional testing or no visual review. We need agent traces to know which path it uses, what assertions it supplies, and whether it repairs failed checks.

**Fix:** separate compilation, smoke checks, scenario assertions, visual checks, and multiplayer validation in the result schema. Require feature-specific tests: purchasing reduces money exactly once; checkpoint survives death; round state returns to lobby; two players cannot buy the same slot; touch controls work at target dimensions. Keep warnings separate from errors. Require the agent to demonstrate these outcomes before declaring completion.

**Acceptance:** intentionally broken but silent gameplay fails the scenario suite. Benign warnings do not automatically fail correctness. An unexercised feature is reported as unverified rather than passed.

## 6. Visual feedback is expensive and fragile at specific boundaries

**Evidence:** `089-renderContentId.luau:138` constrains width, computes proportional height, then rejects either dimension above 1024 in the direct-buffer path. The legacy `render` path supports tiles. `085-playtest.luau:899` supports direct uploads with four concurrent upload slots, retries inside HTTP helpers, a 30-second join budget, and partial frame manifests.

**Reproduced:** a 1080×1920 source with `maxWidth=1024` becomes 1024×1820 and is rejected. Dedicated screenshot handlers normally force a 1920×1080 emulator, so this exact issue primarily concerns the direct-upload frame path or callers supplying portrait images—not every screenshot request.

**Cost calculation:** a 1024×576 RGBA image is 2,359,296 raw bytes (2.25 MiB). Twenty frames are 45 MiB before transport overhead. Inline base64 grows bytes by roughly one third before any gzip reduction. Existing R2/direct-binary work already avoids some proxy/base64 overhead; preserve that improvement.

**Fix:** scale against both dimensions: `s = min(1, requestedWidth/W, 1024/W, 1024/H)` with valid positive dimensions. Return capture evidence quality and dropped-frame reasons. Capture a few purposeful before/after/action frames, then expand only when temporal behavior requires it. Measure client encoding/upload and agent decoding time separately. Evaluate a supported encoded-image path rather than assuming PNG/WebP encoding is readily available in Studio.

**Additional observation:** the portrait failure branch calls `Log.error` despite nearby comments saying a render failure only drops a frame. `Log.error` throws when logging/reporting is enabled; that can change control flow. Treat logging as observation, not control flow.

**Acceptance:** landscape, portrait, narrow phone, missing CDN permission, slow upload, minimized window, capture callback loss, and partial video evidence are all exercised. Preserve existing readiness checks, capture-health probes, deadline handling, and emulator restoration.

## 7. Live editor state and context freshness need explicit contracts

**Evidence:** `readScript`, `updateScript`, and `editScript` use `.Source` directly. Update accepts no expected source hash/revision. The watcher tags new instances but does not stream source revisions. List has a 500-result cap; glob/grep traverse descendants; map misses can trigger a full tracked-service scan. Existing population yields every 250 instances but first assembles a full descendant array.

**Risk, not reproduced Studio failure:** open editor drafts or intervening user/agent changes can make a read-edit cycle stale; large games can cause repeated scans, truncated context, and extra tool turns. The backend may already compensate; it is not visible here.

**Fix:** use editor-aware reads and `ScriptEditorService:UpdateSourceAsync` where appropriate, with expected revision/hash checks inside the edit callback. Keep index revisions, removals/renames, and dependency edges; retrieve selected source ranges on demand. Add deterministic pagination/cursors and traversal budgets. Rebuild/refetch after a conflict instead of silently overwriting.

**Acceptance:** edit an open draft during generation, rename/delete/import while tools run, and search 1k/10k/100k-instance projects. Measure source bytes, scan time, lookup miss rate, truncation and wrong-reference errors. See [Roblox's editor service API](https://create.roblox.com/docs/reference/engine/classes/ScriptEditorService).

## 8. Version rejection behavior depends on logging configuration

**Evidence:** `_poll` calls `Log.error` before `stopPolling` on 403 responses (`135-StudioActionService.luau:183`). The actual logger can throw (`125-Log.luau:94`). The outer loop catches poll errors and continues while `isPolling` remains true.

**Reproduced conditionally:** with a throwing logger, the 403 path exits before clearing polling. The harness supplies a throwing logger dependency matching that configured production behavior. With logging disabled, the actual logger can be nonthrowing and the later stop executes. Do not describe this as an unconditional outage.

**Fix:** transition/disconnect first, then use nonthrowing logs and a typed compatibility result. Apply the same rule to fatal cleanup paths. Test both logging states.

## What is not yet a diagnosed bottleneck

Weak planning, cheap-model overuse, context truncation, weak templates, insufficient asset ranking, absent multiplayer checks, and premature agent completion are plausible generation-quality hypotheses. None has been established from a failed run. OpenRouter's traffic mix is a lead for model-routing experiments, not evidence that a model caused poor quality. No runtime profiling or production load test was performed.
