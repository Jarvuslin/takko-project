@AGENTS.md

@docs/agent-context/orientation.md

@docs/agent-context/state.md

# Claude-specific notes

Load these skills when the work calls for them, before acting rather than after:

- `verify-before-claiming` before telling the user something is fixed, working, verified or safe to delete. Always on a second attempt at the same fix.
- `roblox-studio-mcp` before editing anything through the Studio bridge.
- `roblox-luau-safety` before writing or reviewing gameplay, ability, networking or player-state Luau.
- `roblox-visual-capture` before giving any visual verdict on a place.

Do **not** load `roblox-dbd-director` or `roblox-dbd-agent-briefs` here. Those belong to a different project, the asymmetric horror game at `D:\RobloxProjects\Roblox DBD`.

`docs/agent-context/state.md` is a dated snapshot and goes stale. `research/notes/continuation.md` is always the authority on live PIDs, ports, budget and what is paused.
