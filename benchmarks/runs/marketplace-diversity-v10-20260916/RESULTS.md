# V10 combat: useful discovery, rejected adaptation

The raw worker found and inspected a relevant Marketplace combat component, but produced no game. Stronger source review rejected concrete defects in the worker's adaptation. The run ended at source review for **$0.46199245**, below its $1.30 project cap; budget cancellation did not cause this failure. Six provider-known calls settled, with no new unknown charges or reservations.

The unchanged combat brief used Sol for planning and initial/post-adaptation source review, Gemini for asset selection/adaptation and the remaining generation roles. This is one fresh trial with several configuration changes, not an isolated model-quality comparison. The [protocol](PROTOCOL.md), [raw results](combat-training/results.json), [immutable model responses](combat-training/model-events.jsonl) and [verification](combat-training/verification.json) preserve the actual outcome. No root-authored query, selection, plan, adaptation, review or game code was inserted.

The plan searched for a complete combat/training system before assigning implementation files. The worker selected returned asset100417947639898, “Combat System Fighting Training Arena,” from its own query `training combat system`. Original capture contained172nodes, two punch and one block KeyframeSequences, three sounds, effects, two main scripts and an unrelated loader. Sol's first review correctly distinguished useful retained content from missing server authority, per-swing accounting, dummy/HUD/reset integration and unresolved loader behavior. No script or animation execution was inferred from these captures.

Gemini removed the loader subtree and replaced both main script bodies, retaining171nodes. This retained geometry/media/keyframe data but substantially rewrote behavior. The first adaptation failed strict schema validation because each replacement supplied both mutually exclusive `index` and `indices`; the automatic second response removed the extra field. Original raw responses are preserved. Native unparented application and recapture succeeded; the imported code was not executed.

The final Sol review returned `needs_more_evidence`. Independent source inspection confirmed substantive concerns:

- Reset clears state but does not invalidate delayed contact callbacks, allowing old attacks after reset. Delayed KO reset can also affect a later cycle.
- Client unlocks every0.4seconds while later server attacks require0.44/0.62seconds. Client advances without handling server rejection or matching combo expiry.
- Retained KeyframeSequences are not connected to playback, animation loading errors are suppressed, and attacks can damage without a valid visible track. Third-hit track reuse also conflicts with this accepted plan's distinct-animation choice.
- The adaptation creates a global, disconnected three-part fallback dummy before the pending Marketplace rig need resolves. It also needs correct client container/remote placement.

The pipeline cleaned quarantine and escalated instead of silently accepting or procedurally replacing the failed component. Animation, dummy and audio acquisition remained pending. No builder artifact, export, native gameplay, desktop/touch behavior or synchronized sound was verified. Finding a relevant component and rejecting broken code are progress; they are not game-generation success.

| Call | Model | Rounded charge |
|---|---|---:|
| Plan | Sol | $0.085404 |
| Select component | Gemini | $0.019052 |
| Original source review | Sol | $0.102267 |
| Adaptation, invalid schema | Gemini | $0.052989 |
| Corrected adaptation | Gemini | $0.056232 |
| Adapted source review | Sol | $0.146052 |

Rounded total461,996microdollars reconciles to official aggregate$0.46199245 within per-call rounding. Provider usage after this run is$5.584533936 of$10; remaining **$4.415466064** at2026-09-16T18:13:26Z. Conservative carried liability is5,899,407microdollars, including older unknown liabilities; historical Engine reservations15,679,525 are separate and must not be treated as spending. The preservation probe, search probe and V10 together cost$0.57331870 this turn.

Full `npm run check` after implementation passed **1,102unit/API +10desktop +36browser tests and all stages**. The evidence verifier passed frozen-request, returned-selection, archive-hash, final-job, route-restoration, cost reconciliation and plaintext-key checks. These are offline/integrity checks, separate from native capture/application evidence and absent gameplay verification.

Final native inspection found Place1/Edit, all three original scripts enabled and zero V10/isolation leftovers; see [final native state](final-native-state.json) and isolation-combat records. Owned test server4335/PID41832 stopped only after authoritative jobnull/reservations0; process27101 exited from that explicit stop. Original4324/PID36672 stayed running unchanged. No paid call, restoration, campaign lock or native cleanup is pending.

Next useful work is adaptation effectiveness: preserve component ownership while dependencies are pending, and compare a stronger adapter or bounded worker repair with raw inputs. Do not feed this report's fixes as benchmark answers or hand-repair the game. Required animation coverage remains unconditional despite conditional reuse prose. Full combat, parkour and ASMR generation/native acceptance remains unfinished.
