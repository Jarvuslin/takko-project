# Agent architectures worth adapting for Takko

Research snapshot: September 16, 2026. Scope: the eleven requested projects, Spacebot's website/documentation, and the OpenHands SDK referenced by its current application. This is a focused source review, not a runtime benchmark or a recommendation to replace Takko.

**Updated decision criterion:** compare effectiveness before deciding what to retain. The original recommendation to keep Takko's core was too strong for a source-only study. [The follow-up effectiveness comparison](24-agent-effectiveness-comparison.md) tests actual OpenCode against Takko and keeps replacement of the worker layer open. The architectural observations below remain useful, but existing implementation is not evidence that Takko is better. None of this source inspection alone establishes Roblox component integration or gameplay performance.

## What Takko already has

The comparison is against the current working tree, including recent Marketplace/context/importer improvements, not the original Forge milestone. The accompanying verification record hashes the local files used for this review.

| Current implementation | Implication for this review |
|---|---|
| `engine.ts`: separate research/planner/worker/reviewer/repair calls, structured schemas and a task dependency graph | Role separation and planner/worker routing are already present. Another manager agent is not automatically an improvement. |
| `game-context.ts`: user-source provenance, clarification question/answer pairs, planned experience, reference mechanics and per-asset intent | The worker no longer receives only a vague task description. The remaining question is whether it acts correctly on that context. |
| `engine.ts:dependencyContext`: transitive dependency scripts plus implementation evidence for shared requirements | Script context filtering already exists. It currently returns the other bundle fields intact, leaving room for more selective scene/component context. |
| `asset-pipeline.ts` and `studio-asset-adapter.ts`: bounded discovery, returned-candidate identity, native inspection, visual/audio evidence, ownership and cleanup guards | Marketplace-first enforcement is a product capability, not a generic web-search prompt. Preserve it. |
| `component-archive.ts`: complete native RBXM/source capture and hash-checked transfer | This is a foundation for reusable components. Capture and restoration diagnostics do not establish execution approval or gameplay suitability. |
| `component-derivative.ts` and `component-review.ts`: retained originals, restricted derivatives, deduplicated full source bodies with all instance bindings, and requirement-linked review decisions | The working tree now contains a source-review handoff through the configured reviewer. Extend it with dependency verification and owned integration; do not propose rebuilding the archive/review foundation. Source presence and schema validation do not prove a correct semantic review or native behavior. |
| `bridge.ts` and `store.ts`: durable dispatch states, revision/artifact/test identities, snapshots and trace records | Takko already has meaningful recovery machinery. Extend gaps rather than replacing it with generic event sourcing. |
| `engine.ts`: admission against settled spend plus active reservations; compilation, protected tests and bounded repairs | Keep these controls. Some studied agents check their dollar ceiling only after a billed request and can overshoot. |

The immediate blocker remains reviewed **complete component integration**. The recent combat, bubble-wrap and checkpoint workers found relevant Marketplace candidates but could not carry their embedded behavior through the production importer. Restricted-restoration diagnostics and subsequent derivative persistence preserved sources/sandboxes while reducing capabilities. The newer working-tree pipeline can prepare full evidence and request a source review, but explicitly stops after that review: dependency verification, native integration and execution remain unavailable. Neither a delivered component nor a raw-worker game pass is established. This refresh inspected source, not a running deployment of the newer handoff. See [component capture](../docs/takko-component-archive.md), [retained derivatives](../docs/takko-component-derivative.md), [context handoff](../docs/takko-game-context-handoff.md), and [raw diversity results](../benchmarks/runs/marketplace-diversity-v2-20260916/RESULTS.md).

## Project-by-project assessment

### 1. OpenCode — strongest general reference for the execution loop

**Observed:** its session processor persists message/tool progress, tracks usage, detects repeated calls and coordinates snapshots. Snapshot capture happens before streaming because tool execution can precede stream notifications. Its compactor preserves recent turns, prunes older completed tool results, and records compaction state. Agent definitions and permission rules separate available behavior. These are concrete implementation paths, not evidence of Roblox performance. [Processor][OC1], [compaction][OC2], [agents][OC3], [permissions][OC4].

**Adapt:** introduce a common typed step boundary around Takko's model decision, validated tool action, durable receipt and next observation. Before a Studio mutation, bind the operation to the expected revision and owned state; after it, record the actual result. For context, preserve exact requirements/current failures while replacing old bulky observations with retrievable references. Extend Takko's existing dispatch and trace infrastructure.

