# V13 independent raw-plan assessment

Assessed the unchanged `combat-training/plan-project.json` for project `d451eccc-9382-4b11-bbf8-315cec17af00`, without feedback to the running worker. Its request matches `benchmarks/fixtures/marketplace-diversity-v1/combat-training.txt` after surrounding whitespace removal. This assessment concerns planning coverage, not acquisition success, preserved implementation or gameplay. The saved planning snapshot has no artifact or final review.

**Verdict: complete coverage of the core requested behavior and behavior-first discovery intent, with several stronger planner refinements and unresolved acquisition/integration risks.**

## Requested behavior

| Brief obligation | Raw plan evidence | Assessment |
| --- | --- | --- |
| Three-hit combo with visible windup, contact and recovery | `threeHitCombo`, `lightComboAnimationModel`, `integrateRigAnimationAudio`; all three phases and actual playback required | Explicitly covered; static damage and procedural motion cannot substitute in the plan |
| Humanoid target, health and once-only damage/count at contact | `humanoidDummy`, `exactContactCounting`, `trainingHud`; one server-controlled contact per attack and exactly three increments for a full accepted combo | Explicitly covered |
| Server timing/range validation | `authoritativeTimingRange` requires a live character, valid cadence, combo state and range at contact | Explicitly covered; implementation and adversarial tests remain absent |
| Out-of-range misses, holding and recovery spam | `hitMissFeedback` and `inputGuards` distinguish misses from accepted hits and reject held/repeated requests | Explicitly covered, including no hit audio, damage or count on a miss |
| Synchronized audible hit effects | `synchronizedImpactAudio`, two required Audio needs, retained-media inspection and native playback/listening | Explicitly covered; no separate miss sound is requested or necessary |
| Defeat, practice again and clear reset | `defeatAndReset` specifies automatic restoration and manual reset with stale-contact cancellation | Explicitly covered; counter persistence across automatic restorations is a planner choice |
| Desktop/touch and compact solo arena | Separate attack/reset controls, native tests for both input modes, `arenaWorld`, `soloScope` | Explicitly covered; no PvP, saving, commerce or large world added |

`nativeEvidence` includes full combo, exact counting, range misses, hold/recovery spam, defeat/reset, respawn, both input modes, actual animation playback and synchronized audio. These are future acceptance obligations, not observed passes.

## Executable discovery and ownership

The plan contains six actual asset needs, rather than relying only on prose promises:

- `completeCombatTrainingSystem`: Model query **fighting training system**, optional acquisition. Its requested reusable features include combo timing, server validation, once-only contact, dummy reset, animation and audio hooks, desktop/touch and HUD interfaces.
- `compatibleHumanoidDummy`: Model query **R15 training dummy**, optional acquisition, inspecting connected rig, Animator, collision, reaction/reset behavior and dependencies.
- `lightComboAnimationModel`: required Model query **boxing combo animations**, with three compatible clips, phases and contact markers/timing.
- `dummyReactionAnimationModel`: required Model query **dummy hit animations**, seeking reactions and defeat behavior/media.
- `lightImpactAudio` and `finisherImpactAudio`: required Audio queries **punch hit sound** and **heavy punch impact**, retaining embedded-media preference and native verification.

Complete-system discovery is first. All eight tasks have `files: []`; implementation ownership follows inspection. `integrateAuthoritativeCombat` explicitly preserves compatible imported behavior and authors only missing pieces. Pending animation, audio, controls and lifecycle tasks remain separate integration responsibilities. No raw plan asset IDs, replacement combat source or preassigned script paths appear.

Optional complete-system/dummy acquisition does not make the requested gameplay optional: the strategy permits only bounded unsuccessful-discovery fallback and explicitly preserves capability-gap reporting. However, successful reuse remains unproved. Separate required animation-bearing Model needs are not expressed as conditional on a complete system already supplying equivalent clips; the plan leaves cross-need deduplication/satisfaction unresolved and may force additional acquisition even after finding useful complete content.

## Refinements and limits

The user authorizes reasonable styling/damage choices. A 100-health dummy, 10/12/18 damage, short continuation window, 46-by-34-stud laboratory and octagonal mat are reasonable inferred defaults. `defaultCombatBalance` and `sessionLifecycle` correctly carry inferred origin. Exact numerical combat acceptance remains a plan choice, not an immutable user value.

Some other refinements are embedded in requirements labeled `origin: user`: a stronger separately acquired third-hit sound, dedicated dummy reaction/defeat animation assets, warm/cool feedback colors and specific reset/counter semantics. The brief requires animated combat, a non-static target, synchronized hit sounds and distinct hit/miss feedback; it does not explicitly require a separate finisher sound or dedicated defeat clip. These stronger acquisition gates could reject an otherwise adequate reusable system. Likewise, an R15-specific search is a compatibility preference, not a stated user restriction.

No acquisition, adaptation, native playback or complete-game result follows from this plan. Later assessment must inspect actual preserved behavior and observe play; retained rigs, clips or sound references alone are insufficient. The raw plan has not been edited or repaired for this assessment.
