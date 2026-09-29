# Coordinator Workers Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development for independent bounded tasks and review. Root integrates the tightly coupled coordinator and engine work.

**Goal:** Deliver a persistent coordinator that creates bounded planning tasks and dynamically delegates execution workers without weakening requirements, reasoning or spending controls.

**Architecture:** A separate coordinator module owns schemas, transitions and durable receipts. Engine provides validated and billed worker capabilities. Application entry points activate the new workflow while legacy saved artifacts remain resumable.

**Tech Stack:** TypeScript, Zod, existing Node service, Vitest, React and Playwright.

**Spec:** docs/superpowers/specs/2026-09-22-coordinator-workers-design.md

## Global constraints

- No paid inference, keys, user process restart or paused trial resumption.
- Preserve the approved requirements and existing monetary budgets.
- Sequential workers, host-owned spawning and Studio leases.
- No partial output accepted as code or a complete plan.
- Full npm run check required. Native gameplay remains separate.
- Preserve unrelated uncommitted work. No commit/push in this implementation.

## Task 1: Explicit reasoning policy

Files: src/generation/providers.ts, src/web/ModelLibrary.tsx, tests/multi-provider.test.ts and affected provider tests.

- [x] Assert Automatic sends no invented Sonnet-specific effort, while configured high/medium/low remain explicit.
- [x] Remove the silent low-effort fallback and explain combined reasoning/output allowance in Models.
- [x] Run targeted provider tests and review the changes.

## Task 2: Coordinator state and planning

Files: new src/generation/coordinator.ts, src/generation/schema.ts, tests/generation-coordinator.test.ts.

- [x] Define persisted outline, completed area outputs, worker receipts and revision/input identity.
- [x] Add typed host callback `request<T>(phase, context, schema, validate?): Promise<T>` and `save(message): void`.
- [x] Persist outline and each area only after schema and semantic validation. Assemble with existing spec validation.
- [x] Test that a failure after area one resumes area two, and changed input rejects the old checkpoint.

## Task 3: Dynamic dispatch and engine capabilities

Files: src/generation/coordinator.ts, src/generation/engine.ts, src/generation/store.ts, tests/generation-coordinator.test.ts.

- [x] Expose one-task build, independent review and one repair as internal engine capabilities without duplicating their validation logic.
- [x] Let coordinator choose dependency-ready tasks, inspect, refine pending tasks, review, repair or finish.
- [x] Validate every action before dispatch. Persist worker identity and result status. Require current review and all completed tasks for finish.
- [x] Reject cancelled or stale results, preserve failed receipts, bound steps and repairs, and reuse all cost accounting.
- [x] Verify restart and explicit retry preserve completed work and do not replay successful workers.

## Task 4: Application integration and full verification

Files: src/server/app.ts, affected test fixtures, README.md, docs/coordinator-workers-implementation.md, research/notes/continuation.md.

- [x] Enable coordination by default for new projects/fresh plans in the application and preserve old-artifact recovery.
- [x] Test the public API default with a complete offline coordinated run.
- [x] Run `npm run check` with the installed Luau tool directory and record every stage and failure.
- [x] Obtain independent spec/quality review, resolve findings, and record actual verification limits and cost.

## Execution ledger

Ruling: Continue in the existing codex/marketplace-asset-library checkout. It contains extensive prior approved uncommitted functionality that a clean worktree would omit. Work is scoped by file ownership and reviewed before delivery.

Ruling: The user's explicit implementation request follows approval of the concrete design. Proceed through documentation and implementation without repeating a design-permission question.

Preflight: Task 1 shares no engine/state files with Tasks 2/3. Task 2 produces coordinator types consumed by Task 3. Task 3 exposes execution behavior verified through Task 4. Tests target retained requirements, actual dispatch order and durable evidence rather than mirroring implementation branches.
