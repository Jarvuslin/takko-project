# Fighting build recovery

2026-09-23. The retry did not produce a playable game. It cleared the original build blocker, then exposed a false asset-integration claim. That run was cancelled, the newly exposed defects were fixed, and native acquisition was checked separately without paid inference. See [RESULTS.md](results/fighting-build-fix/RESULTS.md) and [COSTS.md](results/fighting-build-fix/COSTS.md).

## Diagnosed causes and fixes

1. **Deadline mismatch.** Takko imposed a 120-second model deadline. The earlier authorized retry completed combat planning in about 172 seconds with 17,382 reported output tokens. The engine and Models UI now share a 600-second default. Explicit overrides still apply. Output allowance and reasoning settings are unchanged. Diagnostics retain elapsed time, deadline, cancellation and uncertain billing. Accounting settles before diagnostic writes so logging failure cannot strand a reservation. This evidence does not establish why the provider took that long internally or prove a Studio/network outage.

2. **Wrong approved assets offered.** The adapter returned every approved candidate of the requested type, ignoring its role. An optional arena backdrop search offered the dummy, animation pack and hit VFX. Policy required inspection before skipping an optional candidate, causing repeated selection calls against irrelevant fixed choices. Approved references now match the linked requirement's explicit asset ID or approved group role. Empty optional fixed pools are recorded and skipped without paid selection calls. Missing required approvals still block. Normal Marketplace discovery and inspection controls remain.

3. **Phantom imports accepted.** The retry generated arena geometry, boundaries, a pedestal and spawn. A worker then declared an empty Model and placement script to be an integrated Marketplace dummy without an imported hierarchy. The coordinator accepted this and began another assignment. I cancelled the run. Build preflight now derives required acquisition steps from approved selections and linked requirements. Provided model, mesh and audio IDs require retained native acquisition evidence. The new guard rejects the exact saved empty-dummy claim.

4. **Approval never reached native inspection.** The native adapter only recognized candidates discovered by its own search, but the approved-reference adapter bypassed that search. The host now binds a scoped approval receipt before inspection. Candidate identity and need checks remain enforced. Approval is not evidence of inspection or permission to execute imported scripts.

5. **Composer consumed the conversation.** At 844×575, four attachments left a 16px conversation viewport. Attachments and the composer now scroll within bounds. The fixed live instance measured 174px with reachable send controls. Desktop/mobile regression tests cover this case. This is not a claim that every reported UI issue is resolved.

## What the live retry established

The first dummy response took about 309 seconds and returned invalid JSON. Its provider-reported output was 28,769 tokens, below the configured 32,768 limit. A correction returned valid JSON in about 38 seconds, but contained the semantic import defect. No truncation or timeout was observed in this retry. Provider token counts and visible response length do not reveal the exact internal reasoning allocation.

The retry reused the saved plan in an isolated profile. It did not validate a fresh concept-to-game journey. It ran before the later acquisition and approval-handoff fixes. Those fixes have automated coverage and unpaid native inspection evidence, but no subsequent paid generation pass.

## Native evidence and remaining limits

The corrected handoff retrieved the actual dummy, including 18 instances and one script. It also retrieved the animation pack and captured its complete 636-node review archive and script. Neither imported script was executed. Both require component review rather than silent conversion into static geometry.

The animation pack has editable keyframes but no published AnimationId in its inspected inventory. Web preview motion does not establish Animator playback. The dummy's respawn script needs adaptation for a passive, indestructible target. These remain integration requirements.

No generated game was applied. Fist input, hit detection, exact counter increments, audible SFX and runtime animation playback have not passed an end-to-end Studio test. The Marketplace MCP connection and Takko's separate apply/test plugin connection remain distinct.

## Delivery, cleanup and budget

Final package: `release/takko-build-recovery-20260923-final/Takko-win32-x64/Takko.exe`. The earlier package without acquisition fixes is provisional. No user app was restarted or replaced. Current Models settings are unchanged.

Eight provider-confirmed calls cost $1.049888. One cancelled call retains a conservative $0.552888 hold. Total evaluation accounting, including earlier attempts, is $3.192003 of the authorized $4.40 cap. Remaining cap: $1.207997. Provider balance: $2.062448 at 2026-09-23T18:53:12.031Z. The provider balance delta is not an attributable per-call receipt, so the full cancellation hold remains.

Temporary imports and the probe scope were removed. Original scripts were unchanged. Studio was left in Edit mode with its baseline scene. Owned live test services were stopped. The original failed project, partial retry, red tests and failed native probe are preserved. No paid retry after the acquisition fixes has been dispatched.

