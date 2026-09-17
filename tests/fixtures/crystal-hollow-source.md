# Crystal Hollow regression snapshots

`crystal-hollow-hud.luau` and `crystal-hollow-feedback.luau` are exact source copies from the frozen expert-refined Crystal Hollow artifact with bundle hash `d55974385a91b4777c5da8725d341ff8a42e33e1873883c5e4b881a2d6c73f3f`. They predate the completion-toast priority and overlapping-pulse corrections.

The snapshots keep regressions reproducible without requiring the ignored local evaluation directory. Tests execute their actual source under Luau, then execute the pure refinement's output under the same mocks. These are offline logic checks; they do not establish native rendering, physics or multiplayer behavior.
