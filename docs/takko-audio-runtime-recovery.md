# Takko runtime audio and asset recovery

Implemented 2026-09-15 America/Toronto; native receipts dated September 16 UTC.

Takko now auditions worker-selected Marketplace sounds in a bounded Studio Client runtime. A native product regression successfully imported the exact retained v3 worker selection, captured sound twice (inspection and placement), observed advancing playback, restored Edit after each audition, and discarded the owned import. [Native receipts and WAV references](results/takko-audio-runtime-native-v1/result.json) are separate from autonomous game benchmarks. This replay made no paid calls and does not establish crunch suitability or finished-game quality.

The replay read the selection from the immutable failed Grok record and reran its original Creator Store search. It required that exact selection to be offered again; it could not choose a replacement. The historical failure and its reconciliation flag remain unchanged. A separate read-only scoped Studio audit found no asset-token remnants, enabled game scripts, or playing audio before replay.

## Runtime ownership and restoration

- Bind the explicitly selected Studio to exactly one installed process incarnation before entering runtime and recheck it throughout the lifecycle.
- Require Edit, reject active place scripts or playing audio, and create an owned audition marker. Start Play once, wait for the full Client/Server state, then claim the client copy with a nonce absent from Edit.
- Load the owned sound in Client, record the Studio process through the existing Windows helper, and require actual advancing playback plus usable WAV evidence.
- Verify the client nonce before stopping. Wait for Edit and remove the marker. The adapter then cleans its candidate on rejection or retains it only through the asset-stage contract.
- Unknown dispatched outcomes, changed process/runtime ownership, pending playback, and failed restoration halt without blind stop, replay, or cleanup.

The lifecycle has a 45-second deadline with a separate 15-second restoration allowance and bounded readiness polling. MCP exposes no atomic runtime session ID: the nonce detects replacement **after claim**, but an external stop/restart between acknowledged start and claim cannot be conclusively distinguished. Takko serializes its own Studio operations; externally concurrent Studio control remains a limitation.

The same sound failed to advance in the historical Edit audition and succeeded in Client here. This supports the lifecycle mismatch diagnosis; it is not a claim about every Edit playback method or every sound.

## Recovery and model contracts

Typed receipts distinguish candidate rejection, infrastructure failure, and unknown effects. A candidate rejection can return control to the same worker only after confirmed cleanup. Known infrastructure failure halts without falsely claiming uncertainty when cleanup succeeded. Unknown/untyped failures remain conservative. Placement self-cleanup clears the stale token so the pipeline does not discard twice.

Worker decisions have action-specific fields. `retry` requests another search; `reject` terminates the whole need. Empty decisions, unoffered IDs, and exhausted search requests receive bounded correction on the same configured route. Takko does not invent a decision or silently escalate to another model.

Planner output advertises required source IDs for user requirements, constrained to current request/answer IDs. Correction feedback supplies those valid IDs. Existing exact-quotation plans remain readable; missing/removed references and ungrounded paraphrases still fail. The server copies selected source evidence without choosing a source for the model.

## Marketplace rigs and scripts

