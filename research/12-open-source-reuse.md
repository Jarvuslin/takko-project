# Open-source components worth evaluating

Research date: 2026-09-13. This extends the [Cursor-inspired system proposal](10-cursor-inspired-studio-system.md). The recommendation is a small Roblox-specific controller supported by existing development tools. None of these projects is a complete Lemonade replacement, and none establishes cheap-model parity with Astra.

## What was inspected

Collected public repository metadata and complete Git tree listings for 13 repositories, pinned to commit IDs. Downloaded 46 selected source, documentation and license files, totaling 581,468 bytes. Read the relevant implementation sections identified below; this is a focused source review, not a full audit or runtime evaluation. No downloaded agent code was executed or installed into Studio.

The [repository manifest](evidence/open-source/repositories.json), [file manifest](evidence/open-source/files-manifest.json), and [selection](open-source-selection.json) preserve provenance. The [source index](notes/open-source-index.md) supplies immutable links and local copies. License labels below describe the inspected root license; dependency and asset licenses are separate.

## Shortlist and decisions

| Project | Root license observed | Useful part | Recommended disposition |
|---|---|---|---|
| [Aider](https://github.com/Aider-AI/aider) | Apache-2.0 | Ranked, token-budgeted repository map | Adapt the retrieval design to Luau, DataModel paths and remote contracts |
| [mini-swe-agent](https://github.com/SWE-agent/mini-swe-agent) | MIT | Small execution loop, trajectory recording, cost and step limits | Baseline to compare against our controller; avoid adding orchestration without evidence |
| [OpenHands SDK](https://github.com/OpenHands/software-agent-sdk) | MIT | Conversation state, event history and context condensation | Evaluate if its persistence and lifecycle features save meaningful implementation work |
| [GEPA](https://github.com/gepa-ai/gepa) | MIT | Feedback-driven optimization of prompt components | Offline experiment after trustworthy Roblox evaluation exists |
| [Rojo](https://github.com/rojo-rbx/rojo) | MPL-2.0 | Filesystem/project mapping and sourcemap generation | Evaluate as development infrastructure; establish which side owns each editable source |
| [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp) | MIT | Roblox-aware source diagnostics and instance-tree context | High-priority validator and retrieval input |
| [Lune](https://github.com/lune-org/lune) | MPL-2.0 | Standalone Luau and place/model processing | Optional offline fixture and pure-logic tooling |
| [Flipbook](https://github.com/flipbook-labs/flipbook) | MIT | UI stories with adjustable controls | First preview integration candidate |
| [UI Labs](https://github.com/PepeElToro41/ui-labs) | GPL-3.0 | Story loading, hot reload and cleanup lifecycle | Alternative tool and design reference; do not assume the same reuse terms as Flipbook |
| [RbxUtil](https://github.com/Sleitnick/RbxUtil) | MIT | Small modules, including Trove cleanup utilities | Selective foundations for tested components; not an entire game framework |
| [Voyager](https://github.com/MineDojo/Voyager) | MIT | Retrieval of executable behaviors by description | Adapt the library concept to verified Roblox recipes |
| [Holodeck](https://github.com/allenai/Holodeck) | Apache-2.0 | Semantic spatial constraints followed by placement solving | Adapt the constraint architecture; avoid importing its whole simulator pipeline |
| [AlphaCodium](https://github.com/Codium-ai/AlphaCodium) | AGPL-3.0 | Test-driven generation and repair research | Algorithm reference and experimental comparison, not default embedded dependency |

## Findings that affect our implementation

### Context should include relationships, not just similar text

Aider's `RepoMap.get_ranked_tags` constructs a weighted graph of references and definitions, biases relevance using mentioned identifiers and active files, and applies PageRank. `get_ranked_tags_map_uncached` searches for a representation near its token allowance. This supplies an inspectable alternative to stuffing every script into a prompt.

Our adaptation should represent `require` dependencies, instance paths, client/server ownership, RemoteEvent payload contracts and the files affected by a proposed edit. Start with exact paths and dependency expansion; measure whether embeddings add value. Do not assume support for ordinary Lua proves full Luau syntax support. Cache by revision and revalidate before mutation.

### Passing static analysis can still miss broken Roblox references

luau-lsp's README explicitly says DataModel types resolve to `any` in diagnostics by default to reduce false positives. It exposes `luau-lsp.diagnostics.strictDatamodelTypes`, off by default. Rojo's sourcemap command can include non-script instances and update while watching changes.

Use a current instance snapshot plus strict diagnostics on representative fixtures. Measure false positives before treating all diagnostics as build blockers. A source map cannot prove that a dynamically created object exists at the required moment, or that a server validates a remote request. Those need scenario checks in Studio.

Lune explicitly excludes running full Roblox games from its goals. Its document module handles Roblox document operations; it is suitable for offline tooling, not a substitute for physics, replication, animation or device playtests.

### Preview the component that will actually ship

Flipbook's React controls example maps editable story properties into the rendered component. This is useful for showing actual HUD states: full/low health, ability ready/cooling down, desktop/touch layout, long ability names and missing icons. The preferred workflow renders the same component later inserted into the game; a separate attractive mock image cannot establish working UI behavior.

UI Labs' function-story documentation requires cleanup and identifies a failure case when mounting throws before cleanup is returned. Its loading environment tracks dependencies and disconnects listeners on destruction. Our preview tool still needs request-scoped instance tracking, cleanup on failure and revision isolation. Storybook isolation is not proof of a security boundary for arbitrary generated code.

### Keep execution state outside the model

mini-swe-agent's default agent provides explicit query/execute steps, accumulated cost, limits and trajectory serialization. Its cost limit is checked before a model request, so the last call can cross the limit. Our controller should reserve a bounded amount before dispatch if a strict spending ceiling is required, and account for tests and assets as well as tokens.

OpenHands separates persistent conversation state from its context view. Its condenser documentation describes an append-only event history with summary events rather than deleting history. It also acknowledges cache disruption from condensation. Borrow the distinction: preserve complete actions and user decisions in durable state, while sending the builder only the current contract, relevant source and recent failures. Critical requirements must survive independently of a generated summary.

### Reuse verified behaviors; solve geometry deterministically

Voyager's skill manager stores code and descriptions, retrieves descriptions by vector similarity, then returns the corresponding executable code. Its critic can use model judgments, so copying its approval mechanism would not provide independent correctness. For our library, each recipe needs compatible versions, parameters, protected tests and an explicit promotion process. Retrieval finds candidates; compatibility checking decides whether they can be used.

Holodeck's floor generator asks the model for object relationships, parses constraints, obtains real asset dimensions, initializes door/window placements and invokes a bounded placement solver. This suggests a better arena workflow: choose an arena style and semantic arrangement, then compute positions against collision, clearance, navigation and camera constraints. Some source parsing uses fuzzy correction; our typed schema should return a repairable validation error when ambiguity matters. Roblox assets and movement rules require new adapters and checks.

### Optimization needs an honest grader first

GEPA's adapter accepts candidate text components and returns per-example outputs, scores and optional execution traces. It also asks for reflective feedback for components being optimized. This fits offline tuning of genre inference, tool descriptions and repair instructions. It cannot supply the missing Roblox success definition. Keep final evaluation separate from optimization and include reflection, test execution and failed candidates in cost.

AlphaCodium's evaluator executes candidates and compares observed outputs. Its own `reliability_guard` explicitly warns it is not a security sandbox. Use the research lesson—test-informed repair—without treating a Python contest runner as our Roblox execution environment.

## Recommended first integration order

1. Build observable outcomes and a disposable Studio fixture around the existing MCP bridge. Preserve source revisions, operation IDs and a result journal.
2. Add current project mapping and luau-lsp diagnostics. Test missing-instance and client/server boundary failures deliberately.
3. Add one fighting-game recipe: attack, server-authoritative damage, cooldown, respawn and a working HUD. Keep animation, sound and VFX references explicit and validated.
4. Add a Flipbook-based HUD preview experiment. Verify mounting, updates, cleanup and touch layouts before expanding the preview surface.
5. Compare exact/dependency retrieval with an Aider-style ranked map. Adopt more complex context machinery only if it improves accepted outcomes per dollar.
6. Run GEPA offline once a stable evaluation set can distinguish plausible output from working gameplay.

See [research findings and experiments](13-research-findings-and-experiments.md) for the evidence and the tests that could reject these proposals.
