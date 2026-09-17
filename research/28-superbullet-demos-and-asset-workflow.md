# Superbullet demos, asset workflow, and measured model roles

Research date: 2026-09-16. No paid inference, application changes or Studio operations. Existing goal remains paused.

## What was inspected

Reviewed complete auto-generated transcripts of three representative channel videos, plus sampled browser video frames of the template and flight demos. This is not an end-to-end viewing of the channel, an audio assessment, or an independent product benchmark. Transcripts are preserved under `evidence/superbullet-demos-20260916/`; narration remains vendor claims.

| Demo | Relevant segment | Finding |
| --- | --- | --- |
| [Combat game template](https://www.youtube.com/watch?v=CfNFdUG9qBQ) | 0:17–0:46 | Narration describes choosing an existing foundation, connecting the active Studio session and uploading animations/audio to the account. |
| [Flight system](https://www.youtube.com/watch?v=HtXnegY2a6o) | 0:32–0:59 | Describes retrieving, installing and configuring existing content. Sampled frame at about 0:35 visibly contains an asset-upload progress modal; about 0:52 shows connected Studio integration. |
| [Combat system](https://www.youtube.com/watch?v=g_ZRrIICUag) | 0:25–1:19 | Narration describes finding a template, installing its damage-system prerequisite, uploading/validating media, then adding test dummies. |

The useful architectural pattern is reusable systems and content packaged with integration knowledge. Whole-game templates are one use of that pattern. The demos do not establish general reliability, cost per successful game or superiority to Takko.

## Media ownership and packaging

Their [animation authoring guide](https://marketplace-docs.superbulletstudios.com/to-upload-by-user/how-to-add-animations) describes shipping KeyframeSequence files, mapping them to source placeholders, collecting uploaded IDs and substituting those IDs. The [audio guide](https://marketplace-docs.superbulletstudios.com/to-upload-by-user/how-to-add-sound) describes a similar packaged-media workflow. Documentation includes manual upload steps while newer demonstrations claim automation; these are different evidence sources, not proof all installations are automatic.

We have not established that every template asset is private. We also do not possess their complete downloadable content library merely because we inspected the installed client. An ID is not equivalent to source media or permission. Roblox documents both [free Creator Store audio and permission grants](https://create.roblox.com/docs/audio/assets), and [animation permission sharing](https://devforum.roblox.com/t/improving-animation-asset-permissions/3852101). The latter search-index excerpt supports experience grants; its full page was blocked by a browser verification challenge. Avoid repeating Superbullet's blanket ownership/re-upload statements as universal Roblox rules.

## Proposed Takko interaction, not implemented

1. Search a visual Creator Store panel using the existing Studio search adapter. Display asset identity, creator, type, preview where available and link.
2. Drag a card into chat to attach structured identity directly. For external links, parse a recognized Roblox URL then resolve and validate the asset; do not let the model guess an ID.
3. Attach intent alongside identity: intended gameplay role, what existing behavior/media to preserve and what change the user wants. A butter thumbnail alone does not explain the game.
4. Inspect included scripts, rig compatibility, dependencies and media accessibility. Describe uncertainty instead of equating a successful insert with usable content.
5. Integrate the selected component and test its behavior in the target experience. Cache verified inspections against asset version and relevant experience permission state, not indefinitely by ID alone.

Current adapter: `src/generation/studio-asset-adapter.ts`, capability declaration and `search()` method. Search supports Model, MeshPart, Audio and Image; Animation search is explicitly unsupported. `src/web/AssetExecution.tsx` currently presents execution/Studio selection, not this visual drag-to-chat workflow. An animation browser needs a separately supported source, owned imports or compatible packaged animations; don't label Model search results as animation IDs.

Use a small verified library of reusable systems alongside open-ended search. Expected benefits are fewer repeated retrieval/repair steps and more predictable integration. Savings and quality improvements remain hypotheses until measured. Existing preservation review must inspect the behavior retained, not merely count asset IDs.

## What the models have demonstrated

Primary evidence: [four-model screen](results/model-screen-20260916/RESULTS.md) and [configuration diagnosis](26-model-failure-diagnosis.md).

| Model | Evidence-supported strength or role | Limit |
| --- | --- | --- |
| Sonnet 5 | Best controller implementation in this screen: 15/15 isolated Studio checks, $0.023992. | One task; no full-game or production-agent pass; long-session resource behavior untested. |
| Luna | Cheap defect-review assistance; identified reset/overlap and original-transparency problems. $0.0019958 combined request. | Generated controller 14/15; overlapping presses broke completion. One review snippet is not a reviewer leaderboard. |
| Qwen3.8 Max | Its first search query placed ASMR Butter first; found reset/transparency issues in review. | Controller initialization failed on Vector3:Clone(); one retrieval is not an established specialty. |
| Kimi K2.7 Code | No demonstrated coding strength in this experiment. | Reasoning exhausted output allowance; unsupported low-effort assumption means coding result is inconclusive. |
| Sol | Earlier preservation review found 3/3 losses missed by Gemini; promising integration reviewer. | Not included in this same four-model screen; cannot rank it against Sonnet here. |
| Gemini 3.7 Flash | Earlier inexpensive sourcing/audio tasks. | Missed semantic-preservation problems; not validated for autonomous integration. |

Composer has not been tested. No tested model has yet earned an exceptional-at-whole-game-generation claim. Scripting still has unresolved API, lifecycle and concurrency errors, beyond finding attractive assets.

The next useful experiment would compare asset-informed component integration, scoring behavior preserved, necessary edits, permission failures, repair count and cost per successful result. Test asset resolution separately without inference. No experiment was launched in this research turn.
