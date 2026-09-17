# Context, cache measurement and component media fixes

Implemented and activated September 16, 2026. Each change has targeted tests; the final full check passed. This work improves the current pipeline while external agents remain eligible replacements. It does not establish a completed raw Marketplace game.

## Changes and observed effect

1. **Remove contradictory sourcing instructions.** The runtime reference previously suggested built-in audio and asking users for image assets. It now directs those needs through Marketplace retrieval. Validation rejects declared procedural/built-in audio and known built-in audio URIs embedded in scripts; retained retrieved-audio evidence remains accepted. This is a bounded validation rule, not proof that every dynamically constructed media reference has been audited.
2. **Keep reusable context before task-specific details.** JSON field order now places runtime guidance first and scene hierarchy/reference details later. No values, source text, requirements or instructions are removed, and untrusted content stays in the user message. Unit tests establish semantic preservation; the paid A/B below tests generated behavior and cost.
3. **Record reported cached input tokens.** Provider responses and persisted charges retain valid cache-hit counts, including truncated completions. Missing or malformed counts remain unknown. This telemetry does not change billing or budget admission. Actual OpenRouter receipts supplied the cost comparison.
4. **Include instance media in component reviews.** Native captures now retain a bounded inventory of content properties across thirteen classes, including SoundId and AnimationId. Empty values stay in the archive; nonempty bindings reach review evidence. Original-to-derivative checks reject changed values, and the reviewer must cover every supplied binding without inventing IDs or asserting verification. Historical archives with no inventory remain explicitly unknown. Script-computed IDs, availability, permissions and playback still require separate evidence.

## Paid context-layout A/B

Actual Takko Engine, OpenRouter GPT-4.1 mini, the same three public logic tasks as the earlier agent comparison, two rounds per layout, alternating order. No root repairs. Each arm used a distinct early cohort prefix to separate cache entries. Both contained the same sourcing corrections; only JSON ordering differed after accounting for the cache-isolation label. A $0.15 per-run and $1 aggregate ceiling applied; neither stopped a run.

| Measurement | Original order | Reordered context |
|---|---:|---:|
| Behavioral evaluations passed | 6/6 | 6/6 |
| Provider calls | 12 | 12 |
| Billed cost | $0.0372316 | $0.0317784 |
| Input tokens | 100,615 | 100,338 |
| Cached input tokens | 41,472 | 56,448 |
| Output tokens | 5,892 | 5,361 |
| Total elapsed time | 65.657 s | 51.482 s |

The reordered arm cost **14.6% less** overall and was cheaper in five of six matched cases. Cache coverage increased from 41.2% to 56.3%; shorter sampled output also contributed. The result supports keeping the lossless reorder, but six outputs per arm cannot establish guaranteed savings, equivalent general quality or better finished games. These are pure-Luau behavioral assertions, separate from Studio tests.

All 24 response costs reconcile to **$0.06901**, matching the settled provider-key usage delta exactly. The key had **$7.737453114 remaining** at 07:02 UTC on September 16, with expiry September 20 at 22:29 UTC. The allowance is shared across profiles.

Evidence: `research/results/context-layout-ab-v1`. Reproduce verification with `node research/scripts/verify-agent-effectiveness.mjs research/results/context-layout-ab-v1`. The original protocol retained stale prose from the earlier OpenCode pilot; an explicit addendum corrects its description without rewriting the original receipts. This A/B did not run OpenCode again.

## Native Marketplace regression

Replayed the three **frozen worker-selected** candidates from the earlier diversity trial. This is a product regression, not fresh autonomous asset discovery. Full captures and restricted derivatives retained matching sources, media values and sandbox boundaries, with successful native restoration:

| Frozen selection | Instances | Script bindings | Nonempty captured media bindings |
|---|---:|---:|---:|
| Combat training | 20 | 2 | 1 Texture |
| Bubble wrap | 375 | 76 | **72 SoundId** |
| Checkpoint parkour | 4 | 1 | 1 Texture |

The bubble-wrap review now includes all 72 sound bindings, which share one value; this directly demonstrates the previously missing instance data reaches the reviewer. A separate native check read every whitelisted property on all thirteen classes using unparented fixtures. No imported scripts or media were executed. Temporary imports were cleaned; Place1 remains Edit and the user's Butter/Script remains present and enabled. This establishes capture/review-input coverage, not model review quality, dependency availability, animation/audio playback or integration success.

Evidence: `docs/results/takko-context-media/native-v1` and `review-input-v1`. The review-input verifier reconstructs packets from retained archives, validates hashes and keeps all source bindings. Existing archive records remain unchanged.

## Verification and activation

- Full `npm run check`: **776 unit/API tests**, **10 desktop tests**, **36 browser tests**, plus Luau, plugin, guards, build and production smoke stages. Exit 0.
- Media-specific checks include actual offline execution of the generated capture/restriction Luau against API mocks: changed media fails capture/restoration; stale media fails before permission reduction. These mocks are distinct from the native results above.
- Paid A/B verifier recompiled/re-executed all twelve generated modules, checked fixture/output hashes, reconciled receipts and scanned retained results for plaintext provider keys.
- Reloaded idle localhost:4324 as PID31300. Verified all 18 projects and model/routing configuration preserved, all nine keys restored from the Windows-encrypted vault, and HTTP 200 from the app. No route or per-project budget change.

Still outstanding: resolved component dependencies, reviewed owned integration/export and isolated gameplay verification, followed by fresh diverse worker trials. The larger raw-worker goal remains unfinished. Source review, capture and low-cost logic tests are not substitutes for that result.