Static imports remain limited to the existing supported class contract. Bone rigs require hierarchy, rest transforms, deformation, scaling, and native export/restore equivalence tests. [Roblox's Bone reference](https://create.roblox.com/docs/reference/engine/classes/Bone) documents the additional transform behavior; admitting the class alone would silently damage assets.

Embedded scripts remain quarantined and rejected. A future explicit sanitized-copy policy would need to remove every executable source container, retain an original manifest and removal audit, and re-evaluate the modified asset. Disabling ordinary Scripts would not make ModuleScripts safe or preserve behavior. Roblox's [third-party asset security guidance](https://create.roblox.com/docs/scripting/security/third-party-vulnerabilities) explains why Marketplace moderation alone is insufficient. No import guard was weakened in this change.

## Validation and live service

Independent reviews found no blocking code issues. Focused tests cover source schema/correction, same-worker decisions, known cleanup/retry, uncertainty, cancellation, process replacement, runtime nonce changes, readiness, pending callbacks, and real Luau template compilation with mocked Roblox APIs.

The first full check reached desktop build but could not rebuild the helper executable while the native regression was recording. This orchestration failure is preserved in `.forge/asset-audio-check.log`. The initial successful full rerun passed **600 unit/API tests, 10 desktop checks, 36 browser tests**, Luau/plugin mock scenarios, guards, build and production smoke. [Initial verification record](results/takko-audio-runtime-verification.json) keeps offline and native results separate. The later v6 source passed **626 unit/API tests, 10 desktop checks and 36 browser tests**, plus all remaining stages (`.forge/asset-audio-v6-check.log`). The subsequent frozen $2 benchmark admission change passed nine focused harness tests separately.

The fresh benchmark harness adds an optional cumulative reservation budget alongside the existing monetary budget. The Engine checks completed reservations, pending reservations and the proposed call before dispatch. V4 and v5 froze both limits at $1.40; v6 froze them at $2. Admission includes the prior ledger and a $0.40 safety margin under the $6 combined ceiling. Polling is defense in depth, not the primary budget guarantee. Offline harness tests cover unchanged-plan rejection, preservation, cancellation and settings restoration.

The updated Engine and adapter factory were loaded into the verified idle service on port 4324 using the existing local development reload technique. The configuration object and all four key-presence flags were preserved in memory; no credential was printed or persisted. The temporary local inspector was closed. Reload metadata is recorded separately in `.forge/asset-audio-reload.json`.

## V5 follow-up from preserved v4 failures

[V4 trials](../benchmarks/runs/butter-crunch-marketplace-v4-20260916/RESULTS.md) finished without games and exposed two additional defects. The search result list now has an independent five-option bound while native inspections remain capped at three. Worker instructions explicitly distinguish selection for inspection/audition from acceptance, and search budget from inspection budget. Neither change supplies a candidate or waives verification.

The evaluator now receives the recording window and native sound length as separate fields. Load/playback receipts bind `SoundId`, `TimeLength`, playback speed, elapsed time, maximum observed position, natural completion, and truncation to the runtime nonce and candidate/process identity. WAV files are unchanged. A truncated recording does not verify an unheard tail. Inspection, placed audition, and exported Sound IDs must agree.

The [second native product regression](results/takko-audio-runtime-native-v2/result.json) observed a **1.88-second** source sound inside approximately **eight-second** recording windows. Both auditions ended naturally, restored Edit and cleaned up. The saved inspected, captured and exported Sound IDs agree. Its start-time source hashes distinguish it from the subsequently added mismatch guards, which have separate rejection regressions. This remains a diagnostic replay, excluded from autonomous game outcomes.

## V6 planner reliability and autonomous sourcing

The preserved v5 attempt failed because the shared planner omitted every requirement description twice. The planner now receives an explicit field contract and grouped missing-description feedback; its advertised schema uses input semantics so defaulted `sourceQuote` is not falsely required. Validation still rejects fabricated sources and missing descriptions. No plan content is supplied by the coordinator.

The fresh [v6 Grok trial](../benchmarks/runs/butter-crunch-marketplace-v6-20260916/RESULTS.md) passed planning, autonomously selected and verified Marketplace audio, recorded unsuccessful visual searches, and produced a Studio-ready artifact. Both native audio inspections and evaluator judgments are retained. Studio-ready status and a review with no issues do not establish gameplay correctness: independent source review found that the counter increments before the crunch finishes. The original artifact remains unchanged for evaluation.

Final native evaluation of that unchanged artifact confirmed the premature counter update. Ten controlled desktop clicks reached10, a three-click rapid burst added1, deformation/reset occurred and actual game audio was captured. Phone Touch events and landscape/portrait HUDs were observed, but additional unattributed inputs prevent a controlled mobile counting claim. The game benchmark fails overall. Studio is back in Edit/default viewport.

The final full check, including the frozen-artifact evaluator and its native Color3 quantization regression, passed **637 unit/API tests, 10 desktop checks and 36 browser tests**, plus all remaining stages. See the [final verification record](results/takko-audio-runtime-v6-verification.json). This is separate from the failed native game acceptance result.
