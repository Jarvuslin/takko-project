# Roblox Quality V1

## Application-owned asset execution

Takko's retained asset run is now assessed with `npm run benchmark -- asset-execution --project FILE --out NEW_FILE`, including failures before an artifact exists. For artifact-backed Takko runs, use `score --asset-project FILE` along with the usual submission and evidence manifest. Failed execution vetoes a successful rating; completed acquisition cannot award gameplay/quality passes. See [worker asset execution](../docs/takko-worker-asset-loop.md). Assistant search files in the abandoned Butter Crunch assisted attempt are explicitly excluded.

This is a small, authored evaluation suite for Takko. It separates development competence from complete-game quality. The catalog contains **definitions, not results**: all nine cases are unrun. The asset-integration and six game cases have pinned starting fixtures; the animation and replication-repair fixtures remain unprepared.

The user's benchmark brief is a reference, not an executable instruction file. This suite adapts its useful ideas—feature definitions of done, native observation, long-form gameplay, asset provenance and assistance tracking—without equating a numerical rubric with commercial or front-page competitiveness.

## Catalog and contracts

The canonical catalog is [`src/benchmark/cases.ts`](../src/benchmark/cases.ts). Suite ID: `roblox-quality-v1`; initial case version: `1.0.0`. The scorer contract lives in [`src/benchmark/quality.ts`](../src/benchmark/quality.ts). Case definitions own their gates; submissions cannot remove inconvenient requirements.

### Primary cases selected by the user

The user supplied **benchmark archetypes**, not named reference games. `primaryBenchmarkCaseIds` fixes these three as the primary progression; `caseTier` labels their intended complexity. No measured difficulty, quality rating or market equivalence is implied.

| Tier / case ID | Bounded target | Required feature evidence |
|---|---|---|
| Easy — `game.asmr-interaction` | Cloud Workshop: one workshop with pressing, physical marble sorting and stamping/stacking; bounded physics and two interaction variations | Actual object/mechanism/deformation motion, synchronized sound, mouse/touch UI, progression, asset sourcing and physics/performance observations. No combat-animation requirement. |
| Medium — `game.collect-and-steal` | Hatchling Heist: two six-slot bases, six original collectible types, market lane, economy, theft/defense, upgrades and one rebirth tier | Real two-client steal/deposit/protection/ownership observations, authoritative economy, animated interactions and **real service-backed fresh-session save/rejoin proof**. |
| Hard — `game.small-fighting` | Pulse Duel: one arena/moveset, three-hit combo, two abilities, evade, training and two-client rounds | Native animation timing, server hitboxes/cooldowns, actual replicated duels, synchronized VFX/SFX/camera feedback, usable UI and repeated-round reliability. |

The collect-and-steal archetype uses original characters, art, names and branding. Mentioning Steal a Brainrot specifies an interaction/economy pattern, not permission to copy its characters or assets. Its persistence evidence must record an already-authorized isolated service namespace, actual write/read receipts, saved revision/fields and a fresh server/session rejoin. Mock DataStores, in-memory state and an ordinary respawn cannot satisfy that check. Unavailable access or missing receipts remain pending; the case does not authorize publishing or enabling production services.

Every primary feature is also a required named check with a scoped evidence policy. The internal field name `requiredDevChecks` is shared with complete-game cases; it does not reduce these to DevBench. For example, object animation needs native motion and video, physics needs native execution and performance capture, saving needs native service proof, and two-client theft/fighting needs actual native observations. An evidence label alone still requires content/provenance review.

### Supplementary cases

The original six cases remain available with their existing IDs, prompts and starting-fixture bindings:

