# Marketplace animation previews

Keep Takko's inline player small. Resolve dropped Roblox animation assets and packs through the connected Studio, persist their real clip data, and expose every discovered entry in a single selector. The browser stage is a rig preview, not a live game environment.

Scope: minimal player controls, detached read-only extraction, pack selection, durable chat cards, tests. No paid inference, publishing, game changes, or server restarts.

1. Inspect the existing player and Marketplace path.
2. Remove camera settings, restart, speed and framing buttons while retaining direct gestures and keyboard controls.
3. Add bounded animation discovery and extraction with explicit per-clip failures.
4. Render real transforms using exported native rig joint offsets.
5. Connect Marketplace drops to a saved chat gallery.
6. Test multi-clip packs, denied clips, persistence and rendered motion.
7. Verify a real Roblox clip without modifying the place.
8. Run the full check and record evidence and limitations.
