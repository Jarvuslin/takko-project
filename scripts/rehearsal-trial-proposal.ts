import fs from "node:fs";
import { proposalDraftSchema } from "../src/generation/proposal";
import { animationClipSchema } from "../src/generation/animation";
import { nativeRolesSchema } from "../src/marketplace/role-capture";
import { punchSegments } from "../src/marketplace/punch-segments";

// Reviewable input only. Never edits the original project or fabricates approval.
const original = JSON.parse(
  fs.readFileSync(
    "docs/results/direct-build-acceptance/terminal-project.json",
    "utf8",
  ),
);
const capture = JSON.parse(
  fs.readFileSync("tests/fixtures/asset-roles/15008746676.json", "utf8"),
);
const clip = animationClipSchema.parse(
  JSON.parse(
    fs.readFileSync(
      "tests/fixtures/asset-roles/15008746676-infinity.json",
      "utf8",
    ),
  ).clip,
);
const sequence = nativeRolesSchema
  .parse(capture.snapshot.nativeRoles)
  .sequences.find((s) => s.poseDigest === clip.sourcePoseDigest)!;
const timing = punchSegments(clip, sequence)!;
const draft = structuredClone(original.proposal);
for (const key of [
  "revision",
  "hash",
  "approval",
  "changed",
  "summary",
  "assetStateVersion",
])
  delete draft[key];
for (const need of draft.assetNeeds) delete need.pick;
const dummy = draft.assetNeeds.find((n: any) => n.id === "target_dummy");
dummy.constraints =
  "Use selected Straw Target Dummy 10161087974, version 12699640075. Native capture has 17 nodes, 11 parts, zero scripts and zero Humanoids. Retain its geometry as a stationary physical target at the existing requested position. Health or respawn behavior is not supplied. No sound or VFX. Static capture is not gameplay verification.";
dummy.intent.reusableFeatures = [
  "Captured physical target parts for server-side hit queries",
  "Captured model hierarchy and bounds for ground placement",
];
const animation = draft.assetNeeds.find((n: any) => n.id === "punch_animation");
animation.constraints =
  "Use selected model 15008746676, version 19600289951, exact raw R6 KeyframeSequence infinity punches at 1/11/1. Retain source data in ReplicatedStorage. The clip is 2.75 seconds, with 12 Dmg keyframe names and one Heavy, zero KeyframeMarkers. Raw registration is Studio-only. No sound or VFX. Playback and smoothness remain unverified.";
animation.intent.interaction =
  "Each fresh left-click advances one authorized segment, with at most one buffered next segment. Never play the whole clip for one click. Use the accompanying captured segment table.";
animation.intent.reusableFeatures = [
  "Captured R6 poses and source pose digest",
  "Named keyframes and full-precision timing table",
];
draft.mechanics = {
  text: "Desktop R6 progressive 13-punch combo. One fresh left-click authorizes one segment, at most one pending click. Clamp playback at each segment end before testing crossed hit times. Hold 0.35 seconds for the next click, otherwise reset with a 0.08-second fade. Segment 13 resets and requires a fresh click. The server owns combo nonce, ordered segment index, hit schedule, six-stud range, facing, line of sight and target scope. Allow requests at most 0.10 seconds early but never schedule before the preceding recovery ends. Reject stale/replayed/out-of-order requests. Preserve earlier pending hits when the next segment is accepted. Death, respawn, timeout and completion rotate the nonce and clear pending hits. Increment the counter only for an authorized server hit, at most once per target per segment. No sound or VFX.",
  assumptions: [
    "The 13 hold endpoints are pose-derived proposals, not native smoothness evidence.",
    "The timing and network tolerance values are explicit design choices to validate during a separately authorized gameplay test.",
  ],
  unresolved: [
    "Native playback, feel, multiplayer latency and HUD visibility require a gameplay test.",
  ],
};
const proposal = proposalDraftSchema.parse(draft);
fs.writeFileSync(
  "docs/results/trial-failure-diagnosis/trial-proposal.json",
  JSON.stringify(
    {
      status: "reviewable_input_not_a_build_or_trial_authorization",
      derivedFrom: original.id,
      proposal,
      selectedClip: {
        assetId: "15008746676",
        versionId: "19600289951",
        key: sequence.key,
        poseDigest: sequence.poseDigest,
      },
      timing,
    },
    null,
    2,
  ) + "\n",
);