| Case ID | Scope | Principal evidence |
|---|---|---|
| `dev.animated-ability` | One animated, server-authoritative firebolt in an existing arena | Rig/action motion, native caster/observer behavior, hit/cooldown tests, VFX/audio/UI feedback |
| `dev.asset-integration` | Retrieve and integrate one suitable merchant prop | Relevant search, chosen/rejected reasons, actual permission and import proof, native fit/access, performance observations |
| `dev.replication-repair` | Double rewards, late-join stock and duplicate respawn listeners | Before/after regressions, two-client behavior, preserved economics and surgical source diff |
| `game.crystal-hollow` | Collect/sell, two upgrade choices, second quarry tier, personal goal and bounded variation | Complete loop, mining animation, composed world, usability, source provenance and 15-minute progression |
| `game.round-combat` | One arena, two enemy behaviors, three round patterns and bounded replay | Attack/telegraph timing, server authority, readable VFX/audio, round lifecycle and 15-minute challenge |
| `game.lantern-adventure` | Two regions, three environmental interactions, checkpoints and optional discovery | Clue/landmark readability, interaction animation, recovery, world-state resolution and 15-minute exploration |

Each definition includes a prompt, scope/exclusions, feature DoD, action storyboard where relevant, evidence types, fixture readiness, asset policy, checkpoints and reference IDs. DoD is a checklist for an evaluator to verify, not a claim that those checks execute automatically.

DevBench uses scoped pass/fail/pending checks. A replication repair does not need new animation, audio, combat, art or 15 minutes of content. Native replication and import checks require native evidence; a passing isolated mock cannot substitute. The animated-ability case does require animation and combat feedback because those are requested features.

GameBench uses these fixed weights: mechanics 15, content depth 15, art/environment 15, animation 10, UI/UX 8, VFX 7, audio 5, game feel 10, reliability 5, performance 5 and intent alignment 5. The scorer separates hard failures and missing evidence from a weighted observation. Missing evidence remains pending, not zero and not a pass. A working script cannot offset an unobserved animation, stalled loop or missing required feature. Its “good-rating eligible” threshold is an internal rubric result, not a claim of market readiness.

## Fair comparisons

The planned profiles are **limits for future explicitly authorized runs**, not authorization to make model calls, purchase assets or upload anything. The benchmark CLI does not itself call generation models.

| Profile | Generation wall time | Model cost ceiling | Total output-token ceiling | Native gameplay observation |
|---|---:|---:|---:|---|
| `dev-v1` | 10 minutes | $1 | 30,000 | Task-specific; no mandatory 15-minute session |
| `game-v1` | 30 minutes | $2 | 90,000 | 15 active minutes plus separate correctness/usability checks |

Each profile permits at most two automated repair attempts within the original time/cost/token ceiling. Preserve the first completed candidate separately. Evaluator/reviewer calls and retries consume that ceiling; do not hide them as free infrastructure. Report exhaustion as an observed limit. These proposed ceilings may be impractical for some models; that is a limitation to report, not permission to silently extend one run.

Freeze and hash the starting artifact and exact prompt. Pin model/settings/pricing, seed/replicate, tool names and versions, permissions, Studio/API version, asset catalog access or query captures, OS/hardware/viewport/input/graphics and network/client schedule. All compared runs use the same profile. Compare within the same case and assistance track; genre-level aggregate results need the full matched case set and should expose per-case variation. Blind candidate labels and randomize pairwise viewing order when obtaining human judgments.

The scorer checks declared comparison metadata, not its real-world truth. Referenced evidence must be opened, hashed and audited; a plausible label or claim is insufficient. A fixed `toolProfile`/`environmentProfile` should resolve to the frozen manifest, not a mutable informal name. Preserve failed runs and predeclare seeds/replicates rather than selecting the best candidate afterward.

### Three assistance tracks

- **Untouched model:** freeze the first completed output before evaluator-directed correction. Record every call and tool action. Validators may report findings, but subsequent fixes are excluded from this artifact.
- **Automated repair:** fork that exact artifact and log every evaluator-directed automated attempt, diff, reviewer call and cost. Keep expert edits out of this track.
- **Expert assisted:** fork an attributed candidate and record all stronger-agent/human design, code and scene changes, labor time and available model cost. Report its quality independently; it does not prove the original worker achieved that result.

The existing Crystal Hollow visual V2 is a **retrospective expert-assisted anchor**. Its prior solo gameplay evidence is useful, but it did not use this prompt, matched budget or 15-minute protocol. Do not backfill a prospective run or invent a fair model comparison from it.

