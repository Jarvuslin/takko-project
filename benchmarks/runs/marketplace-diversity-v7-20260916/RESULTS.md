# V7: stronger planning finds more of the requested reusable behavior

2026-09-16. Six fresh plan-only trials, seven provider calls, three unchanged game briefs. Same application source and prompts, 12,000 output-token limits and 300-second deadlines. Gemini 3.7 Flash and GPT-5.6 Sol were alternated for each brief; reviewer and worker routes stayed Gemini and were never dispatched. No root-authored queries, plan repairs, candidate choices or game code. The protocol was registered before dispatch.

| Brief / planner | Behavior discovery under registered rubric | Calls | Billed cost¹ | Planning time² |
|---|---|---:|---:|---:|
| Combat / Gemini | Partial: dummy rig and audio; no combat system or animation need | 1 | $0.018057 | 21.318 s |
| Combat / Sol | Partial under overspecified rubric³; requested combat system and animation discovery complete | 1 | $0.086989 | 146.531 s |
| Parkour / Gemini | Partial: checkpoint and moving-platform models; no course-component need | 1 | $0.018852 | 29.585 s |
| Parkour / Sol | Complete: checkpoint system, moving-platform behavior and course kit | 2 | $0.137809 | 177.440 s |
| Bubble / Gemini | Missing: only audio needs; no interactive Model search | 1 | $0.013734 | 16.135 s |
| Bubble / Sol | Complete: interaction, geometry, deformation, state, sound, counting and reset | 1 | $0.059991 | 95.611 s |

¹ Rounded provider-reported charges. Sol parkour includes an automatic schema correction after its first response added an unsupported `default` key to four needs. This is not a first-attempt pass. Sum $0.335432; official aggregate key usage increased **$0.335428850**, agreeing within seven-call rounding. No new unknown-charge liability. Official allowance remaining **$6.174860964** at 15:59:23 UTC. Prior unknown liabilities remain reserved in the campaign's conservative accounting: future prior **4,139,997 micros**. Historical cumulative reservations **9,404,494 micros** are recorded separately, not treated as spend.

² First planner event to specification-ready event; includes correction time, excludes later polling/evaluation. Single samples, not a reliable latency distribution.

³ The unchanged preregistered combat rubric demanded impact/miss audio. The actual frozen brief requires synchronized hit sound and distinct hit/miss feedback, not a separate miss sound. Independent review caught this scoring error. We retain the stricter registered partial rating and separately state that Sol covered the actual requested behavior-system/animation discovery. Absence of separate miss audio is not a user-intent violation. The protocol was not rewritten after seeing results.

## What the raw plans demonstrate

Combat Gemini searched `combat training dummy rig`, `punch hit impact sound` and `punch swing whoosh`, while preassigning CombatConfig, DummyManager, CombatServer, CombatClient and TrainingHud before inspection. Its accepted-hit counter also risks being conflated with a resetting combo count. Sol instead requested `combat training system`, `R15 training dummy`, `punch combo animations` and `punch impact sounds`, explicitly investigating embedded animation and timing behavior. All its task file lists stayed empty until inspection establishes necessary integration.

Parkour Gemini did investigate existing moving-platform motion; it should not be described as entirely decorative. However, it omitted a course-component need and precommitted MovingPlatformService and CheckpointServer. Sol investigated progression and recovery, rider-carrying motion and endpoints, and coordinated traversal geometry through `obby checkpoint system`, `obby moving platform` and `sky obby course`. Its RunContract and RunHud assignments are reasonable integration responsibilities rather than automatic evidence of replacing the whole component.

Bubble Gemini's narrative promised reusable interaction discovery, but the executable needs only requested audio. It preplanned procedural domes and pop tweens. The structural gate rejected this unchanged plan for missing a Model need. Sol's `bubble wrap pop game` need mapped existing geometry, ready/pressing/popped state, depression/collapse/settle animation, embedded pop media, reset and completion callbacks to the actual brief. Its task file lists stayed empty and it preserved completion-timed exact counting, anti-spam, deliberate reset and desktop/touch requirements. Neither model was supplied the other's answer.

An independent read-only reviewer examined all six outputs. Semantic evaluation above is distinct from the structural gate: five plans passed that gate, including incomplete Gemini combat and parkour plans. A gate pass therefore is not evidence of sufficient understanding.

## Remaining system gap

Sol's plans condition separate media searches on the imported component lacking usable embedded media. However, all corresponding audio needs remain `required: true`, and the current asset pipeline iterates every need, Models first (`src/generation/asset-pipeline.ts`, executionNeeds loop). Task dependencies do not control this earlier phase. Conditional prose is not an executable dependency. This can still cause unnecessary searches or a failure for audio already present in a suitable component.

The next implementation should represent evidence-backed coverage and conditional needs explicitly, preserving native media verification. An embedded SoundId alone must not count as verified audible playback. Do not fix this by silently dropping needs, trusting prose, hardcoding benchmark assets or root-repairing these raw plans.

## Interpretation and checks

These failures happened at **1.4–13.8 cents per plan**, far below the $1 project cap. That cap did not truncate these plans; planner behavior and pipeline representation are demonstrated problems. This does not establish that $1 is sufficient for a complete game, or that increasing the total budget would never help.

Using a stronger planner with a cheaper worker is now a supported hypothesis for the next whole-game test: it improved discovery coverage here at an additional 4.6–11.9 cents per plan, with materially longer latency. We have not established cheaper successful games, reliable asset availability, integration quality or native gameplay. This is one sample per model/brief, with distinct project namespaces, preserved provider profile settings and serial execution; it is not a model leaderboard or causal isolation of every provider difference.

The new plan-mode controller and planner-only override passed 38 targeted tests and TypeScript. Full `npm run check` passed **986 unit/API + 10 desktop + 36 browser tests**, plus all remaining stages. Log: `research/results/planner-probes-v1/check.log`. Offline checks are separate from paid provider observations. No Studio/native test was run in V7, and no artifact was approved, built or exported.

Run `node research/scripts/verify-planner-probes.mjs` to verify all six frozen requests, identical recorded source hashes, unedited plans, planner-only calls, role identities, limits, settings restoration, idle final snapshots, provider charges and aggregate billing. It also scans retained artifacts for plaintext testing keys. Detailed records are in each case/model directory; aggregate output is `verification.json`. The saved encrypted credential was reused without user entry.
