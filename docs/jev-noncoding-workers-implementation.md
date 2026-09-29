# Jev for non-coding work

The live recording stopped before building. Jev support is implemented, and the captured provider-contract failure has been fixed and replay-tested. This is not an end-to-end generated-game pass.

The user clarified that Jev should handle objective interpretation, gameplay deduction, asset relevance and candidate selection. The accepted design is [the reviewed specification](superpowers/specs/2026-09-23-jev-noncoding-workers.md). Its skeptic, constraint, user advocate and arbiter reviews completed before implementation.

## Implemented behavior

Presets now have an optional **Non-coding decisions** route under Specialist overrides. Models can add the pinned Jev profile using the existing OpenRouter connection. Jev is excluded from coding routes and fallbacks. Existing settings without this route make no additional calls.

Before concept generation or planning, Jev can classify bounded original brief clauses and gameplay intent. This advice reaches the planner alongside the complete original request. It cannot remove requirements, approve a brief or invent verified coverage. Unsupported large requests go directly to the existing planner without truncation. This brief pass is additional analysis, not a demonstrated cost saving.

For assets, Jev assesses actual offered Creator Store metadata and nominates a candidate for inspection. It cannot invent asset IDs, write scripts, issue arbitrary requests or approve installation. A normal 30-result page is split into bounded batches, with batch nominees compared separately. Every candidate is included. An uncertain batch prevents a partial-page winner. Up to 80 candidates are supported per assessment, with larger or oversized inputs returning uncertain advice rather than silently trimming the pool.

Takko executes searches, fetches, native inspection and import through its existing tools. The existing coding model retains new search-query writing, imported-source review, adaptation, generation and code review. An already approved singleton is selected deterministically. Uncertain choices in the build acquisition pipeline can hand off to the existing asset worker within the shared cap. The discovery UI leaves uncertain results for user review without silently paying for a larger-model fallback.

Marketplace suggestions remain distinct from user selections, imports and native playback tests. The UI marks relevance as metadata-only and flags selected editable keyframes without a published AnimationId. No new per-mini-task approval dialogs were added.

## Provider and accounting boundary

The dedicated transport uses the official OpenRouter Decisions endpoint, pinned Jev model and TypeSafe provider. It validates known model identity, question keys, allowed candidates, finite confidence/probabilities, score scale and any echoed criterion legend. Optional confidence is treated as uncertainty. Responses and requests have size limits. The implementation accepts the score legend documented by the [official SDK](https://github.com/OpenRouterTeam/typescript-sdk/blob/main/src/models/decisionsscoreanswer.ts).

Every call uses existing project, generation, cumulative reservation and execution-policy gates. Each bounded batch reserves $0.002688 at the verified $0.042 per million input-token rate. Actual provider receipts settle each call. Unknown billing retains conservative accounting and stops consumption. Invalid responses do not silently retry or switch providers. Cancellation, routing changes and newer project revisions invalidate late results while retaining financial settlement. Cached advice is scoped to exact project/context/profile identity.

## Failures found and preserved

Review caught an empty-candidate job-registration race, use of responses with unknown billing, and late-response state overwrite. Each has a regression test.

The initial live Marketplace page had 30 candidates, exceeding the original 20-candidate decision limit. It made no paid calls. Batching was corrected, with full-page, uncertain-batch and mid-batch budget tests.

After that fix, two real Jev calls ran. The first returned a valid low-confidence candidate choice. The second returned valid score answers with a `legend` field. Our strict parser incorrectly rejected that field. The failed response, charge and recording are retained. An offline test reproduced the rejection, then passed with the corrected parser. Unknown legends remain rejected when they differ from the requested criteria. No further paid attempt was made after this failure.

Final review also found that asset advice omitted later brief changes and clarification answers, even though those changes invalidated the cache. Both candidate-assessment paths now include the full current brief context, with an R15-to-R6 correction regression. Oversized context still falls back without truncation.

The first full check passed before the last live-discovered changes. The second hit a Windows Vitest worker crash in provider-connections.test.ts. The third was intentionally interrupted after source changed to fix the live contract. The fourth was interrupted after review found the missing current-brief context. The fifth is the final verification log. Do not substitute the earlier green run for final verification.

## Evidence and remaining limits

Final `npm run check` passed: 1,489 unit/API tests across 94 files, 6 offline Luau scenarios plus 4 source compiles, 14 plugin mock groups plus 8 injected-source compiles, 6 guards, CSS lint with 0 errors and 556 existing warnings, TypeScript/Vite, 14 desktop tests, production smoke, 159 browser passes and 1 intentional mobile resizer skip. The 40 Jev-focused tests include the captured live reply and later-brief correction regression. These are automated checks, not a native gameplay pass.

The final Windows bundle is `release/takko-jev-noncoding-20260923-final/Takko-win32-x64/Takko.exe`. Native invisible Electron startup, renderer, API, CSP and shutdown passed. All 35 packaged resources match the final build, with only the packager's package metadata normalization allowed. The earlier bundle without `-final` is provisional.

See [run results](results/jev-noncoding-workflow/RESULTS.md), [cost ledger](results/jev-noncoding-workflow/COSTS.md), [edited attempt recording](results/jev-noncoding-workflow/workflow-attempt.mp4) and [raw recording](results/jev-noncoding-workflow/workflow-raw.webm).

The video shows the real prompt, project creation, actual Marketplace results, reconnect after an owned-service reload, and the two paid Jev calls ending in the parser failure. The edited version omits idle debugging intervals and adds captions. It does not show a completed build or gameplay. No replacement handcrafted game was substituted.

The current Studio has Marketplace MCP access but no loaded Takko apply/test plugin panel. The installed local Forge plugin file is older than current repository source. Native plugin connectivity remains a separate prerequisite. Roblox documents temporary `AnimationClipProvider:RegisterAnimationClip` IDs for [localized Studio testing](https://create.roblox.com/docs/reference/engine/classes/AnimationClipProvider), but this turn did not execute or verify that playback. It does not establish published-game animation permission.

No asset was approved or added to the game by this trial. Separate unpaid UI checks loaded the actual dummy preview and R15 punching keyframes. The dummy render explicitly omits four unsupported parts. The animation's rendered frames change at three sampled times and its loop plays in the browser. These are browser previews, not native gameplay. Native combat, client input, walking/sprinting animation, dummy response, VFX, audible SFX, hit counting, misses, cooldown and reset behavior remain untested. The brief-understanding path is tested offline, not demonstrated by live inference in this attempt. No claim of quality parity or measured savings against larger models is supported.

User Takko processes and Models configuration were not restarted or modified. The recorded run used an isolated DPAPI-backed profile with the previously authorized Sonnet coding profile and optional Jev route. No plaintext credentials were written. Studio remains in Edit mode with its original objects and scripts unchanged. Preview extraction loaded temporary off-tree assets and destroyed them. Final native inspection found no remaining imports or probe scopes.
