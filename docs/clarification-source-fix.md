# Clarification evidence fix — 2026-09-13

The reported failure was an application bug: `validateSpec` searched only the original request for user quotations. It did not search saved clarification answers. The six rejected `answerId: answer` strings in project `d0dab662-25dd-4705-a0ef-ed45134bf4bf` exactly matched that project's saved answers. A second paid planner correction could not fix this contract mismatch.

`requirements.ts` now binds requirements against the original request and nonempty saved answers. The planner receives `userSources` and can select `request` or `answer:<id>`, omitting `sourceQuote`; Forge copies the source text itself. Existing quote-only output remains supported, including exact answer-prefixed strings. Unknown or removed source IDs and ungrounded quote-only evidence still fail. Model-authored questions and options are not user evidence. Source binding establishes which input is cited; it does not prove the model's interpretation is correct.

The brief marks these requirements “From your clarification.” Planner instructions now prioritize resolving ambiguous core loops before cosmetic choices and discourage additional rounds for incidental details. These instructions are not a measured solution to genre misunderstanding or game quality.

## Verification

- `npm run check`: 84 unit tests; 14 desktop/mobile browser cases; retained offline Luau, mocked plugin, guard, build and production smoke checks pass.
- Regression coverage includes all six reported quotations, missing quotes with source IDs, unknown/removed IDs, fabricated evidence, direct answer excerpts and legacy request quotes.
- An engine regression verifies that source-ID planning uses one mock provider call and one charge record, without a quotation repair retry. Browser tests exercise answering, replanning, approval and building through a local fixture provider.
- Replayed the actual saved failed planner response through the fixed validator offline: all 10 requirements and its task graph validate, including six answer sources.
- Recovered that response as an **unapproved** brief. Original request, six answers, revision and charge records are preserved. Backup: `.forge/recovery/d0dab662-25dd-4705-a0ef-ed45134bf4bf.before-source-fix.json`. No new model call or API spend for this repair.
- Restarted the idle localhost server and restored its existing OpenRouter credential in memory. In-app browser verification shows six clarification labels, zero quotation errors and disabled approval while questions remain unanswered.

## Remaining game-quality issue

The saved planner response interprets “steel a brainrot style game” as a maze-stealth game with dark organic visuals. It asks six more questions after six prior answers. This failed revision has no generated artifact, so it cannot establish runtime or visual quality. The intended core loop still needs resolving: a Steal a Brainrot-style collection/theft/base/income game or the maze direction in the saved answers. A clarification question is pending in the conversation. The recovered maze brief must not be presented as the confirmed intended game.

No new Studio gameplay verification occurred in this fix. Prior real farming failures (second harvest, clipped instructions, invalid test-module require) remain documented in `ui-refresh-and-live-evaluation.md`; this change does not resolve those generated components or establish model-quality parity.