## Prepared starting fixtures

[`fixtures/v1/quarry-asset-integration/`](fixtures/v1/quarry-asset-integration/) contains the exact public bundle and place export of authored Crystal Hollow visual V2. It includes the existing sell interaction for `dev.asset-integration`; the model's task is to integrate a suitable asset while preserving that interaction. Historical coverage inside this bundle is not completion evidence for the new task. The private project wrapper, specification, model traces, charges, provider configuration and credentials are not copied.

[`fixtures/v1/fresh-game/`](fixtures/v1/fresh-game/) contains only a scoped floor and neutral spawn, with no gameplay scripts, assets or coverage. Its unchanged manifest binds the original three supplementary game cases. [`fixtures/v1/fresh-game-primary-v1/`](fixtures/v1/fresh-game-primary-v1/) reuses the identical bundle/export bytes with a separately named manifest binding the three new primary prompts. All six game cases start from the same geometry; no original prompt binding is overwritten. This is a starting point, not a generated game or quality result.

Each directory includes `bundle.json`, `export.rbxlx` and `manifest.json`; the entire fixture library remains below 400 KB. Manifests pin bundle-file, artifact and export hashes plus allowed case ID, version and exact prompt hash. `readBenchmarkFixture()` rejects a wrong case, changed brief or version, tampered files, or mismatched catalog hashes. Changing a case's prompt requires an explicit version/binding update; an existing fixture must not quietly become a result for a different brief.

| Fixture | Artifact SHA-256 | Export SHA-256 |
|---|---|---|
| Quarry integration | `5190a564e55264c10ac8d1a4da30ef3a076cdf88c77d6a149c8479a3b6603eb9` | `6ff9e32c4cd1a98336fbb784628c680fa6660324331508d545ce24d920b7c35a` |
| Fresh game | `a1f9a263ad9e6098845841d6bc0ff190457e088948fa690cc46101277c43bc54` | `294c7287cc12b0e42304f4b07d105e54bcba0ae8041e150f9a2f7409aae77793` |

To reproduce from the existing frozen source, with the Luau compiler installed:

```powershell
npx tsx scripts/prepare-benchmark-fixtures.ts .forge/evaluations/takko-crystal-hollow-v2-20260915/visual-refinement-v2/project.json
```

The private input path is supplied only as a command argument. The script requires the pinned source artifact hash, validates/compiles the quarry, validates the empty template, and writes only public fixture outputs. Identical existing outputs are left intact; different existing files are refused. No original files, Studio state or live application sessions are changed. The prepared quarry inherits the documented historical native baseline; preparation does not claim a new benchmark/native pass. The empty template has offline validation only.

The two other DevBench cases still require intentionally prepared, hashed starter projects and known failing/passing tests. Their case status remains unrun, and their fixture status remains unprepared.

## Native session protocol

The full machine-readable wording is exported as `nativeSessionProtocol`.

1. Warm up rendering/networking for 60 seconds in an isolated copy without earning progression. Restart a fresh scored session from the pinned project/seed. Confirm no retained coins, upgrades, objective state or old test scripts.
2. Record real, unaccelerated **active gameplay**. Pause timing for evaluator setup, disconnects, idle tool waits and gaps without play. Wall time between MCP calls is not content depth. Do not advance the game's clock or fabricate timestamps to reach a checkpoint.
3. Capture observations at or after 120, 300, 600 and 900 active seconds from the same session. Include timestamped footage, actual player/game state, decisions, transitions and stalls. Unreached checkpoints stay pending. Finishing early is allowed, but actual replay/mastery must support the remainder; repeated unchanged actions indicate weak depth.
4. Predeclare one primary device/viewport/input mode and graphics level. Run a separate fresh desktop/touch usability check. Do not splice multiple sessions or devices into one 15-minute claim.
5. Predeclare the case-appropriate solo, cooperative or competitive primary setup. ASMR uses solo primary play; collect-and-steal and small-fighting require two actual clients during primary play. Both candidates use identical roles, client count and join schedule. Run separate targeted late-join, reconnect, respawn and shared/personal-state checks; do not splice a fresh persistence session into the 15-minute capture.
6. Record frame-time distribution, memory and hitches under matched warmup, route, capture duration and hardware. Object/mesh/animation/audio counts support diagnosis but do not measure visual quality, animation timing or actual performance.

