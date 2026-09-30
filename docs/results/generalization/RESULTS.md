# Asset generalization

Status: approved implementation in progress. G1-G4 cost $0. G5 is conditional on all G4 safety and playback gates, with nontransferable caps of $1.25 review and $1.75 coding, no retry. No full game trial, live-app restart, installation or publication is authorized. Only TrialReviewInspection is authorized for capture, with Play allowed in G4/G5 only.

## Verified starting findings

- Confirmed: role-evidence.ts supports static target, animation and sound, otherwise unknown/not ready.
- Confirmed: legacy role classification relies on kind and narrow query/role regexes. It ignores structured interaction intent.
- Confirmed for segmentation only: punch-segments.ts requires R6 and exact Dmg/Heavy names. General animation capture is not limited to this detector.
- Partly true: the Luau reference accepts a segment array, but its test corpus contains only the 13-hit clip. It is guidance, not automatically injected game code.

## Tightened protocol

1. G1: explicit proposal role plus user correction, versioned native role facts, shared unknown/block/warn rules and invalidation. Preserve independent source security screening.
2. G2: R6/R15 joint-based motion evidence. Markers, actual keyframe labels and motion proposals are evidence, not proof of attack semantics. Require compatible intended interaction and explicit acceptance of timing. Non-attack and looping clips stay non-attack. User edits remain separately attributed decisions.
3. G3: parameterized 1-to-N reference and tests using multiple real native clips. Supply guidance and evidence to builders, never substitute reference code for model output.
4. G4: use separate development captures, then freeze production code before exposing the precommitted holdout results. Evaluate at least 20 distinct free assets, all declared roles and at least six animations with R6/R15, labeled/unlabeled, single/multi and non-attack coverage. Keep failed/inaccessible results. Missing coverage is an unmet gate, never a reason to secretly substitute a passing asset. Three native playback checks include unlabeled and R15 clips. Stop before G5 on any broken-ready false pass or failed playback. If implementation changes after holdout exposure, the old sample is diagnostic, not unseen validation, and a separately preregistered fresh holdout is required.
5. G5: production prompts, real models, unmodified output, explicit request reservations and reconciled receipts. P-Review uses the historical structural golden. P-Build uses a seeded passing held-out target/animation pair excluding 15008746676. No money moves between probes. Vault access must remain in memory through existing DPAPI, without copying the vault or touching the live app.

Native role evaluation includes noncombat assets. Paid attack probes establish only scoped attack-system results. Doors, vehicles and NPC behavior need separately authorized interaction probes before claiming general game generation. No extra paid probe is authorized here.

Report observed scoped costs separately from whole-game extrapolation. Two probes cannot establish a reliable whole-game budget or validate $7.50 universally. Record assumptions and unknown acquisition, planning and integration cost instead of a fixed percentage guess.

## Progress and evidence

Implementation not yet complete. No held-out search results examined. No paid calls. Original failure records and Release A reports remain unchanged.

G1 implemented: nine explicit roles, persisted user correction, version 2 native facts and approval invalidation. Actual development captures correctly block a robot NPC listing containing only a mesh. Fixed production Image search to use Decal and capture actual content identity. Security inspection remains independent. Native sword fault controls remove its Handle and then change RequiresHandle. Development data is excluded from holdout validation.

G1 validation: 38 unit tests across four files, build/typecheck and one focused browser test passed. Earlier failures retained, including Image search 400 and native MCP table serialization. Full check deferred until task end. Cleanup: Edit, zero scripts/scopes, two Workspace children. No Play, imported scripts or paid inference. Cost $0.

G2 implemented. General native R6/R15 limb chains supply low-confidence motion proposals when recognized authored markers or keyframe hit labels are absent. Sparse pose interpolation and untracked joints use rest transforms, so inferred timings are expressly not native Animator measurements. Recognized markers take priority, then named frames. Unknown authored labels stay unknown. Looping and noncombat clips do not become attacks. Attack requests with no usable timing stay unknown. The picker exposes evidence, confidence and editable boundaries, requires explicit user acceptance, and persists edits separately as user decisions. Evidence changes invalidate acceptance. Legacy 13-hit derivation remains available for regression evidence.

G2 validation: 27 tests across three files plus one production timing-route test passed. Actual R15 captures produce motion proposals. Actual R6 idle produces none. Stale identities and invalid edits reject through the real route. No native Play or paid calls. Authored-marker branch still lacks a naturally captured positive marker fixture and is not claimed as measured coverage. Cost $0.

G3 implemented. The reference accepts validated 1-to-N tables and configurable grace, fade, early-arrival tolerance, range and facing. One track adapter holds/resumes either a registered raw sequence or a permitted published Animation. Death cancels client and server state. Builder context supplies this contract as guidance, never injected game code.

G3 validation: 36 contract tests passed, comprising the 20 original R6 tests and 16 cases across three native R15 clips and one explicitly selected first-action excerpt. The excerpt is not evidence that its full clip is single-hit. Typecheck passed after fixing two new test typing errors. Broad unit regression exposed two old capture-cache fixtures and an old journey that presented a climb clip as punch input. Fixtures now consume current actual native target and R15 punch producer output, with explicit timing acceptance. Focused regression passed 61 tests before the journey correction and 17 tests afterward. Broad run also retained two Windows worker crashes, so it is not a full pass.

Holdout preregistration is now exact: 32 query/rank draws, 195 exposed development IDs excluded, production searchPage and explicit clip/playback selection order. The committed manifest precedes every held-out search. Production code freezes at the G3 commit. No paid calls, cost $0.
