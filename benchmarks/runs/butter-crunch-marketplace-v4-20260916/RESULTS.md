# Butter Crunch v4: runtime audio and recovery trial

Run September 15 local / September 16 UTC. **Zero finished games; no quality ranking.** Three fresh projects used the unchanged v3 prompt, Gemini 3.7 Flash planner/reviewer, each named worker for asset decisions/build/repair, one repair round, and hard $1.40 per-project monetary and cumulative-reservation caps. Root supplied no asset ID, game code, replacement plan or failed-run rescue.

| Worker | Result | Recorded cost |
| --- | --- | ---: |
| MiniMax M3 | Planner correction succeeded. Two audio searches, then terminal rejection without audition. Optional visual search also rejected without inspection. | $0.029194 |
| MiMo V2.5 Pro | Planner correction succeeded and worker ran. Two audio searches, rejection without audition. Actual visual import/inspection/rejection/cleanup executed. Required audio remained unresolved. | $0.040133 |
| Grok Build 0.1 | Actual sound import, Client playback, process WAV capture and paid listening evaluation completed. Evaluator rejected; cleanup returned control to worker. No acceptable audio acquired; visual need also failed. | $0.066877 |

V4 recorded cost: **$0.136204**. V4 cumulative reservations: **$1.567765**. Including v1–v3: **$0.297298 recorded; $3.058319 reserved** under the $6 ceiling. All jobs ended, routes restored, no v4 run requires reconciliation. Earlier failures remain unchanged.

## Evidence and limitations

Each worker directory contains its frozen experiment, exact prompt, source/settings hashes, unmodified plan gate, final project, raw model traces and costs. Grok additionally retains the captured WAV. Asset inspection and model listening are separate from native gameplay; no trial reached a playable export, counter verification, synchronized animation acceptance, desktop/mobile gameplay, or ten-crunch test.

MiniMax and MiMo made suitability/provenance claims from titles. Those are unsupported model reasoning, not verified asset properties. Rejection remained an explicit worker decision; no coordinator substituted acceptance.

V4 exposed two additional product issues:

1. The adapter returned up to five search results, but the pipeline exposed only the remaining inspection budget (initially three). This withheld options before worker selection. The next version separates the five-option list from the unchanged three-inspection bound and clarifies that `select` begins inspection rather than approving the asset.
2. Grok's evaluator described the eight-second WAV recording window as the sound's duration and used it against the under-two-second constraint. The recording includes setup/baseline and padding, so that conclusion is unsupported. Its independent perceptual criticism is still model judgment; this run is preserved as rejected. The next version will supply native source length separately and explicitly distinguish the recording window.

The source changes for these follow-ups were prepared after all three v4 experiment snapshots were frozen. V4 used the previously loaded engine throughout; no mid-run reload or plan/asset edit occurred.

The separate [native lifecycle regression](../../../../docs/results/takko-audio-runtime-native-v1/result.json) replayed an old worker choice in a new diagnostic scope. It is excluded from these autonomous results.
