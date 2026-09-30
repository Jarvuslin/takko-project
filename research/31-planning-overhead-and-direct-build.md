# Why runs die before code, and the fix

2026-09-30. Evidence from two real paid runs, Takko's source, earlier repo research, competitor observations and Anthropic's published agent guidance. No paid calls were made for this report.

## Result

Both of the latest real runs died in planning and never reached the builder. The cause is architectural: Takko runs a multi-worker planning pipeline in front of the OpenCode builder, and every planning output must pass strict validators that end the run when a model misses a format rule twice. The fix is to remove the planning workers from the default path and let one agent session build the game, with Takko's checks as tools that give it feedback, not gates that kill the run.

## Evidence from the two runs

| Run | Request | Planning calls | Input tokens | Output tokens | Spend | Code produced | Died on |
|---|---|---:|---:|---:|---:|---|---|
| 07a88f8e | punch dummy, animation, sound, counter | 9 | 256,025 | 68,178 | $1.189 | none | "Multiple approved groups link to the same asset need: foundation_TargetDummy" |
| 6e6ffc7f | dummy, R6 punch animation, counter | 10 | 423,695 | 50,502 | $1.352 | none | "requirements: Too big: expected array to have <=40 items", after a touch-wording rejection |

In 6e6ffc7f each planning call re-sent the growing plan, so input grew from 12,185 to 61,273 tokens per call. The plan output alone (50,502 tokens) is roughly ten times the size of the finished game's code for this request (a dummy placement, one client input script, one server check, a small HUD).

## How the pipeline is built (source)

- `src/generation/coordinator.ts`: an outline splits the game into up to 10 `areas`. Each area gets its own planning worker call, with the prior plan as context. The 6e6ffc7f run had seven, including "Native gameplay verification", a stage Takko cannot perform because it stops at ready to test.
- `src/generation/schema.ts:156`: the merged spec allows at most 40 requirements. Merging several area plans for even a small game can exceed it.
- `src/generation/engine.ts`: planner outputs are rejected on schema or validator failures (worker ID prefixes, PC-platform wording, asset-group identity) and retried within a small attempt limit (`maxAttempts` defaults to 2). Exhausted attempts fail the whole run.
- The OpenCode builder only starts after all of this passes.

## What earlier research already said

`docs/opencode-competitor-reevaluation.md` (2026-09-24) recommended OpenCode as the replacement for the inner coding loop and warned: "Avoid placing OpenCode inside every current worker while retaining all existing paid planning and review stages. That could add a second agent loop without removing the first loop's overhead." The current build did exactly that. Report 24 also found OpenCode cheaper per task mainly through prompt caching (87.6% cached input), which the append-only agent loop gets naturally.

## How working tools structure the same job

- Lemonade (observed 2026-09-28, research 30): one "Plan ready for approval" step, then a single agent performing actions directly (27 actions: doc search, instance creation, script edits, playtest), then a summary. No multi-worker planning.
- BloxBot (source, 2026-09-24): hands the request to an OpenCode agent session with Studio tools.
- SuperbulletAI 0.3.99 (research 27): a LangGraph agent and tool loop.
- Anthropic, "Building effective agents": start with "the simplest solution possible" and add complexity "only when it demonstrably improves outcomes". Agents are "LLMs using tools based on environmental feedback in a loop". Code suits agents because it is "verifiable through automated tests", so agents "iterate on solutions using test results as feedback". The orchestrator-workers pattern fits "complex tasks where you can't predict the subtasks needed". A three-script game is not that.

None of these runs a separate paid planning worker per game area before writing code.

## Recommended design

1. **Proposal stays.** One planner call produces the proposal, and the user answers questions and supplies assets in the chat. This part works and is cheap ($0.06 to $0.09 in both runs).
2. **One build agent session replaces the planning workers.** After Approve & build, a single OpenCode session receives the request, answers, proposal, world, platform and rig decisions, the attached assets' captured hierarchy and clip or sound paths, and only the relevant guidance. It writes its own task list as part of its work.
3. **Checks become tools, not gates.** Compile, instance-path, scene, platform, rig and asset checks are callable by the agent and return feedback it acts on. Format problems (ID prefixes, list caps, wording) are normalized deterministically. A run only stops for budget, a user Stop, or a real error explained in plain words.
4. **Stable prompt prefix** so the append-only session gets cache hits, as OpenCode did in report 24.
5. **Spend guard.** Pause, not fail, when spend passes a threshold without files written, and tell the user.
6. **Review** stays as one call on the finished code, and cannot kill a run for formatting.

Expected cost for this request, from Takko's own history: the 2026-09-27 run that reached OpenCode spent $1.53 across 30 coding calls plus $0.30 for review. A direct path should land near that total, with no planning spend in front of it and without the planning failure modes. This is an estimate from one prior run, not a measurement.

## How to validate before trusting it

- Replay both failed requests' saved inputs with mocked model replies. The direct path must reach the builder and write files.
- Then one paid comparison, with the user's approval and a cap: the same request, attached assets and rig on the direct path, reporting cost, calls, time, export structure checks and the user's Studio test.
- Keep the multi-worker path behind a setting only until the direct path has passed on at least two different real requests, then delete it.

## Sources

- Runs: `.forge/chat-clean-20260929/projects/6e6ffc7f-d435-4fb1-a722-3699a0749a74.json`, `.forge/fresh-desktop-20260929/projects/07a88f8e-1e51-4c81-980c-e5fb0731faa0.json`
- `docs/opencode-competitor-reevaluation.md`, `research/24-agent-effectiveness-comparison.md`, `docs/bloxbot-source-comparison.md`, `research/27-superbullet-installed-architecture.md`, `research/30-lemonade-flow-walkthrough.md`
- https://www.anthropic.com/engineering/building-effective-agents
