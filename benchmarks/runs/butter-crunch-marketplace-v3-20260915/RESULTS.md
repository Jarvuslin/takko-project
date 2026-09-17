# Butter Crunch: native worker pilot v3

Run on 2026-09-15 America/Toronto (receipts dated 2026-09-16 UTC). **Zero finished games. No quality ranking.** No manual asset selection, game coding, plan rewriting or rescue was performed.

All trials used the same frozen sourcing prompt, Gemini 3.7 Flash planner/reviewer, one configured repair round, and a $1.80 per-project reservation cap. Model decisions used each named worker. Fresh plans differ, so this is an end-to-end pipeline pilot, not an isolated coding-model comparison. The source state guard fix was loaded before dispatch.

| Worker | Observed outcome | Recorded cost (USD) |
| --- | --- | ---: |
| MiniMax M3 | Failed asset loop. Selected a real butter model; native import, inspection and cleanup worked. Model contained scripts and unsupported Bones and was rejected. Worker subsequently returned empty invalid decisions twice. Required audio was rejected without listening. | 0.028484 |
| MiMo V2.5 Pro | Shared Gemini planner failed requirement-source validation twice; MiMo itself was never called. | 0.028797 |
| Grok Build 0.1 | Searched, selected and imported a real Creator Store sound. Native content loaded, but playback did not advance; capture/evaluation halted. Cleanup receipt confirms two owned targets removed. | 0.036139 |

Total recorded charge: **$0.093420**. V3 conservative reservations: $0.906836. Including v1/v2, recorded charges $0.161094 and reservations $1.490554, below the announced $6 ceiling. Original routes restored; four test keys remain loaded in the running backend. No paid calls pending.

## What this establishes

- The previous Studio Edit-state parsing defect is fixed in the live adapter: the app itself now creates scopes, imports Marketplace assets, inspects them and cleans them up in Studio.
- Asset acquisition is no longer entirely missing, but the complete search → inspect → verify → retry loop is still unreliable.
- No run reached game-code generation, animation testing, audible-crunch acceptance, or ten-action counter testing. There are no playable exports to deliver from these runs.
- MiniMax inferred sound duration/decay and model rig properties from names without observations. These statements are unsupported worker reasoning, not benchmark evidence. Its audio response said it intended to retry, but the actual action was `reject`; the application followed the action field.
- MiMo has no worker-quality result. Grok's sound failure does not establish that its selection was unsuitable.

## Product defects and next implementation gates

1. **Native audio lifecycle:** the current adapter insists on Edit throughout capture, calls `Sound:Play()`, and requires advancing `TimePosition`. This run returned loaded content but `playbackObserved=false`. Implement and natively validate a bounded runtime audition owned by Takko, with correct client/server selection, exact Studio/asset binding, captured sound, restoration and cleanup. Do not simply remove the playback assertion or claim silence is acceptable.
2. **Failure classification:** a completed negative playback receipt followed by successful cleanup is wrapped as uncertain effects and blocks retry. Separate known candidate rejection, known infrastructure failure, and genuinely unknown mutation outcomes. Preserve this historical `requiresReconciliation=true` record until a recorded reconciliation establishes otherwise.
3. **Worker decisions:** compact schema feedback and bounded correction must recover actionable responses without root/Astra rewriting decisions. An empty response remains a failure after its retry limit. Clarify retry versus reject semantics in the product contract.
4. **Planner reliability:** Gemini omitted valid source IDs and paraphrased quotations, exhausting two attempts. Fix the planner interface while retaining source integrity; do not manually approve fabricated evidence or silently transplant another plan.
5. **Visual asset compatibility:** Takko currently rejects whole models containing scripts or Bones. Useful animated Marketplace props will need explicit supported rig serialization and a tested script-handling policy. This run does not justify weakening those checks.

Roblox's [official Sound documentation](https://github.com/Roblox/creator-docs/blob/main/content/en-us/reference/engine/classes/Sound.yaml) distinguishes Edit-mode Playing-property changes from runtime playback. This supports investigating the lifecycle mismatch; the exact cause of this `Sound:Play()` receipt remains unverified. No replacement playback method has been natively tested.

## Evidence

`experiment.json` freezes identities, prompt hash, source-guard hash and budgets. `results.json` contains costs and failures. Each model has final project JSON and model traces; native receipts are embedded in the final project asset pipeline. Previous v1/v2 runs are unchanged.

No application code changed during v3. The earlier full offline suite passed before the service reload; this pilot supplies separate real Studio import/inspection/cleanup evidence and a real audio failure. It does not turn those offline tests into a game-quality pass.
