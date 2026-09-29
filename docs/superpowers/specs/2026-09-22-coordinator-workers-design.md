# Coordinator and temporary workers

Approved in conversation on 2026-09-22. The user explicitly requested implementation and tests after approving the coordinator direction. This document records that approval rather than introducing another approval gate.

Takko's coordinator owns the complete approved intent and dynamically assigns temporary workers. The host owns budgets, revision checks, exclusive file ownership, validation and checkpoints. Workers cannot spawn workers, change requirements or certify runtime success. Existing model routes become capability assignments, with the planner route serving the coordinator. Existing profile budgets and explicit reasoning choices remain binding.

Planning persists a compact outline with shared contracts and bounded areas, then persists each area's requirements and tasks. Final assembly must satisfy the existing source, architecture, reference and Marketplace contracts before user approval. Interrupted planning resumes only for the same input hash. An explicit new brief invalidates coordination state.

Execution persists coordinator decisions and temporary worker receipts. It may dispatch any dependency-ready task, inspect an integration problem, refine an unstarted task without losing requirements or ownership, request independent review, request bounded repair, or finish. Finish requires all tasks complete and a current independent review with no static failures. Studio verification remains pending unless actual evidence exists. Sequential dispatch is deliberate. Existing Studio asset leases remain authoritative.

Complete validated worker results are committed atomically with completion state. Incomplete or cancelled calls never become artifacts. Failed workers remain retryable from the saved boundary. Decisions and retries consume the same accounting path as every other model call. A finite decision limit prevents an endless zero-progress loop even on free models. The coordinator never silently raises spending or lowers reasoning effort.

Existing artifacts retain their execution format when resumed. New application projects and fresh application plans use coordination. The low-level engine retains its legacy entry point for callers replaying older projects and benchmark fixtures. The application's default must be covered by integration tests, not inferred from module tests.

Verification includes staged-plan recovery, dynamic scheduling, invalid premature finish, dependency and ownership checks, inspection evidence, targeted repair, cancelled/stale worker rejection, durable recovery and budget enforcement. Run the complete npm run check. Offline fixtures establish orchestration behavior, not paid-model quality or native gameplay.

No paid inference, user process restart, key access, paused trial resumption, commit or push is included. The shared dirty checkout is retained so prior approved work is not omitted from the delivered application.
