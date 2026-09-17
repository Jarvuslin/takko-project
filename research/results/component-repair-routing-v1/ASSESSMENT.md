# Independent repair-routing assessment

2026-09-16. Evaluated the historical V13 Gemini second adaptation and fresh Sol response against the preregistered `ASSESSMENT-RUBRIC.md`. Both target the same first-hop evidence through the documented reconstruction. Historical outbound bytes are unavailable, and the evaluator previously saw V13's terminal result. This is a single observational comparison, not a blinded experiment or a model ranking.

**Sol proposes a substantially stronger static repair, but still has intrinsic scope and client-lifecycle gaps. Neither answer demonstrates working native combat or a finished game.** The fresh Sol manifest has not been applied.

## Frozen rubric results

Scores: 2 supported, 1 partial/unresolved, 0 contradicted/absent. No aggregate score is used.

| Dimension | Historical Gemini | Fresh Sol | Reason |
| --- | --- | --- | --- |
| Useful executable preservation | 2 | 2 | Both second answers restore active behavior after the inert first edit. Sol supplies substantially more complete interfaces; equal coarse scores do not imply equal completeness. |
| Scope and safe authority | 0 | 1 | Gemini scans all Workspace humanoids and trusts a requested step. Sol owns sequence state and uses explicit server target registration, but does not enforce the claimed target namespace. |
| Interaction/timing integrity | 1 | 2 | Gemini has two steps and fixed delays without sequence authority. Sol implements a coherent three-step state machine, contact resolution and authoritative results. Its score concerns static ordering; animation alignment is still unverified. |
| Lifecycle integrity | 0 | 1 | Gemini lacks contact cancellation. Sol invalidates server tokens on reset/respawn and cleans player state, but client reset and asynchronous rebinding remain incomplete. |
| Discovery/integration discipline | 1 | 2 | Both preserve media and defer acquisition. Sol supplies explicit target, health/count, reset and result interfaces without inventing a dummy or asset IDs. |
| Evidence honesty | 2 | 2 | Both explicitly leave runtime verification incomplete. Sol clearly distinguishes retained clips/sounds from verified playback. Incorrect authority/scope claims are assessed against actual code above. |

Both raw manifests pass the structural contract. The fresh Sol response passed on its first call; no correction or answer repair occurred. Both sets of unchanged sources compile with the installed Luau compiler, which does not establish runtime correctness.

## What Sol improves

Sol replaces the server stub and replaces the inert legacy LocalScript with an added client-run Script. It retains the animation sequences/containers, three original sounds, effects, settings and remote. This is a substantial rewrite using original content and recognizable combat concepts, not byte-preserved original logic. The original imported behavior was itself unsafe and unverified.

The proposed server (`b0bc8c142d2e8ffa033cbf84b4afb663a112de59b0f179b2857b367879c8d0fe`) derives all three steps and 10/12/18 damage internally. Clients send Attack/Reset, not damage, target or combo step. A TrainingDummy ObjectValue and marker replace global target discovery. Per-attack tokens and target-generation checks guard delayed contacts; reset and respawn invalidate pending state. Server contact-time distance checks precede health/count updates, impact sounds and effects. Replicated health, hit-count and status values plus result messages give later HUD/feedback work a usable interface.

The client (`ced07439b2efcb97067f3a5c67714c461f351afab100237a0711c74d038fcff7`) adds ContextActionService desktop/touch Attack and Reset controls, reacts to server Windup messages and disconnects controls/connections on destruction. It skips empty AnimationIds, reports missing animation steps and retains native playback as unverified. The third clip, dummy, reaction/defeat media, final HUD and native listening remain explicitly pending. Missing those later acquisitions alone is not a failure of this isolated repair.

This directly responds to the supplied review's complaint about inert scripts and absent integration interfaces. It improves on Gemini's raw second answer without our findings or a supplied corrected implementation entering the request.

## Remaining source-level concerns

1. **Namespace claim exceeds the guard.** Server lines 98–102 require only a Model descending from Workspace with `StrikeLabTrainingDummy=true`. They do not require ancestry under `Forge_d451eccc9382`, despite that promise in `remainingIntegration`. Registration is server-side and substantially safer than Gemini's global scan; this is not a claim that a client can directly forge the ObjectValue. Nevertheless, the component does not itself enforce its supplied root contract, nor revalidate that ancestry at contact.
2. **Client character-binding races remain.** Client `bindCharacter` lines 36–43 yields for Humanoid/Animator and then assigns shared tracks without a generation/current-character check. A delayed older binding can finish after a newer one and overwrite its tracks. Server token guards do not protect this client path. This is a static race concern, not a native reproduction.
3. **Reset cancels damage but not current animation.** Client result handling at lines 78–92 starts tracks for Windup but does not stop them on Reset/cancellation. The server can correctly cancel a contact while the visible attack continues. Native reset/interruption behavior therefore needs more than the existing server-token tests.

Other limitations remain explicit: only tracks one and two are loaded, fixed windup/recovery timings have not been aligned to actual media, client action names are not project-qualified, and existing keybind/presentation toggles are not consistently reused. Third-track wiring is legitimate pending integration; optional configuration losses are not automatically user-requirement failures. The server's separate logical health reaches zero while Humanoid health is floored at one to permit restoration; this is a design choice requiring integration/native confirmation, not proof of a working defeat animation.

The namespace and client-lifecycle concerns prevent classifying Sol as a statically clean repair. Contract, syntax and retained-content checks do not resolve them.

## Cost, latency and next inference

Sol cost **$0.1689635** (168,964 rounded microdollars) and took **131.4 seconds**, versus historical Gemini's 48,269 rounded microdollars and approximately 28.5 seconds: about 3.5 times the cost and 4.6 times the latency. Both observations concern this one input, at different times. No native application, audio listening or complete-game result exists for the Sol answer.

The evidence supports further bounded testing of a separate adaptation route: Sol followed the supplied repair/interface obligations more effectively in this case, at higher cost and latency. It does not establish general superiority, justify replacing the audio-capable reviewer, or warrant weakening safety/native gates. A fresh whole-pipeline result and native execution would still be needed to show that stronger static repair translates into a usable game.
