# Generation quality research: sources and transfer limits

Reviewed **2026-09-13**. These primary sources support engineering directions, not claims about Lemonade's private implementation. Paper abstract-level findings are identified below; benchmark percentages are deliberately not treated as expected Roblox gains.

| ID | Primary source | Evidence used | Transfer limit |
|---|---|---|---|
| Q01 | [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), Anthropic, 2025-09-29 | Engineering discussion of selective retrieval, compact state and avoiding low-signal context | No controlled Lemonade result or universal optimal prompt size |
| Q02 | [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp), Anthropic, 2025-11-04 | Filtering and transforming large tool results outside the model can reduce context traffic | Their large token-reduction example involves a different workload; 23 Lemonade tools do not justify an elaborate discovery service by themselves |
| Q03 | [Agentless](https://github.com/OpenAutoCoder/Agentless), authors' repository | Hierarchical fault localization, patch generation and validation provide a concrete simple workflow | Repository issue repair differs from whole-game creation; use architecture ideas, not historical benchmark cost estimates |
| Q04 | [GEPA: Reflective Prompt Evolution Can Outperform Reinforcement Learning](https://arxiv.org/abs/2507.19457), Agrawal et al., 2025 | Abstract describes failure-informed prompt updates and selection; links released implementation | Task-dependent optimization results; needs held-out Roblox evaluation. Full HTML fetch failed due size, so no unreviewed experimental details are claimed |
| Q05 | [Scaling Test-time Compute for LLM Agents](https://arxiv.org/abs/2506.12928), Zhu et al., 2025 | Abstract reports benefits from reflection timing, diverse attempts and selection methods | Additional compute has cost; no evidence unlimited retries are economical for Roblox |
| Q06 | [Scaling Test-Time Compute for Agentic Coding](https://arxiv.org/abs/2604.16529), Kim et al., 2026 | Abstract describes compact trajectory summaries, selection and reuse of prior attempts | Evaluates frontier coding agents on software/terminal benchmarks, not cheap Roblox models; informs failure memory, not a parity claim |
| Q07 | [Scaling Agentic Verifier for Competitive Coding](https://arxiv.org/abs/2602.04254), Ma et al., 2026 | Abstract describes targeted counterexamples that distinguish candidate programs | Trained verifier and competitive-programming setting; cannot obtain its results by simply prompting an unchanged cheap judge |
| Q08 | [Large Language Models Cannot Self-Correct Reasoning Yet](https://arxiv.org/abs/2310.01798), Huang et al., 2023 | Abstract reports limitations of correction without external feedback on studied reasoning tasks | Older models/tasks; not a universal statement about 2026 models. Supports testing feedback-free revision instead of assuming it works |
| Q09 | [Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents), Anthropic, 2026-01-09 | Outcome-based evaluation, traces, repeatability and multiple grading layers | Vendor engineering guidance; graders still need validation for Roblox |
| Q10 | [Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps), Anthropic, 2026-03-24 | Full article describes generation/evaluation separation, concrete visual criteria, calibrated reviewers and component ablation. One example increased cost from $9 to $200 while improving output | Examples are not broad controlled cost claims; scope also expanded. More scaffolding can be expensive, and a stronger model can remove the need for parts of it |
| Q11 | [Small Language Models are the Future of Agentic AI](https://arxiv.org/abs/2506.02153), Belcak et al., 2025 | Position paper advocates specialized inexpensive model invocations | A position paper is not evidence that cheap models equal Astra; low price does not establish parameter count |
| Q12 | [OpenRouter prompt caching](https://openrouter.ai/docs/guides/best-practices/prompt-caching) | Current documentation describes provider/model-specific cache support, session/provider stickiness, and usage accounting | Exact discounts, minimum prefixes, TTL and writes differ by model/provider; billed savings require measurement |
| Q13 | [Roblox ScriptEditorService](https://create.roblox.com/docs/reference/engine/classes/ScriptEditorService) | Current-source reads and UpdateSourceAsync callback/retry semantics | Requires correct conflict handling; API choice alone is not transactional editing |
| Q14 | [Roblox Studio testing modes](https://create.roblox.com/docs/studio/testing-modes) and [StudioTestService](https://create.roblox.com/docs/reference/engine/classes/StudioTestService) | Client/server, multiplayer and device testing; programmatic test entry points | Verify installed Studio capability and executor support; availability in docs does not establish use by Lemonade |
| Q15 | [Luau getting started](https://luau.org/getting-started/) and [Roblox type checking](https://create.roblox.com/docs/luau/type-checking) | Official CLI analysis and Roblox type-system context | Static validity is not gameplay correctness; standalone environment setup matters |

## Synthesis

The literature supports investing in context quality, bounded work, reusable knowledge, verification and selective extra compute. It also gives reasons to reject a simplistic “add agents until the cheap model becomes the expensive model” design. **The Roblox component compiler, dependency graph, repair policy and economic experiments in this dossier are proposed adaptations**, not results directly demonstrated by these publications.

No accessed source establishes Astra's exact API deployment, price or Lemonade-task baseline. Treat “Astra” as the user's intended strong comparison model; record an actually available endpoint/version and invoiced rates before experiments. No price or model-equivalence claim has been inferred from this Codex session.

## Follow-up: Cursor, MCP and guided design

Reviewed on the same date for [the Cursor-inspired proposal](10-cursor-inspired-studio-system.md).

| ID | Primary source | Use and limit |
|---|---|---|
| C01 | [Continually improving our agent harness](https://cursor.com/blog/continually-improving-agent-harness), 2026-04-30 | Model-specific interfaces, evaluation and tool reliability; vendor report, not source-code access |
| C02 | [Dynamic context discovery](https://cursor.com/blog/dynamic-context-discovery), 2026-01-06 | Selective context/tool loading; reported token result applies to a specified MCP-using test subset |
| C03 | [Improving agent with semantic search](https://cursor.com/blog/semsearch), 2025-11-06 | Retrieval evaluation; code-QA results do not imply Roblox generation parity |
| C04 | [Introducing Plan Mode](https://cursor.com/blog/plan-mode), 2025-10-07 | Clarification and editable planning workflow |
| C05 | [Improving Cursor's agent for OpenAI Codex models](https://cursor.com/blog/codex-model-harness), 2025-12-04 | One concrete model integration case; not instructions to use identical settings for unrelated cheap models |
| C06 | [A technical report on Composer 2](https://cursor.com/blog/composer-2-technical-report), 2026-03-27 | Training contributes to its capability; public overview reviewed, not reproduction of training |
| C07 | [Cursor Agent Skills](https://cursor.com/docs/skills) | Skill packaging and progressive loading; host behavior requires implementation |
| R01 | [Built-in Studio MCP](https://create.roblox.com/docs/studio/mcp) | Current local integration; connected-instance support was not runtime-tested |
| R02 | [Archived Roblox Rust MCP](https://github.com/Roblox/studio-rust-mcp-server) | Archive status and recommendation to use built-in server |
| R03 | [Creator-authored skills announcement](https://devforum.roblox.com/t/assistant-updates-introducing-creator-authored-skills/4728447) | Official search result found; full page blocked. Native installation details unverified |
| R04 | [Creator Store](https://create.roblox.com/docs/production/creator-store) | Asset access/permission considerations; search visibility is not proof of usability |
| R05 | [Use animations](https://create.roblox.com/docs/animation/using) | Official animation implementation reference; no candidate animations evaluated |
| M01 | [MCP TypeScript SDK server guide](https://ts.sdk.modelcontextprotocol.io/server) | Tool/schema/transport implementation support; does not implement domain operations |
| L01 | [Session tool metadata](evidence/tooling/roblox-mcp-catalog.json) | Directly exposed contracts: 29 tools, Animation absent from search enum, no connected Studio from discovery |

The official [animation-permissions announcement](https://devforum.roblox.com/t/improving-animation-asset-permissions/3852101) also appeared in search. Its full page was not retrieved. We do not rely on older community claims that same-owner animations are the only possible permission arrangement; validate loading for the actual target experience.
# Additional research extension

The 2026-09-13 follow-up adds [open-source implementation findings](12-open-source-reuse.md), [papers and controlled experiments](13-research-findings-and-experiments.md), and a [commit-pinned source index](notes/open-source-index.md). Those documents distinguish published evidence from proposed Roblox adaptations.
