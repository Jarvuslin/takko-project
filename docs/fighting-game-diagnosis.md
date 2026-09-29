# Fighting-game planner and preview diagnosis

The live game evaluation stopped during concept generation. The investigation found and fixed two planner defects, improved asset-search relevance and corrected undersized preview controls. Architecture generation and actual Studio gameplay remain unverified. The paid retry and Studio target confirmation are pending.

## Root causes and fixes

The user's original complete model response contained four playtest actions and only three numbered outcomes. The schema allowed two separate lists, while later semantic validation required a one-to-one mapping. New generated concepts carry each action and its expected outcome together. Takko derives the numbered lists used by saved concepts and the UI. It still rejects genuinely missing outcomes and preserves older saved concepts.

The first live evaluation then exposed a separate hidden limit: concept generation forced 2,000 output tokens despite a 32,768-token model setting. The model used 1,186 reasoning tokens and was cut off mid-response. Concept calls now honor the configured model allowance, with the same project/generation budget checks and conservative reservations. Reasoning was not reduced and incomplete JSON was not accepted.

Real Creator Store results showed that long generic searches were poor. Explicit fist, punch and boxing briefs now search for `punch animation`, preserving any specified R6/R15 suffix. Combat effects search for `hit vfx`. These queries returned actual punch clips and hit effects near the top in this run. Search ranking still comes from Creator Store, and titles alone do not establish asset suitability.

The preview's play/fullscreen controls had 10px text and 28px height. The fullscreen target was roughly 21px wide. Shared viewport controls now have 12px text, at least 36px targets, visible control borders and a neutral timeline accent. This applies to both animation and model viewports.

## What the requested run established

| Area | Observed result |
| --- | --- |
| Understanding the brief | The incomplete live response described fist-only practice, selected Marketplace content, hit effects and exactly one counter increment per landed punch, with no increment on misses. It was rejected as incomplete. |
| Concept protocol and token allowance | Red/green regressions pass. A paid retry using both fixes is pending. |
| Architecture and connections | Not reached. No generated architecture was validated for this brief. |
| Animation search and preview | Real R15 asset #12061946559 contains three readable clips. The browser rendered the clip and changed pose when scrubbed. A clip choice was made in the test UI. |
| Dummy preview | Real asset #8767186735 rendered supported primitive geometry. Three unsupported parts were disclosed. A local choice was made in the test UI. |
| VFX | Asset #86089736228455 contains one effect emitter. Takko currently cannot show its particle playback in-app. It was not approved as visually verified. |
| SFX | Asset #132504023010884 offers a Creator Store listening link. There is no in-app audio player. Its sound and Roblox playback permissions remain unverified. |
| Scrolling and controls | Chooser scrolling works. The final packaged preview fits the minimum desktop window, keeps the footer reachable and returns to the existing search. Larger controls passed desktop/mobile browser checks and native measurements. |
| Hit counter, game UI and gameplay | No build was generated or applied. These are not verified. |

The real run used an isolated profile and the selected Sonnet 5 model. The user's existing application and failed project were preserved. Detached asset extraction did not add objects or scripts to the place. Studio was observed in Edit mode.

## Cost and verification

One paid call cost $0.024778, against a $0.035926 reservation that was released. The initial key balance was $4.43914. A later provider check confirmed $4.414362 remaining. The isolated test cap is $4.40, including the failed call. There was no automatic paid retry.

Final `npm run check` passed every stage, including 1,442 unit/API tests across 93 files and 153 browser tests, with one intentional skip. The packaged UI check passed using cached real asset data. Exact stage counts, costs, preserved failures and package hashes are recorded in [RESULTS.md](results/fighting-live/RESULTS.md). Offline fixtures and native UI checks do not establish a working generated game.

The desktop shortcut points to `release/takko-fighting-recovery-20260923-ready/Takko-win32-x64/Takko.exe`. Close and reopen Takko to load the fixes. The running user app was not restarted.

The pending paid retry is required because repository AGENTS.md instructions explicitly prohibit automatically retrying a failed paid trial. The Studio tool separately requires confirmation of the target place before modifying it. The requested target is Untitled Experience, place ID 122588481889475.
