# Studio acceptance: first combat slice

Status: pending. No Studio instance was connected during implementation. Exported XML has been parsed and scripts compile with the Luau CLI; these are not engine tests.

Open the exported `.rbxlx` as a separate place. Do not merge it into an existing game for this test.

1. Play: arena floor, spawn and orange target exist; no startup errors; health HUD appears.
2. Approach and face target: strike deals 15 damage; burst deals 30; health and cooldown feedback agree. A miss still consumes cooldown.
3. Repeated requests inside the cooldown do not damage twice. Requests for unknown actions and replayed sequences are rejected.
4. Out-of-range and wall-obstructed targets receive no damage. Targets behind the attacker are not selected. One attack damages at most one target.
5. Target death creates a replacement after three seconds without accumulating old models/highlights.
6. Player death/respawn restores health binding and clears cooldown state. Repeated respawns do not duplicate controls or health updates.
7. Start two clients: damage appears consistently; client-supplied target/damage cannot override server decisions; leaving/rejoining is clean. Spawn protection may prevent immediate damage to newly spawned players.
8. Device emulator: touch buttons are visible in the desktop+touch build, reachable above movement controls and activate the same server actions. Clicking a HUD button must not also issue a normal strike.
9. Repeated play/stop and at least 100 attacks: inspect logs, live instance count and frame performance. Record actual outcomes and capture evidence; do not mark passed merely because scripts loaded.
10. Animation/audio remain intentionally absent. Do not mark full fighting-game presentation complete until valid assets are selected, loaded and reviewed.

Record Studio version, place revision, device, player count, output logs and failure reproduction. Keep failures visible in the app until a future live-verification adapter records real results.
