import { useState } from "react";
import type { Project } from "../generation/schema";
import type { AssetDiscovery } from "../marketplace/discovery";
import { assetRoleEvidence } from "../marketplace/role-evidence";
import type { animationSegments } from "../marketplace/animation-segments";
import { assetRequest } from "./AssetCard";

export function AttackTiming({
  project,
  group,
  update,
  disabled,
}: {
  project: Project;
  group: AssetDiscovery["groups"][number];
  update: (p: Project) => void;
  disabled: boolean;
}) {
  const details = assetRoleEvidence(project, group).details as
    { timing?: ReturnType<typeof animationSegments> } | undefined;
  if (!details?.timing) return null;
  return (
    <TimingEditor
      key={details.timing.key}
      project={project}
      group={group}
      timing={details.timing}
      update={update}
      disabled={disabled}
    />
  );
}
function TimingEditor({
  project,
  group,
  timing,
  update,
  disabled,
}: {
  project: Project;
  group: AssetDiscovery["groups"][number];
  timing: ReturnType<typeof animationSegments>;
  update: (p: Project) => void;
  disabled: boolean;
}) {
  const choice = project.assetDiscovery!.choices![group.id];
  const accepted = choice.timingDecision?.key === timing.key;
  const [segments, setSegments] = useState(
    accepted
      ? choice.timingDecision!.segments
      : timing.segments.map(({ start, hit, end }) => ({ start, hit, end })),
  );
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (!segments.length) return <p>{timing.reason}</p>;
  return (
    <fieldset disabled={disabled || busy}>
      <legend>Attack timing</legend>
      <p>{timing.reason}</p>
      <table>
        <thead>
          <tr>
            <th>Segment</th>
            <th>Evidence</th>
            <th>Start</th>
            <th>Hit</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((s, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>
                {timing.segments[i]?.label} · {timing.segments[i]?.source} ·{" "}
                {timing.segments[i]?.confidence} confidence
              </td>
              {(["start", "hit", "end"] as const).map((field) => (
                <td key={field}>
                  <input
                    aria-label={`Segment ${i + 1} ${field}`}
                    type="number"
                    step="0.001"
                    min="0"
                    value={s[field]}
                    onChange={(e) =>
                      setSegments(
                        segments.map((v, j) =>
                          j === i
                            ? { ...v, [field]: Number(e.target.value) }
                            : v,
                        ),
                      )
                    }
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <p>
        Edits are your timing decisions. Preview the clip before accepting.
        Adjacent segments must meet, and each hit must precede its end.
      </p>
      <button
        onClick={async () => {
          setBusy(true);
          setError("");
          try {
            update(
              await assetRequest<Project>(project.id, "asset-picks/timing", {
                revision: project.revision,
                groupId: group.id,
                assetId: choice.assetId,
                decision: { key: timing.key, segments, source: "user" },
              }),
            );
          } catch (e) {
            setError(String(e));
          } finally {
            setBusy(false);
          }
        }}
      >
        {accepted ? "Save timing adjustments" : "Accept attack timings"}
      </button>
      {accepted && <span> Accepted by you</span>}
      {error && <p role="alert">{error}</p>}
    </fieldset>
  );
}
