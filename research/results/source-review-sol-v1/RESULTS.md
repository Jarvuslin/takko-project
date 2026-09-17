# Frozen source review: stronger model did not fix citation failure

The fresh GPT-5.6 Sol diagnostic failed after both allowed attempts. Both valid JSON responses cite `local Button = script.Parent` followed immediately by `local Backup = Button.Parent:clone()`, although five intervening lines exist in the captured source. On attempt 1, validation stopped earlier because the review added AssetRead and Audio to the required removed-capability list. The automatic correction removed those extra entries; attempt 2 then failed exact quotation validation. Sol did not receive targeted quote feedback between these two attempts. No decision was injected into V8 and no Studio operation occurred.

The offline preflight reproduced the original Gemini failure through production Engine.call. Initial Sol messages and response format were asserted equal to the source-hash-verified reconstruction; original V8 provider request bytes were unavailable. Both models had 12,000 output tokens, a 300-second request deadline, and at most two attempts. This is one frozen component, not a general model ranking.

| Attempt | Provider cost | Input / output tokens | Outcome |
| --- | ---: | ---: | --- |
| Sol 1 | $0.138266 | 28,667 / 6,660 | Extra capability entries; quotation also spliced |
| Sol 2 | $0.115580 | 32,425 / 3,744 | Capability entries corrected; exact quotation fails |

Total **$0.253846**, elapsed 110.321 seconds. All costs came from provider receipts, including caching charges; no unknown liability or active reservation remains. Official key snapshots reconcile exactly: usage $4.007311036 → $4.261157036, remaining **$5.738842964**, checked 2026-09-16 16:42:27 UTC. Conservative campaign prior becomes **4,576,017 micros**, retaining older liabilities. Historical Engine reservations increase by 770,812 to **10,891,396 micros**; these are not settled spending. The separate diagnostic transport reserved 813,382 micros across its calls and is not added again.

Evidence: `PROTOCOL.md`, `controller.ts.txt`, `offline/`, `live/call-*-request.json`, `live/call-*-response.txt`, `live/quote-diagnosis-*.json`, `live/project.json`, and `live/key-after-settled.json`. The source-review route override was deliberately not implemented because this experiment showed no improvement. Sol also lacks advertised audio input, so it cannot silently replace sound-listening evaluation.

Next hypothesis: model-selected line ranges over fully presented source can avoid copying/splicing while keeping exact extraction and all dependency checks. This requires implementation, negative tests, and a fresh raw diagnostic. Neither a future citation pass nor this failed review establishes semantic accuracy, adaptation, playback, or a complete game.