The catalog supplies what to observe at each checkpoint. A working first action is not evidence for later progression. UI screenshots are not animation evidence; a source-defined animation or AssetId count does not prove motion plays, replicates or fits the rig.

## Asset sourcing and fallback

Every complete-game case requires the `asset_sourcing` gate. The focused asset task additionally requires real `asset_integration`.

Record the actual timestamped query, tool/catalog version and style/function constraints; returned candidate identities and canonical sources; considered choices and rejection reasons; exact selected creator/asset/version; permission evidence for this experience/use; import receipt and resulting scoped instances; script/dependency inspection; and native appearance, rig, collision and performance compatibility. Public listing or “free” price is not a universal license or proof that an animation can run for this owner.

Search relevance matters, not a quota. One suitable, authorized first result can be enough. Empty results and tool/access failures are evidence to retain. After a relevant search finds no suitable permissioned compatible match, record why and what was built procedurally. That can satisfy a game’s sourcing process when the fallback’s native fit is demonstrated; it cannot pass the focused external-integration task. Primitive geometry is not automatically bad art, and imported meshes are not automatically good art.

No candidate IDs, asset licenses or successful imports have been invented in the catalog. See the separate [research audit](../docs/benchmark-research-notes.md) for capability and permission findings.

## Reference library: metadata only so far

These are candidates for later review, with `reviewStatus: unreviewed`, no rating and no captured media. They are not quality tiers, targets for cloning, equal-budget baselines or grants of reuse permission.

