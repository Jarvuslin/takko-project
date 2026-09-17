# V9 parkour: retained components and audio, no generated game

The fresh unchanged parkour run failed because `skyCourseKit` was mandatory and both of the worker's searches returned zero results. The worker proposed composing the missing course geometry, but the pipeline correctly preserved the plan's `required:true` obligation and stopped. No plan flag was changed and no game code/export was generated.

**This was not a budget stop:** 18 provider-known calls cost **527,647 rounded micros**, below the explicit $0.90 project cap. Official aggregate cost was **$0.5276402**. The run was not cancelled. The raw Sol plan covered checkpoint, moving-platform, course and audio discovery plus all gameplay requirements; see `PLAN-ASSESSMENT.md`. Planning needed one automatic correction.

## Actual sourcing and adaptation

| Need | Raw worker action | Result |
| --- | --- | --- |
| Checkpoint system | `obby checkpoint system`; chose Marketplace136434663585151 | Native archive captured, worker adapted, source/export review passed, retained |
| Moving platform | `moving platform system`; chose18628600401 | Native archive captured, worker adapted, source/export review passed, retained |
| Course kit | `sky obby course`, then `floating islands obby` | Both returned zero; worker rejected acquisition; mandatory need failed |
| Confirmation audio | Chose6817150445 already captured from checkpoint | Native inspection and placement each captured playback; both listening evaluations accepted |

The raw worker independently used the newly available embedded-media path. The two audio captures are retained WAVs, and both evaluations describe a brief positive chime with natural completion. This establishes standalone native sound capture/listening, **not checkpoint-event synchronization**.

Independent source assessment found substantial rewriting, not unchanged behavior reuse. Checkpoint19nodes/6source bodies became14nodes/3new bodies; platform19nodes/3bodies became18nodes/2new bodies. **No unchanged executable source body survived either adaptation.** Geometry, hierarchy, sound and recognizable algorithms remain, but whole behavior has not run. Removing an unresolved numeric loader, adding ordering and replacing one-shot activation were reasonable changes. Important limitations remain:

- Checkpoint activation flags only clear when the player leaves. Resetting Stage for replay cannot reactivate previously touched checkpoints without more integration or lifecycle changes.
- CheckpointIndex is read once from each checkpoint **Part**, defaulting to1. Model-level or late attributes do not configure it correctly.
- Platform changes remove the original Active-change handler, ResetWhenDeactivated and LoopOnce behavior, and retain a broad Workspace scan for models named MovingPlatform rather than restricting it to the generated scope.
- Reviewers approved static integration despite these issues. Neither checkpoint traversal/replay nor platform motion/rider carry has been verified.

The root did not repair any of these raw outputs or supply a replacement asset, query or game. Accepted component/static reviews do not count as full semantic or gameplay success.

## Reliability and cost findings

Sol first emitted four illegal `default` fields instead of choosing `required`; its correction removed them but still omitted `required`, so the existing parser supplied true. Three Gemini source-review first attempts copied a root `$schema` metadata field. All four automatic corrections passed, costing **$0.158369** altogether (about30% of the total). Metadata copying is a plausible interface failure; that hypothesis requires a new raw test rather than relabeling this run.

The next generic changes advertise an explicit sourcing decision and distinguish a JSON data instance from its schema. They must not change this saved plan or automatically make acquisition optional. Better search breadth, adaptation fidelity and semantic review remain separate open issues.

## Settlement and cleanup

Controller exec91624 is terminal exit1 for the recorded failed build. `noFurtherCallsPending:true`, `routesRestored:true`, zero in-flight reservations and zero new unknown liability. Official usage4.311191036→4.838831236; key remaining **$5.161168764**, checked2026-09-16 17:09:39UTC. Conservative prior becomes **5,153,698micros**, retaining older unknown liabilities. Historical Engine reservations **13,370,563micros** are separate from charged spending. Existing $6campaign ceiling and $0.40headroom leave446,302micros admission capacity before future settled charges.

`verify-diversity-run.mjs` passed frozen request, returned selections, immutable archives, billing reconciliation and no plaintext-key checks. First preflight stopped on a mistyped copied expected plugin hash; it was corrected against `research/evidence-inventory.json` before any paid call or native mutation. Actual installed plugin matched the preserved snapshot throughout.

Isolation restored all three original scripts without source changes. Final native read: Place1 Edit, original Butter/Crunch scripts Disabledfalse, no run scope or isolation leftovers. Owned4335 PID37404 stopped after authoritative idle check (exec24228 terminal); original4324 PID36672 untouched. No full-game result or exported artifact exists. The broader combat/parkour/ASMR goal remains unfinished.
