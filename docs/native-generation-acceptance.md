# Independent collect/sell acceptance scenarios

`tests/native-generation-acceptance.luau` is a test-only oracle for the fixed specification in `scripts/evaluate-generation.ts`. It is authored independently of candidate models and their generated acceptance tests. Its expected values are fixed constants; it does not read model-generated Contract constants to decide what should pass.

The source currently **compiles with the installed Luau compiler**. An isolated Luau mock test verifies cursor round-tripping across freshly loaded copies and rejects invalid or stale cursors. These are not native test results. Record actual phase output, artifact hash, model/trial, Studio session and client count when executing it.

## Loading and execution

Use a fresh disposable exported place per candidate. The generated namespace is always `Forge_GenerationPilot`; never combine candidate artifacts in one place. Start one solo play session. Inline a fresh source copy in each permitted Server or Client execution:

```lua
local acceptance = (function()
    -- Insert the complete tests/native-generation-acceptance.luau source here.
end)()
```

No retained table, ModuleScript installation, or generated-module `require` is necessary. Server calls use `acceptance.serverStep(method, phase, state, optionalPlayerName)` and return `{result, state}`. Save the returned JSON-safe `state` and pass it into the next Server call. It contains only primitive cursor values, never Instances or gameplay values used as expectations. Client `act` and `hud` calls already work without retained state.

For example, the first Server call returns `acceptance.serverStep("begin")`. In the next fresh inline execution, decode the previous returned `state` using `HttpService:JSONDecode(...)`, then return `acceptance.serverStep("prepare", "malformed", state)`. After the Client action, pass that newly returned state into `acceptance.serverStep("verify", "malformed", state)`. Continue carrying each latest Server state forward. A test-only character attribute witnesses unexpected character replacement between prepare and verify.

Run each row in order. Supply an exact player name to Server methods when more than one client exists; omitted names require exactly one player. This sequence alone is a solo test, even if other clients happen to be present.

| Step | Server | Client | Server | Client |
| --- | --- | --- | --- | --- |
| Initial state | `serverStep("begin")` | `acceptance.hud("initial")` | | |
| Invalid arguments | `serverStep("prepare", "malformed", state)` | `acceptance.act("malformed")` | `serverStep("verify", "malformed", state)` | |
| Distant collect | `serverStep("prepare", "far_collect", state)` | `acceptance.act("far_collect")` | `serverStep("verify", "far_collect", state)` | |
| Burst cooldown | `serverStep("prepare", "cooldown", state)` | `acceptance.act("cooldown")` | `serverStep("verify", "cooldown", state)` | `acceptance.hud("cooldown")` |
| Capacity and overflow | `serverStep("prepare", "capacity", state)` | `acceptance.act("capacity")` | `serverStep("verify", "capacity", state)` | `acceptance.hud("capacity")` |
| Distant sale | `serverStep("prepare", "far_sell", state)` | `acceptance.act("far_sell")` | `serverStep("verify", "far_sell", state)` | |
| Sale and reset | `serverStep("prepare", "sell", state)` | `acceptance.act("sell")` | `serverStep("verify", "sell", state)` | `acceptance.hud("sell")` |
| Empty sale | `serverStep("prepare", "empty_sell", state)` | `acceptance.act("empty_sell")` | `serverStep("verify", "empty_sell", state)` | |
| Seed respawn state | `serverStep("prepare", "respawn_seed", state)` | `acceptance.act("respawn_seed")` | `serverStep("verify", "respawn_seed", state)` | |
| Actual respawn | `serverStep("respawn", nil, state)` | `acceptance.hud("respawn")` | | |
| Repeated sale | `serverStep("prepare", "repeat_sell", state)` | `acceptance.act("repeat_sell")` | `serverStep("verify", "repeat_sell", state)` | `acceptance.hud("repeat_sell")` |

`serverStep(...)` in the table abbreviates `acceptance.serverStep(...)`.

An assertion failure is a failed or interrupted scenario, never a pass. Preserve the first failure and runtime logs before repairing. Do not repeat actions after a failure without inspecting the current state or restarting the play session.

## What this measures

- Client calls the actual `Action:FireServer(...)` production path. No helper is called directly and no server handler is replaced.
- Invalid nil, numeric, table and unknown-string arguments award nothing.
- Five simultaneous collection requests award exactly one item; spaced requests reach capacity five and reject overflow.
- A living player more than ten studs from the target cannot collect or sell. The test arranges the avatar at the opposite interaction, rather than off the authored floor, and verifies it stayed alive and distant.
- Selling five items produces exactly fifty coins and clears carry; an empty sale adds nothing.
- Two new carried items and fifty coins survive actual character replacement. A subsequent sale produces seventy coins total.
- HUD values match independent expectations after updates and respawn. Exactly one named HUD and one of each named control exist, with enabled ancestors, nonzero size and viewport intersection.

Only avatar position, velocity, a test-only character witness attribute and character respawn are arranged by the oracle. It never assigns Carry/Coins or changes the production cooldown, capacity, reward, remotes or generated scripts.

## Limits

Remote results have a bounded half-second observation window after Client submission completes; this is a local Studio scenario, not a latency/load benchmark. Inspect logs separately for runtime exceptions. HUD checks do not prove lack of occlusion, visual quality, or working keyboard/touch input. The scenario fires remotes directly instead of simulating E/Q or clicking buttons. Multiplayer isolation, leaving/rejoining, dead-player requests and device layout remain separate checks. Do not label the whole fixed specification verified from this solo sequence alone.
