# Preservation context: verified delivery, limited reviewer improvement

The missing before/after handoff is fixed and tested. A fresh raw Gemini comparison did **not** demonstrate better detection of lost behavior: both reviews missed all three preregistered removed controls. The treatment did qualify remaining integration more accurately. No game was generated, repaired or executed.

| Measure | Current evidence only | Original + current evidence |
|---|---:|---:|
| Paid calls | 1 | 1 |
| Contract valid | Yes | Yes |
| Disposition | integration_candidate | integration_candidate |
| Provider cost | $0.02398875 | $0.03083625 |
| Engine call duration | 20.534 s | 27.847 s |
| Input / output tokens | 15,270 / 3,343 | 22,735 / 3,676 |
| Targeted preservation losses identified | 0/3 | 0/3 |

The treatment cost 28.5% more in this pair, with no cached input reported. One sample per arm is not a reliable estimate of general quality or costs.

## What changed

The pipeline previously replaced original evidence with adapted evidence before re-review. New host context supplies the original captured sources, actually applied plan and checked original/current mapping. It verifies identity, source hashes, nodes, source bindings/settings, configuration and media against the same deterministic inventory used by durable adaptation records. Engine presents numbered sources, with plan code referenced by current hashes rather than repeated. Historical initial reviews and immutable archives remain compatible. Raw review responses and current-only citation validation are unchanged.

The [protocol](PROTOCOL.md) was registered before calls. Both arms use identical current code, schema, generic instructions, game context, model and limits. Only `context.preservation` differs. This is a context ablation, not an exact replay of the historical V9 prompt. Independent findings and expected answers never entered the live inputs. No result was injected into a game.

## Independent semantic assessment

Both decisions are partial. Neither mentions lost **Active change handling**, **ResetWhenDeactivated**, or **LoopOnce**. These are real original interfaces, but optional for the requested continuously looping crossing; their absence alone does not prove a user gameplay requirement failed.

Both also miss the explicit need constraint to restrict discovery to the owned Forge scope. Current server lines 155–164 scan all Workspace and match platform models by name or tag. The original already scanned globally, using only tags; adaptation broadens that existing scope risk. Neither review reports unresolved source issues.

Treatment improves `courseCore` and `compactComfortableLayout` from static-evidence claims to `integration_needed`, specifically noting course placement, waypoint alignment and comfortable gaps. Both retain useful kinematic/raycast behavior and geometry, identify character-script delivery and require native verification. Each has four relevant current service citations and three supported removed-capability assessments; no before/current citation contamination was found. Treatment's claim of reliable attachment remains unverified.

The result supports keeping the missing context available, but not treating this cheap reviewer as a proven semantic preservation gate. More context alone did not resolve the targeted error. A stronger reviewer or a more explicit comparison task needs a separately bounded test before more whole-game spending.

## Verification and operational record

- Focused implementation tests: 242 passed collectively, plus TypeScript. Full `npm run check` rerun: **1,066 unit/API +10 desktop +36 browser tests**, all other stages passed; log `check-rerun.log`, process 93003 exit0.
- First full check failed with a Windows worker crash (3221226505) in `tests/api.test.ts`, not a reported assertion failure. Preserved `check.log`; that suite passed all10 tests alone (`api-recheck.log`) before the unchanged full rerun.
- Offline controller preflight (`offline/`) replayed the historical valid decision as a fixture, one call per arm, zero paid calls. Live prompts contain none of that answer.
- Initial live preflight (`live/`) stopped before key restoration or any call because parsed JSON omits an `undefined` property. Controller v2 compares serialized contexts; exact first-wire comparison remains. Fresh paid run is `live-paid/`, process95165 exit0. Application sources were unchanged after the full check.
- Verification initially assumed the old project's artifact was absent; it is actually an empty four-array artifact. Corrected verifier checks all arrays remain empty. It then rejected billing lag until a fresh official snapshot reconciled. Preserve all snapshots, including the misleadingly named intermediate `key-after-settled.json`, which includes only the baseline charge. Authoritative snapshot is **`live-paid/key-after-final.json`**.
- `verification.json` passes raw decision equality, context-only difference, source pins, current-evidence validation, serial reservation bounds, empty artifacts, no pending calls, and official billing reconciliation. Current source hashes and immutable records are preserved in the protocol/evidence directories. Original app has18 projects/no active jobs (`original-app-idle.json`), remains PID36672 on4324 with older source. No service restart, Studio operation, original-place edit, or native cleanup was needed.

Actual total provider cost **$0.054825**, rounded per-call total **54,826 microdollars**. Official key usage **$5.011215236**, remaining **$4.988784764** of$10 at2026-09-16T17:40:01.4521279Z. The saved DPAPI key was reused without re-entry or plaintext persistence. No new unknown liabilities or active reservations remain.

Future conservative prior **5,326,084 microdollars** retains historical unknown liabilities. Historical Engine reservations are **13,893,470**, a separate cumulative metric, not spend. The old $6 campaign with$0.40 headroom now leaves **273,916 microdollars** for new admission; a$0.90/$1 full run does not fit unchanged limits. Any future batch must document its limits and carry the prior ledger forward. The broader raw combat/parkour/ASMR goal remains active and unfinished.
