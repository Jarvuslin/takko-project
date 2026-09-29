# Claw Code evaluation for Takko

2026-09-19. Research only. No production changes or paid inference.

There are useful ideas here, especially request diagnostics, provider capability checks and explicit task contracts. I would implement selected ideas in Takko's existing TypeScript pipeline. I would not replace it with this harness or copy its compaction, pricing or default execution policy.

## What was evaluated

Pinned upstream commit: [`08106b0c3771ef5b4a5aa176acccd460e88b7325`](https://github.com/ultraworkers/claw-code/tree/08106b0c3771ef5b4a5aa176acccd460e88b7325), dated 2026-08-16. Retrieved 2026-09-19 at 20:47 UTC.

The current repository describes a Rust implementation with Python reference material. Its README calls the project an agent-managed museum exhibit and directs production users elsewhere. It explicitly disclaims ownership of the original Claude Code material. This evaluation concerns the current public implementation, not an authenticated reconstruction of Anthropic's production architecture. The repository declares MIT licensing, but that declaration alone does not establish the provenance of every upstream contribution. The recommendations below are independently implementable design ideas. [Pinned README](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/README.md), [license](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/LICENSE).

Preserved 86 selected original files, 4,623,630 bytes, from a non-truncated tree containing 395 blobs. Every saved file matches both its recorded SHA-256 and GitHub tree Git blob SHA. Selection covers Rust API, runtime, tools and CLI sources and tests plus architecture documents. This is not a claim that every line was reviewed. Focused reading traced request assembly, provider preflight, conversation execution, tool discovery, task creation, background agents, compaction and persistence. The eleven-file Takko comparison snapshot contains ten working-tree source files and one historical diagnostic.

Originals and manifests are under `research/evidence/claw-code-20260919/`. They remain ignored third-party evidence. [Verification record](../research/results/claw-code-review-20260919/verification.json). No downloaded code was executed. Tests found in that repository were inspected as source, not run or accepted as proof of parity.

## What is worth borrowing

| Priority | Idea | What Takko already has | Useful addition |
| --- | --- | --- | --- |
| 1 | Context and cache diagnostics | Stable context ordering, source hashes, provider cache-read usage and conservative cost reservations | Section sizes, request fingerprints, repeated-content attribution and measured lossless deduplication |
| 1 | Provider capability and context checks | Separate transports, configurable output limits, incomplete-output detection | Explicit context/reasoning capabilities and request validation per model/provider |
| 2 | Task verification contracts | Approved specifications, task dependencies, file ownership and protected acceptance scenarios | Explicit evidence, resource and recovery requirements for each task |
| 3 | A bounded tool feedback loop inside a task | Structured stages and bounded review/repair | Small read/compile/patch loop for failures that need targeted inspection |
| 3 | Correlated execution records | Traces, snapshots, checkpoints and Studio dispatch identity | One attempt lineage linking requests, charges, source revisions and native evidence |

These priorities are engineering judgments, not measured quality or cost improvements.

### 1. Make expensive context explain itself

Claw's prompt builder places static sections before a dynamic boundary marker. Its prompt-cache module fingerprints request sections and records cache-read drops, timing and changed inputs. Those are useful diagnostic patterns. However, the inspected CLI joins all system sections into one string. I found no `cache_control` or `ephemeral` directive in the inspected Rust files. A boundary marker by itself does not establish provider caching or a cost reduction. [Prompt builder](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/runtime/src/prompt.rs#L211), [cache tracking](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/api/src/prompt_cache.rs#L314), [actual request assembly](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/rusty-claude-cli/src/main.rs#L12638).

Takko already orders reusable references first in [context-layout.ts](../src/generation/context-layout.ts), binds source evidence to hashes in [component-review.ts](../src/generation/component-review.ts), and records optional `cachedInputTokens` in [providers.ts](../src/generation/providers.ts). Adding those again would not solve the problem.

The useful next step is a diagnostic for every request that attributes bytes to game context, source bodies, hierarchy, contract, review and feedback. Hash repeated sections so the report can explain why a request grew and whether an unchanged prefix was reused. Keep raw source and authority available losslessly. Only intern duplicate content where every reference still resolves to the same bytes and role.

This addresses a demonstrated Takko constraint. The historical V15 post-adaptation review packet had 217,247 user-message bytes and was rejected with a reservation deficit of 740 microdollars. That was a conservative admission result, not an actual provider bill. It does not mean a smaller packet would pass semantic review. [Preserved V15 analysis](../benchmarks/runs/marketplace-diversity-v15-20260916/budget-diagnostic/analysis.json).

Validation before adoption: replay the saved packet offline, prove all required evidence is retained, compare serialized sizes and verify that budget admission still uses conservative uncached pricing. Any cache savings claim needs provider usage receipts from a separately authorized run. Absent cache telemetry remains unknown.

### 2. Treat model settings as capabilities

Claw checks estimated input plus requested output against known context limits and returns a typed context-window failure. Its Anthropic transport also attempts token counting. OpenAI-compatible request shaping varies for reasoning model families. These show where provider differences belong. [Preflight](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/api/src/providers/mod.rs#L681), [Anthropic counting path](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/api/src/providers/anthropic.rs#L507), [reasoning detection](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/api/src/providers/openai_compat.rs#L958).

Its implementation is not a ready-made capability database. The generic token estimate is serialized bytes divided by four. Unknown models bypass that limit lookup. Name-prefix heuristics can become stale. The Anthropic path runs the estimate before the exact-count attempt, so that estimate can reject a request before counting resolves the uncertainty.

Takko's [profile schema](../src/generation/schema.ts) has output allowance, timeout and JSON controls, but no explicit context-window or reasoning capability configuration. Add supported controls, their source and their verification date. Distinguish unsupported, unspecified and provider-default values. Do not send a universal reasoning effort and assume it took effect. Keep context-fit checks separate from monetary reservations.

This is relevant to the [earlier Kimi diagnosis](../research/26-model-failure-diagnosis.md), where the benchmark assumed an unsupported effort control. That benchmark bypassed Takko's production transport. Adding a capability model addresses a configuration blind spot, but does not prove Kimi will produce usable Roblox code.

Validation before adoption: offline provider-wire tests for supported and unsupported knobs, unknown models, input/output headroom and truncation. No paid provider calls are needed to verify serialization. Live behavior remains a separate experiment.

### 3. Give each task a verification contract

Claw's `TaskPacket` represents scope, resources, acceptance criteria, permission profile, recovery policy and verification plan. That is a useful design for making delegation reviewable. There is an important limit: `RunTaskPacket` validates and registers task metadata. It does not itself launch or verify the work. A separate `Agent` path launches a background job with an allowlist and a 32-iteration limit. [Task packet](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/runtime/src/task_packet.rs#L30), [registration](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/tools/src/lib.rs#L1590), [actual agent execution](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/tools/src/lib.rs#L4089).

Takko already has task IDs, dependencies, requirements and file ownership. Extend those with explicit allowed inputs, required evidence and stop conditions. For example, a combat task could require compile evidence plus native evidence for damage authority, duplicate-hit prevention and cleanup after respawn. Until native evidence exists, it remains ready to test.

Validation before adoption: reject missing or stale evidence, references to the wrong artifact, writes outside owned files and completion claims supported only by compilation. Keep generation costs and retries under the existing approved budget.

### 4. Consider a small feedback loop for difficult repairs

Claw's active conversation path streams a response, extracts tool calls, checks hooks and permission, executes tools, appends results and asks the model again. This mechanism is useful when a failure requires inspecting a specific file or compiler result before making the next edit. The examined loop executes tools sequentially. Its default top-level iteration limit is `usize::MAX`, unlike the separately capped background agent. [Conversation implementation](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/runtime/src/conversation.rs#L325).

Takko already performs structured build, review and bounded repair in [engine.ts](../src/generation/engine.ts). A plausible extension is a task-local loop exposing only scoped source reads, compilation, contract inspection and proposed patches. It must retain approved specifications, ownership, budget admission, protected tests and explicit stop conditions. Native changes still go through the existing bridge.

This is an experiment, not an immediate rewrite recommendation. Compare against the existing repair route on the same saved failures. Count rejected scope escapes, recovery rate, calls and costs. A loop that spends more without improving completion is a regression.

### 5. Link existing records into an attempt history

Claw persists conversation records to JSONL and supports parent-linked forks. Appending a message rolls back its in-memory addition if persistence fails. Snapshot saves can rewrite and rotate the file, so this is not proof of an immutable event log or exactly-once execution. [Session persistence](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/runtime/src/session.rs#L231).

Takko already has traces, project snapshots, checkpoints and native dispatch tracking in [store.ts](../src/generation/store.ts) and [bridge.ts](../src/generation/bridge.ts). Add explicit attempt and parent IDs linking input hashes, model request, reservation, settlement, candidate source and native result. Recovery should state the last confirmed step and whether effects are unknown. Never replay an uncertain native edit just because a journal can be resumed.

Validation before adoption: simulated interruption between reservation, response, persistence and native acknowledgement. Confirm recovery cannot double-charge, hide an unresolved reservation or repeat unknown native effects.

## What I would not copy

* **Lossy compaction for evidence.** The compactor keeps recent messages and builds an older-history summary using 160-character block snippets and keyword guesses for pending work. That can omit exact requirements and source behavior. Auto-compaction is triggered from cumulative input usage in the inspected loop, which is not the current context footprint. Its tool-boundary preservation is useful, but not sufficient for Takko's evidence needs. [Compactor](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/runtime/src/compact.rs#L200), [trigger](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/runtime/src/conversation.rs#L571).
* **Assumed savings from ToolSearch.** The inspected registry supplies every allowed tool definition to the CLI request. Search returns matching tool names. The word deferred in its search index does not establish lazy schema loading on this path. Actual schema deferral might help a future large tool catalog, but no token savings were measured here. [Definitions](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/tools/src/lib.rs#L248), [search](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/tools/src/lib.rs#L381).
* **Completion replay as provider caching.** The Anthropic non-streaming client can return a locally cached answer. The streaming path used by the inspected CLI does not do that lookup. Replaying an answer and caching a provider prompt prefix have different billing and effect semantics. Do not reuse old tool decisions against changed Studio state. [Anthropic request paths](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/api/src/providers/anthropic.rs#L296).
* **Its fixed pricing as budget control.** Hardcoded model-family estimates are not a substitute for Takko's per-call reservations, receipts and retained unknown costs. The main conversation loop is not a monetary admission gate. Preserve Takko's controls. [Usage estimates](https://github.com/ultraworkers/claw-code/blob/08106b0c3771ef5b4a5aa176acccd460e88b7325/rust/crates/runtime/src/usage.rs).
* **A Rust rewrite or more agents as a quality claim.** Repository size, a parity checklist and mock scenarios do not show that it generates better Roblox games. No comparative benchmark or native Roblox integration was performed.

## Recommended first change and verification limits

Start with a lossless request-size and capability diagnostic around the existing request builder. It directly addresses Takko's observed context/budget constraints and model configuration ambiguity. Use the saved V15 packet and provider mocks first. Only consider a new agent loop after those diagnostics show what targeted inspection would save.

This turn added research artifacts only. Integrity checks: 86 of 86 SHA-256 matches and 86 of 86 Git blob matches. Application tests run: 0. `npm run check` was not run, including vitest, Luau, plugin, guards, build, desktop, production and browser stages. No inference, provider token-count endpoint, native Studio operation or downloaded program was run. Provider cost: $0. No model-quality, gameplay or savings claim is established.

At 20:54:25 UTC, read-only OS checks found no listeners on 4318, 4319, 4320, 4324, 4335 or 4336, and neither previously recorded PID 36672 nor 39460 existed. This differs from the earlier continuation record. This task did not stop or restart them. Recheck before any future server work. The last verified historical key balance remains $1.529256456 at 2026-09-16T22:44:44Z and was not refreshed. The generation goal remains paused. Existing uncommitted implementation work was preserved.
