# Takko market and viability evidence

Research date: 2026-09-24 UTC. Research only. No product changes, paid inference, competitor generation, Studio operations or process restarts.

## Preliminary judgment

The evidence does not yet justify scaling Takko as a general paid Roblox game generator. Roblox is entering the same workflow, free open-source Studio agents exist, and several paid competitors already advertise targeted edits and testing. This is a reason to validate a specific advantage before further broad investment, not proof that no worthwhile product exists.

A narrower product could still be worth pursuing if it reliably completes a recurring job that existing tools fail at, with less user intervention and a sustainable cost. That advantage has not been demonstrated by our fighting benchmark. For a personal tool, the decision instead depends on time saved and enjoyment relative to maintaining it.

These are provisional conclusions. The user confirmed the goal is a paid product or business. Customer evidence and acceptable investment remain unknown. No pivot, scope reduction or replacement of the already-reviewed proposal-flow design has been approved.

## Requested skills and review status

Used [competitor-tracking](C:/Users/7474g/.agents/skills/competitor-tracking/SKILL.md) for the expanded landscape. Read the installed gstack [office-hours](C:/Users/7474g/.agents/skills/gstack/office-hours/SKILL.md) and [plan-ceo-review](C:/Users/7474g/.agents/skills/gstack/plan-ceo-review/SKILL.md), and inspected the [requested upstream repository](https://github.com/garrytan/gstack).

gstack supplies development and review workflows. It is not a Roblox game-builder competitor. Its useful contribution here is to challenge demand, premises, alternatives and scope before committing more engineering effort.

Office-hours status: **NEEDS_CONTEXT**, Startup mode. The user answered the goal question with "A paid product or business". The first demand question is now pending: strongest actual evidence that someone would pay, grounded in a specific person's behavior. No demand answers or accepted premises have been invented.

CEO review status: **pre-audit only**. The skill requires Step 0 scope and mode agreement before its detailed review. No mode has been selected, and no full CEO review or approved design is claimed. The repository audit found extensive existing uncommitted work, one initial commit in the inspected history, and no stashes or root TODOS.md. This research preserves that work.

## Expanded competitor landscape

Prices are public offers observed on this date, generally USD. Credits, requests, actions and tokens are different units. None establishes a competitor's internal cost or cost per successfully completed game. Functionality below is vendor documentation unless explicitly identified as inspected source. No competitor was installed or tested in this session.

| Product | Evidence and pricing | Implication for Takko |
|---|---|---|
| Roblox Assistant and Studio MCP | Roblox documents editable planning, tool execution and playtesting workflows. Its official MCP exposes Studio to external coding agents. [Announcement](https://about.roblox.com/newsroom/2026/04/roblox-studio-going-agentic), [documentation](https://create.roblox.com/docs/ai/accelerated-workflows) | Studio access and plan/build/test orchestration alone are weak differentiation. |
| Roblox Build | Official docs describe prompt-based creation, free daily prompts and Robux top-ups. Current focus is simpler 2D/2.5D games with regional rollout. 3D is future scope. The page contradicts itself about playtesting, saying unavailable before giving instructions. [Documentation](https://create.roblox.com/docs/ai/build) | Direct platform and distribution pressure on beginner game generation. Not evidence that the current product replaces our 3D fighting benchmark. |
| BloxBot | Free MIT desktop app using OpenCode and official Studio MCP, with user-supplied providers through keys or OAuth. Read its public README, not a runtime audit. Inference or a provider subscription still costs money. [Repository](https://github.com/paralov/app-bloxbot-ai) | A concrete free application baseline for a multi-model Studio bridge. Its existence raises the burden for charging merely for connectivity. |
| Ropilot | Studio agent offering integrated inference or separate actions for a user's existing subscription. AI Plus advertises $20/month with 40 credits/week. The actions plan is distinct and does not include those AI credits. [Pricing](https://ropilot.ai/pricing), [product](https://ropilot.ai/) | Compare total user expense and completed work, not its subscription price against Takko's per-run inference. |
| RoCode | Advertises Studio-connected generation, targeted edits and native undo, with a free starter tier. Search-indexed paid prices were not confirmed in the freshly opened pricing section, so omitted. [Official site](https://www.rocode.app/) | Preserving existing work and small edits already appear in competing offers. |
| RoCreator | Own guides describe existing-project features, preview/rollback and bounded repair. Its indexed official guide lists Pro at $9.99/month for 250 requests with a daily limit. Homepage fetch timed out, so pricing is less firmly verified than the directly opened pages above. [Official guide](https://rocreator.app/how-to-use-ai-in-roblox-studio), [workflow claims](https://rocreator.app/roblox-studio-ai-assistant) | Narrow feature editing is already contested. Request allowances do not establish a working-feature price. Its descriptions acknowledge limits of automatic input-driven testing. |
| Forge, at forgeblox.app | Advertises an agent acting inside Studio. Public offer is $10 for 1,000 credits, with typical steps advertised as 20–150 credits, approximately $0.20–$1.50 per step. [Official site](https://forgeblox.app/) | A step is not a complete game. This product is unrelated to Takko's former Forge name. |
| studs.gg | Browser game builder. Official support lists Pro at $19.99/month, 400 daily credits and a 1,200-credit carry cap. One free run, then paid builds/edits. [Support](https://www.studs.gg/support/billing-credits-and-plans/what-do-i-get-with-pro), [product](https://www.studs.gg/) | Hosted simplicity and predictable allowances compete for beginners. No verified completed-game cost was found. |
| Bloxsmith | Specialized Roblox UI generation. Pricing advertises $0.50 initial frames and metered follow-ups. Its own page says game logic still needs wiring and testing in Studio. [Pricing](https://bloxsmith.net/pricing) | A narrow deliverable can be sold with an understandable unit price, but UI generation alone does not complete gameplay. |
| Rosebud | Adjacent hosted browser game creation. Published plans range from $15/month upward with credit allowances. Its target differs from a native Roblox workflow. [Pricing](https://rosebud.ai/pricing), [product](https://rosebud.ai/ai-game-creator) | Competes for the broader desire to make a playable game easily, even when Roblox export is not the requirement. |

Superbullet, Lemonade and ForgeGUI.com remain relevant. Their public claims, retained client evidence and cost limitations are documented separately in [the preceding cost report](competitor-cost-optimization.md). Superbullet's reusable system contracts are useful architectural evidence. None of these products supplied a verified invoice for completing our benchmark. StudWorks surfaced as an additional lead, but its accessible page did not provide sufficient detail to include as a validated comparison.

## What the evidence changes

**A lower price is insufficient by itself.** Free application shells, bundled platform features and subscription-funded inference all put pressure on a generic paid wrapper. This is an inference from the offers above, not knowledge of their margins or model contracts.

**A narrower scope is also insufficient by itself.** Existing-game feature editing, context inspection, rollback and testing are already advertised. A viable claim must name a task and demonstrate better completion, less repair or less creator effort. "We use several agents" describes implementation rather than a customer benefit.

**Reliability remains a plausible but unproven opportunity.** Correctly integrating animations, audio, effects and gameplay behavior while preserving earlier edits could matter. It needs observed input-driven Studio results, not compilation, screenshots, model approval or our offline tests alone. The benchmark must also generalize beyond the exact fighting prompt.

**Platform distribution is a structural risk.** A standalone beginner product needs a reason to be discovered and used despite Roblox's native entry points. No distribution advantage or repeat paying demand was found in the inspected project evidence. That does not mean the user has none outside the repository.

## Takko's present position

Observed evidence is in [the fighting benchmark report](conversation-fighting-benchmark.md), its preserved receipts, and [the cost audit](competitor-cost-optimization.md).

- The latest fighting run failed before generating a game. It produced no native gameplay pass.
- The proposal and theme-only edit retained content. Automatic asset recommendations selected nothing at the confidence threshold, requiring a disclosed manual fallback.
- The run's 20 recorded charges total $0.798722. Five implementation-planning calls alone cost $0.733648 and emitted 48,541 output tokens before code.
- The implementation has useful preservation and accounting foundations. Those do not yet establish demand or delivery quality.
- Takko currently builds inside its own namespace. A promise to safely modify arbitrary existing games would expand capability and risk beyond the present adapter.

The earlier $1–$3 small-game optimization target is unmeasured. The current $6–$15 first-pass and $12–$30 repair-inclusive estimates are assumptions, not full-run invoices. Neither should be used to promise customer pricing.

Measure total variable cost per accepted result: all planning, generation, failed attempts, repairs, validation, asset/media expenses and support effort, divided by accepted outcomes. Also measure creator time and abandonment. A cheap failed attempt has no useful denominator until something is accepted.

## Alternatives for the interactive review

These are options for discussion, not selected scope or a new implementation plan.

| Direction | Strongest case | Main burden of proof |
|---|---|---|
| Minimal: personal workflow and selective Takko improvements | Preserve useful work while comparing against an existing free Studio agent. Focus investment on actual time saved. | Takko materially improves the user's own workflow enough to justify maintenance. |
| Focused product: one reliable, bounded creator job | Sell a completed outcome with clear limits, preservation and a budget cap. Asset integration plus observed behavior is one candidate. | Specific repeat users, an unsolved task, native success across varied inputs, willingness to pay and adequate margin. |
| Broad platform: keep the full beginner game-builder ambition | A sufficiently simple and reliable end-to-end experience could have value. | More capital and engineering, a distribution advantage, broad success evidence and sustainable support economics. Current evidence is insufficient. |

My provisional preference for a business is a bounded validation of the focused option before broad expansion. This does not authorize a pivot or reopen the approved conversation-flow implementation design.

With the business goal confirmed, office-hours should establish the strongest real demand evidence, the current workaround and a specific intended user. The CEO review can then agree scope and mode. A useful proposed validation would compare the same bounded tasks against a free baseline, including the fighting request and unrelated genres, record every cost and manual rescue, and observe intended users without coaching. Paid trials require separate run authorization.

Continue if users repeatedly choose the result, it offers a measurable advantage and costs leave room for support. Reduce or stop commercial investment if the free baseline is equivalent, outcomes remain dependent on repeated manual rescue, or interest does not become use or payment. No arbitrary success numbers are presented as agreed thresholds.

## Verification and operations

Public primary pages and the local review skills were read. Public offers are not independently verified product performance. The expanded market study did not run any competitor generation or Takko inference.

No implementation changed, so no new test suite was run. `npm run check` was not run in this research session. Earlier test results remain recorded in their original reports and do not establish native Studio gameplay.

At approximately 2026-09-24T04:26Z, no listeners were found on 4318, 4319, 4324, 4335 or 4336. Studio processes 3088 and 6604 remained present. Studio mode was not inspected or changed. No Studio session was performed and no process was touched.

New paid cost: $0. Historical accounted spend remains $3.990954 of $4.40, including unknown holds, with $0.409046 remaining authorization. Last recorded provider balance remains $1.263503974 at 2026-09-24T03:32:45.775Z and was not refreshed. Failed project e4689e81-9de2-4d7d-b958-c904194f6a44 and prior evidence remain untouched.