**Do not port:** the full Effect service graph, terminal UI or filesystem snapshot implementation. Git/file snapshots do not restore live Roblox instances. If testing OpenCode as a worker backend later, expose only Takko's scoped tool facade and run it as an optional comparison, not a new authority over Studio.

**Verdict:** adapt patterns now; defer SDK/runtime dependency. Medium integration effort, mostly around consistent receipts and context projection.

### 2. Spacebot and its docs — context inheritance and durable worker outcomes

The supplied `spacebot-com/spacebot` URL returned 404. The official [Spacebot site](https://spacebot.sh/) links to **`spacedriveapp/spacebot`**, which was collected instead. Its public docs and pinned documentation were both checked.

**Observed:** channels handle conversation; branches inherit context for reasoning; workers execute bounded tasks; a programmatic compactor monitors context; a supervisor coordinates lifecycle/maintenance. Worker documentation describes bounded inherited conversation or chronicle context, rather than only a one-line assignment. Worker code accepts inherited history and distinguishes completed, cancelled, blocked and failed outcomes. Its search implementation combines vector, full-text and graph results with reciprocal-rank fusion. These are concurrent tasks inside a Rust application, not a requirement for five separately deployed services. [Architecture][SB1], [worker contract][SB2], [worker implementation][SB3], [search][SB4].

The [homepage](https://spacebot.sh/) still describes workers as receiving no conversation context. That conflicts with the pinned worker documentation and implementation above; the bounded-inheritance finding is based on those source paths, not the marketing illustration.

**Adapt:** a worker assignment should include the relevant user intent, accepted constraints, unresolved uncertainties, component evidence and explicit completion conditions. Persist one terminal outcome; a late response must not turn a cancelled job into success. Later, keep successful component integrations and failed searches as versioned, evidence-linked records that other tasks can retrieve.

**Do not port:** always-on memory agents, a full multi-channel platform, all three storage systems, or automatic promotion of model-written “lessons” into trusted instructions. Takko already passes structured game context; indiscriminately copying the full conversation would increase cost and spread irrelevant information.

**License boundary:** the pinned source uses **FSL-1.1-ALv2**, with a competing-use restriction and a future Apache-2.0 grant. It is not equivalent to an immediately permissive MIT/Apache dependency. Recommend independent implementation of the general patterns; direct incorporation needs a decision based on the actual terms and proposed commercial use. [License][SB5].

**Verdict:** high-value context/lifecycle reference; no direct code dependency recommended.

### 3. Cline — useful TypeScript components and tool ergonomics

**Observed:** the current repository is organized around a shared SDK used by multiple apps; it should not be assessed solely through its older VS Code layout. The SDK includes deterministic and agentic compaction, bounded tool output, repeated-call detection, checkpoint hooks and delegated-agent configuration. Tool routing can choose an editing interface by model/provider; the patch executor separates computing changes from applying them. [README][CL1], [basic compaction][CL2], [output limits][CL3], [routing][CL4], [patch executor][CL5], [loop detection][CL6].

**Adapt:** small, model-compatible edit operations and bounded observations. A repair should usually return a change to the affected owned script/component, not regenerate an entire bundle. Compute the proposed change against a base hash, validate ownership and protected tests, compile it, and only then apply it through Takko. Retain full output behind an evidence handle when the model sees a shortened view.

**Do not port:** editor-specific approvals, the full extension/SDK dependency graph or Git checkpoints as a Studio undo mechanism. Takko already has compiler feedback, retries and checkpoints. The incremental addition is a better editing/tool interface, not “add validation.”

**Verdict:** best candidate for a small Apache-licensed TypeScript helper adaptation after isolated review, particularly output shaping or patch parsing. No package adoption justified by this study alone. Medium effort for a real incremental-repair path.

### 4. Goose — large-output handling and repeatable workflows

**Observed:** the Rust agent supports extensions and parameterized recipes. Its large-response handler writes oversized text to a file and returns a reference. A newer operation/effect state machine separates inference, tools, steering, approval and compaction; **the inspected entry point is gated by `GOOSE_STATE_MACHINE` and defaults off**. Its tool-pair compactor checks sibling call/result pairing before hiding messages. Do not describe that optional path as proven default behavior. [Large responses][GO1], [recipes][GO2], [state-machine gate][GO3], [pair compaction][GO4].

**Adapt:** store full Marketplace inventories, script audits and runtime logs, then provide bounded manifests and exact read operations. Make native validation procedures parameterized, versioned workflows: inspect, review, stage, playtest, collect evidence, clean up. The model selects candidates and decides how to satisfy the game; the workflow enforces repeatable execution.

**Do not port:** Rust/MCP orchestration wholesale or generic game templates disguised as recipes. Do not copy the large-response fallback that injects the full content if the spill write fails; Takko should keep a clear unavailable-evidence state when bounded persistence fails.

**Verdict:** high-value evidence and workflow patterns. Low-to-medium incremental effort; Takko's existing archive store supplies much of the foundation.

### 5. Aider — the best reference for compact dependency context

**Observed:** `RepoMap` extracts definitions/references, ranks a graph with personalized PageRank and renders a map within a token budget, with tag/map caching. Architect mode separates a proposed solution from an editor pass and transfers cost tracking. Its edit-block path applies focused replacements. [Repo map][AI1], [architect][AI2], [edit blocks][AI3].

**Adapt:** extend Takko's existing task dependency selection into a **game component map**: owned scripts, ModuleScript interfaces, instance paths, remotes, embedded sound/animation dependencies, requirement links and native evidence. Always include explicit task dependencies; rank optional supporting material within a budget. Begin with the structured graph Takko already possesses, then add parsing only where needed.

**Do not port:** Python/networkx/tree-sitter as an immediate runtime requirement or assume Lua parsing equals complete Luau/Roblox dependency understanding. Also avoid an extra architect call for every trivial edit: Takko already separates planning and execution, and another pass has a real price.

**Verdict:** highest-priority context pattern; small-to-medium prototype, with measurable context-retention tests before paid trials.

### 6. SWE-agent — learn from its agent–tool interface and failure handling

**Observed:** configurable agents combine model, environment, tool handlers, history processing and bounded requery/retry behavior; trajectories retain the run. History processors include selective observation removal and cache-control handling. The retry agent reduces an attempt's budget using previous spend. Its README says development has moved to mini-SWE-agent. [Agent implementation][SW1], [history processors][SW2], [maintenance notice][SW3].

**Adapt:** make Roblox tool feedback concrete enough to support a next decision: instance path, script line, server/client context, failed assertion, expected behavior, observed behavior and reproducible input. Distinguish malformed output, missing capability, stale state and actual gameplay failure. Retry policy should respond to the category instead of asking for the same answer again.

**Do not port:** the full issue-solving framework, shell editing assumptions or generic retry-search over many complete attempts. Repeatedly running the same unsupported scripted import is wasted work. Its history processor also illustrates a tradeoff: changing old prefixes can reduce cache reuse, so fewer prompt tokens do not automatically mean a lower bill.

**Verdict:** adapt failure taxonomy, trajectory and tool-feedback ideas. Prefer mini-SWE-agent for a simple control-loop reference.

### 7. mini-SWE-agent — useful simplicity, not a drop-in Roblox engine

**Observed:** a small agent alternates model queries with environment actions, appends observations and saves trajectories even when an iteration fails. The current implementation handles step, cost, wall-time and repeated-format-error limits. Cost is accumulated from responses; the next query checks the limit, so it is not an exact preflight dollar ceiling. Tests cover termination, observations, partial timeout output and format errors. [Loop][MI1], [environment][MI2], [tests][MI3].

**Adapt:** use a small bounded loop inside a Takko task: inspect relevant state, choose a supported action, receive evidence, repair or stop with an explicit reason. Persist each step. Limit attempts by both money and progress, and preserve Takko's existing admission/reservation accounting.

**Do not port:** its general command-execution surface to Marketplace code, remove schemas to make the loop look smaller, or treat repository benchmark performance as Roblox evidence. Studio is a stateful editor with permissions and ownership constraints, not an interchangeable shell environment.

**Verdict:** best minimal baseline for comparing a tool-using worker with today's structured generation calls. Prototype one task type, not the whole engine.

### 8. SWE-ReX — runtime contracts, not an agent

**Observed:** typed actions/observations separate runtime operations from deployment. Local/remote runtimes provide shell sessions, execution, files, health and lifecycle operations. Remote requests assign an `X-Request-ID`; the inspected helper defaults to zero retries. An ID header by itself does not establish exactly-once effects. [Runtime contract][RX1], [remote transport][RX2], [deployment boundary][RX3].

**Adapt:** keep provider reasoning independent of an explicit Studio runtime interface: capabilities, identity, operation ID, lifecycle, cancellation and reconcilable outcome. Build shared adapter conformance tests across offline doubles and native Studio, while keeping their results distinct.

**Do not port:** bash/PTY runtime or Docker deployment to run Windows Roblox Studio. Takko's durable bridge is already more directly suited to its apply/test operations. Focus on consistency between that bridge and Marketplace/audio/MCP operations, especially restart and lost-response handling.

**Verdict:** valuable contract-testing reference; no runtime dependency recommended.

### 9. OpenHands — durable events and resource-aware concurrency

**Observed:** the supplied repository redirects to `OpenHands/OpenHands`; its current application is Agent Canvas, backed by Agent Server. Consequently the separate, officially linked software-agent SDK was inspected too. The SDK stores typed events, maintains conversation state and condensed views, detects stuck loops, and has parallel tool execution with declared-resource locks. Correct resource declarations are a condition of that concurrency protection. [Application architecture][OH1], [event store][OH2], [condenser][OH3], [executor][OH4], [stuck detector][OH5].

**Adapt:** stable links from a decision to its operation and resulting evidence, a model-facing view separate from the complete event record, and resource-aware scheduling. Independent code preparation or searches can overlap; Studio mutations, playback capture and play-mode transitions need the relevant shared lease.

**Do not port:** the entire Python service/container stack or Agent Canvas UI. Takko already has local service/UI separation and durable Studio receipts. Generic conversation persistence cannot resolve an uncertain native mutation without native reconciliation.

**Verdict:** high-value recovery/concurrency patterns, medium effort when applied to actual uncovered operations. Avoid a storage rewrite before a demonstrated query or reliability need.

### 10. Continue — retrieval design worth studying, maintained dependency unsuitable

**Observed:** retrieval combines full-text search, optional embeddings, recent/open files and repo-map selection; it deduplicates and can rerank before returning a bounded selection. It also supports tool-directed retrieval and per-role model selection. The README declares the repository no longer maintained/read-only and a final 2.0.0 release. GitHub's collected `archived` flag was false; the maintenance notice is the relevant support limitation. [Retrieval base][CO1], [reranking pipeline][CO2], [notice][CO3].

**Adapt:** retrieval over Takko's verified component metadata, source interfaces, Roblox references and known failures. Use exact IDs/paths/requirement links and lexical search first. Add embeddings and reranking only if a retrieval evaluation shows they recover necessary evidence that those cheaper methods miss.

**Do not port:** the entire IDE/indexing service or add vector infrastructure merely because it is available. A candidate with a similar description still requires native verification. Some retrieval paths themselves invoke models, embeddings or rerankers; include those costs in comparisons.

**Verdict:** useful algorithmic reference; selectively adapt code only if its ongoing maintenance cost is acceptable.

### 11. Roo Code — explicit mode contracts and delegation boundaries

**Observed:** modes select groups of tools, and the tool builder filters native/MCP tools or supplies provider restrictions. `NewTaskTool` validates a mode and hands off to a child as the sole active task; this is not evidence of parallel execution by a swarm. The repository also contains compaction, checkpoints and repeated-tool detection. It is archived, and the README announces the extension shutdown on May 15, 2026. [Tool construction][RO1], [delegation][RO2], [repetition detection][RO3], [status][RO4].

**Adapt:** capability-scoped task types with explicit input/output contracts. For example, a component reviewer can inspect source and return findings, but cannot accept its own asset, rewrite the game or publish. The integration worker gets only reviewed components and owned output paths. Enforce this in the tool executor, not merely in a role prompt or provider tool list.

**Do not port:** the extension, its now-unsupported runtime, parent/child UI machinery or “whole team” branding. Takko already separates asset evaluators and workers; the incremental value is making each allowed action mechanically explicit as the tool surface grows.

**Verdict:** borrow mode/delegation contracts; no core dependency.

## Recommended implementation order

| Priority | Concrete change in Takko | Sources of ideas | Evidence required before calling it an improvement |
|---|---|---|---|
| **P0** | Extend the existing original archive → restricted derivative → source-review path with resolved dependencies, an integration plan, owned staging and native verification/export | Existing Takko work; Goose workflow shape, Cline tool feedback | The frozen three imports survive a complete reviewed path with provenance; then fresh workers discover/integrate suitable components without supplied IDs or root-written game fixes. |
| **P1** | Add a context assembler over `gameContext`, `dependencyContext` and archive manifests; preserve exact intent while selecting relevant scene/component details | Aider, Continue, Spacebot | Required dependencies, controls, timing and media evidence survive selection; unrelated material shrinks; source changes invalidate stale selections. |
| **P1** | Provide bounded evidence-read and incremental-edit tools within one task; keep the existing engine/budget/validator outside the loop | mini-SWE-agent, Cline, SWE-agent, OpenCode | A worker fixes a seeded compile/runtime/timing fault using real observations; protected tests cannot be weakened; unchanged/failed actions stop without endless spending. |
| **P2** | Extend durable receipts and resource leases to uncovered native asset/audio operations | OpenHands, SWE-ReX, Spacebot | Restart, lost reply, late completion and cancellation tests never duplicate a mutation or falsely mark it successful; native reconciliation establishes actual state. |
| **P2** | Persist searchable verified-component and failure records | Aider, Continue, Spacebot | Records bind source/asset version, game intent and native evidence; stale or merely plausible candidates are not automatically accepted. |
| **P3** | Context compaction, cache-aware request layout and selective parallel preparation | OpenCode, Cline, Goose, OpenHands | Measured benefit after summaries/retrieval calls/cache misses are counted; equal or better completion rate and no native resource conflicts. |

P0 is the most consequential product work, but it is **Roblox-specific engineering**, not something downloaded from an agent repository. The other changes should be delivered independently so regressions can be attributed to one change.

Concrete boundaries for those additions: extend `asset-contract.ts`/`asset-pipeline.ts` for dependency and integration receipts; compose context beside `game-context.ts` and `engine.ts:dependencyContext`; put bounded reads and base-hash script edits behind the existing adapter rather than a general shell. Keep immutable original sources available to the reviewer even when the builder receives compact interfaces. Native scenarios should verify the behavior named in the requirement: for combat, an actual attack animation, hit registration, dummy reset, counter update and audible feedback; for ASMR, input, visible deformation, sound timing and exactly-once completion counting. A graph, memory record or successful model review cannot substitute for those observations.

## Applying this to the butter example

The discovery worker needs the game experience: a butter ASMR interaction, its input method, squash/recovery timing, audible feedback, counting rule and desired style. “Find a yellow food prop” is not an equivalent assignment. Broad queries such as `butter`, followed by inspection of promising interactive components, are sensible first steps; exact asset IDs from our diagnostic should not be injected into fresh discovery benchmarks.

A proposed task packet should combine: exact request/clarifications; linked acceptance requirements; current task and permitted actions; verified component interfaces; missing behavior; relevant native observations; budget/step limit; and a terminal-result schema. This extends the structured context already implemented. Requiring a source-backed mapping from each acceptance requirement to an observed component feature or an explicit integration gap provides a check on interpretation. Asking the model to say “I understand” does not.

Keep the reusable squash/sound behavior if it fits, then adapt only the missing interaction/counting contract after review. A complete Marketplace component can still require integration. Neither a matching thumbnail nor the presence of an embedded script establishes that its behavior satisfies the requested game.

## Cost and quality: what this research does and does not establish

These repositories provide implementation ideas, not an average dollar price for generating a successful Roblox game. Their models, tasks, tool surfaces and evaluation environments differ. No savings percentage or quality improvement has been measured for these adaptations in Takko.

The likely inexpensive wins are avoiding repeated failed operations, avoiding premature custom implementations of reusable components, and selecting useful context. Extra managers, summarizers, embeddings and rerankers can instead increase cost. Compaction trades a summary call and possible cache-prefix disruption against later input savings. Routing a task to a cheaper model helps only if repair/retry costs do not erase the difference.

Use an incremental evaluation, not an all-at-once framework bake-off:

1. Freeze game requests, acceptance criteria, model routes, maximum spend and starting fixtures. Preserve raw attempts and do not manually rescue outputs.
2. Use offline evidence replays to test context selection, stale-reference rejection, tool contracts, cancellation and repeated-failure termination. These are not native game passes.
3. Finish the known importer gate before new full-game paid comparisons. Compare baseline versus one adaptation on butter/ASMR, combat-with-motion/audio, and checkpoint parkour; then add held-out requests. Repeat paired runs rather than declaring a winner from one stochastic output.
4. Record all model calls, token categories/cache usage where available, actual spend and unresolved liabilities, wall time, tool failures, native acceptance and manual intervention. Compare **total spend across all attempts / independently verified successful games** alongside the success rate. With zero successes, report no finite cost per successful game rather than a misleading cheap average.

The existing [generation economics report](22-game-generation-cost-and-optimization.md) contains the separate $1 cap/Composer investigation. This review makes no budget, model or API-key changes.

## Collection, licensing and limits

The [source index](notes/agent-architecture-source-index.md) lists exact commits and every collected file. There are 89 pinned README/license/source/test files across twelve repositories: eleven requested projects after resolving Spacebot, plus the linked OpenHands SDK. Files were read selectively around relevant implementations; this was not a full security audit. Downloaded code was not executed. Upstream test source was inspected where useful, not run.

Root licenses observed: OpenCode, SWE-agent, mini-SWE-agent, SWE-ReX and OpenHands application/SDK use MIT; Cline, Goose, Aider, Continue and Roo Code use Apache-2.0; Spacebot uses FSL-1.1-ALv2. Direct reuse still requires checking the chosen files, dependencies and notices. No third-party implementation was copied into Takko's application in this task.

Research verification checks snapshot hashes and sizes, selected-path presence in the pinned trees, complete project coverage, local comparison-file hashes and report references. No paid API calls, Studio runs or app-code changes occurred. An application `npm run check` would not validate these architectural hypotheses; implementation changes must later run it and receive separate native verification.

<!-- Generated pinned source references -->

[OC1]: <https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/session/processor.ts>
[OC2]: <https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/session/compaction.ts>
[OC3]: <https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/agent/agent.ts>
[OC4]: <https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/permission/index.ts>
[SB1]: <https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/docs/content/docs/(core)/architecture.mdx>
[SB2]: <https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/docs/content/docs/(features)/workers.mdx>
[SB3]: <https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/src/agent/worker.rs>
[SB4]: <https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/src/memory/search.rs>
[SB5]: <https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/LICENSE>
[CL1]: <https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/README.md>
[CL2]: <https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/context/basic-compaction.ts>
[CL3]: <https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/executors/output-limits.ts>
[CL4]: <https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/model-tool-routing.ts>
[CL5]: <https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/executors/apply-patch.ts>
[CL6]: <https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/runtime/safety/loop-detection.ts>
[GO1]: <https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose/src/agents/large_response_handler.rs>
[GO2]: <https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/documentation/docs/guides/recipes/recipe-reference.md>
[GO3]: <https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose/src/agents/state_machine/mod.rs>
[GO4]: <https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose/src/agents/state_machine/ops_tool_pair_compaction.rs>
[AI1]: <https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/repomap.py>
[AI2]: <https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/architect_coder.py>
[AI3]: <https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/editblock_coder.py>
[SW1]: <https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/sweagent/agent/agents.py>
[SW2]: <https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/sweagent/agent/history_processors.py>
[SW3]: <https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/README.md>
[MI1]: <https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/src/minisweagent/agents/default.py>
[MI2]: <https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/src/minisweagent/environments/local.py>
[MI3]: <https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/tests/agents/test_default.py>
[RX1]: <https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/src/swerex/runtime/abstract.py>
[RX2]: <https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/src/swerex/runtime/remote.py>
[RX3]: <https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/src/swerex/deployment/abstract.py>
[CO1]: <https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/context/retrieval/pipelines/BaseRetrievalPipeline.ts>
[CO2]: <https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/context/retrieval/pipelines/RerankerRetrievalPipeline.ts>
[CO3]: <https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/README.md>
[RO1]: <https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/task/build-tools.ts>
[RO2]: <https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/tools/NewTaskTool.ts>
[RO3]: <https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/tools/ToolRepetitionDetector.ts>
[RO4]: <https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/README.md>
[OH1]: <https://github.com/OpenHands/OpenHands/blob/82203bb1011cdf0e6eb318a32111806a6f6f734a/README.md>
[OH2]: <https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/conversation/event_store.py>
[OH3]: <https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/context/condenser/llm_summarizing_condenser.py>
[OH4]: <https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/agent/parallel_executor.py>
[OH5]: <https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/conversation/stuck_detector.py>