- [Mining Simulator 2](https://www.roblox.com/games/9551640993/Mining-Simulator-2), by Rumble Studios: official identity checked; potential resource-loop/presentation study.
- [Super Bomb Survival](https://www.roblox.com/games/164051105/Super-Bomb-Survival), by Polyhex Games: official identity checked; potential hazard/round readability study, with different mechanics and production scale.
- [Adventure Forward 2](https://www.roblox.com/games/718034741/Adventure-Forward-2): official title located; creator/version/current playability still unverified. Candidate landmark/traversal study only.
- [Historical Crystal Hollow visual V2](../docs/crystal-hollow-polished-native-verification.md): retrospective local evidence, awaiting review under the new rubric.

Before pairwise calibration, select references with the user, verify current identity/version and media rights, capture matched gameplay segments, and have reviewers record specific observable differences. No source page text alone establishes a game's quality. The suite cannot determine front-page/commercial competitiveness without broader player testing, retention, production scope and market evidence.

## Masked pairwise review packets

For two prospective comparable submissions with verified evidence manifests:

```powershell
npm run benchmark -- pairwise --a FILE --a-manifest FILE --b FILE --b-manifest FILE --seed SEED --out NEW_DIR
```

The CLI prepares a review packet and blank structured form, with the identity mapping kept separately. It does not call a model, calculate a winner, require preexisting scores, or copy media assets. The case/version/protocol, budget, assistance and tool/environment profiles must be comparable. Historical retrospective anchors cannot be presented as controlled paired runs.

`createPairwiseReviewPacket(a, b, seed)` in [`src/benchmark/pairwise.ts`](../src/benchmark/pairwise.ts) returns `{ packet, form, mapping }`. A canonical ordering followed by a deterministic seeded swap makes A/B assignment reproducible even when command input order reverses. The seed and candidate identities stay in the private mapping. Freeze the seed before viewing candidates, and do not share the mapping with the reviewer until their form is complete.

The displayed packet omits candidate IDs, artifact hashes, model-associated profiles, original evidence IDs, observations and supplied scores. Model-review records are excluded. Evidence receives local IDs such as `A-E001` with its kind, URI and dimension tags. **URIs, filenames, titles inside files and media content can still reveal identity**; this is masked metadata, not guaranteed blindness. Reviewers should record any leak as a limitation. The helper only checks metadata; the CLI's manifest verification and the reviewer's inspection establish what the linked evidence actually contains.

The form asks for reviewer ID, overall limitations and one judgment for each of the eleven dimensions:

- `choice`: `A`, `B`, `tie` or `insufficient`.
- `confidence`: `low`, `medium` or `high`.
- A concise rationale, evidence pointers with precise timestamp/frame/test locations and observations, and dimension-specific limitations.

`validatePairwiseReview(packet, form)` requires each dimension exactly once and rejects foreign packet/evidence IDs. An A/B/tie judgment must cite both sides. `insufficient` may have no usable evidence but must state a limitation. Irrelevant dimensions in a narrow development task should be marked insufficient because they are outside the requested scope, not scored as missing game features. A blank form is intentionally invalid as a completed review.

These judgments are not absolute dimension scores or benchmark passes. Numeric scoring, adjudication and a claim that something is “good” require their own evidence-backed evaluation. A filled form's structural validity does not certify the truth or quality of the review.

After filling the form, validate it with `npm run benchmark -- review-check --packet NEW_DIR/reviewer/packet.json --review path/to/completed-form.json --out .forge/validated-review.json`. Keep the original blank form and private mapping intact.

## Offline commands and current baseline

Run from the repository root. Every output path must be new; commands refuse overwriting results.

```powershell
npm run benchmark -- catalog --out .forge/benchmark-catalog.json
npm run benchmark -- inspect --project benchmarks/fixtures/v1/quarry-asset-integration/bundle.json --out .forge/quarry-inventory.json
npm run benchmark -- freeze-evidence --submission path/to/submission.json --out .forge/evidence-manifest.json
npm run benchmark -- score --submission path/to/submission.json --manifest .forge/evidence-manifest.json --out .forge/benchmark-score
npm run benchmark -- compare --a path/to/a.json --a-manifest path/to/a-manifest.json --b path/to/b.json --b-manifest path/to/b-manifest.json --out .forge/benchmark-comparison.json
```

The [reviewed historical submission](runs/crystal-hollow-v2-retrospective-r2/submission.json) is a concrete schema example. Its [report](runs/crystal-hollow-v2-retrospective-r2/evaluation/report.md) deliberately issues no whole-game score and passes no new-case gates. It retains old solo observations without promoting them into the broader new protocol. The first import is retained with a superseded notice for the audit trail. [Interpretation and worker limitations](../docs/takko-quality-benchmarks.md).

Use [review anchors](rubric.md) when collecting scores. Evidence URIs must point to workspace-relative regular files, at most 64 MiB each; split long recordings into timestamped segments and preserve session identity. Hashing freezes bytes and the submission, not the truth of claims. Do not hand-label invented data as native evidence. Passed asset gates and asset-related development checks additionally require a complete structured sourcing record; metadata prose alone is rejected by both scoring and comparison commands.

Longform checkpoint evidence includes `sessionId`, `sessionStartedAt`, `observedAt`, `elapsedSeconds` and `activeElapsedSeconds`. Use real timestamps and active-play measurements from one session; missing fields remain pending and impossible timing is rejected. See `qualitySubmissionSchema` for the exact contract.

### Software checks

`npx vitest run tests/benchmark-cases.test.ts tests/benchmark-fixtures.test.ts` passes eleven checks covering fixed IDs/version, primary archetypes and tiers, scorer compatibility, contextual feature policies, rejection of mock-only persistence, pending unrun results, long-form checkpoints, shared profiles, unreviewed references, exact public fixture hashes, deterministic exports and separate case/prompt bindings. It does not generate a game, search/import assets or run Studio.

`npx vitest run tests/benchmark-pairwise.test.ts` covers masked metadata, stable seeded assignment, comparability rejection, artifact attribution and complete evidence-backed forms; non-insufficient judgments require eligible evidence for the stated dimension from both sides.
