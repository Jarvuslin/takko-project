import { useEffect, useState } from "react";
import { QuestionModal } from "./QuestionModal";
import type { Project } from "../generation/schema";
export function Proposal({
  project,
  disabled,
  approve,
  discard,
  saveAnswers,
}: {
  project: Project;
  disabled: boolean;
  approve: () => Promise<void>;
  discard: () => void;
  saveAnswers: (answers: Record<string, string>) => Promise<void>;
}) {
  const proposal = project.proposal!;
  const questions = project.clarificationQuestions ?? [];
  const signature = questions.map((q) => q.id).join(",");
  const [open, setOpen] = useState(questions.length > 0);
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState("");
  const missingAssets =
    project.assetDiscovery?.groups.filter(
      (group) =>
        !project.assetDiscovery?.choices?.[group.id]?.assetId &&
        !project.assetDiscovery?.choices?.[group.id]?.skip,
    ) ?? [];
  useEffect(() => {
    if (signature) setOpen(true);
  }, [project.id, signature]);
  return (
    <section className="generation-card" aria-label="Game proposal">
      <h2>{proposal.title}</h2>
      {!!questions.length && (
        <button onClick={() => setOpen(true)}>
          {questions.length} questions need answers
        </button>
      )}
      <QuestionModal
        key={project.id}
        questions={questions}
        open={open}
        close={() => setOpen(false)}
        disabled={disabled}
        save={saveAnswers}
      />
      <p className="muted">
        {project.jobId
          ? "Working · saved proposal remains available"
          : proposal.approval
            ? "Proposal approved"
            : "Saved proposal"}{" "}
        · revision {proposal.revision}
      </p>
      {project.world && (
        <p>
          World:{" "}
          {project.world.kind === "baseplate_template"
            ? "Baseplate template"
            : project.world.kind === "none"
              ? "No baseplate"
              : "Custom world"}
          . {project.world.question}
        </p>
      )}
      {(["mechanics", "theme", "environment"] as const).map((id) => (
        <section key={id}>
          <h3>
            {id === "environment"
              ? "Environment & layout"
              : id[0].toUpperCase() + id.slice(1)}
          </h3>
          <p style={{ whiteSpace: "pre-wrap" }}>{proposal[id].text}</p>
          {!!proposal[id].assumptions.length && (
            <p className="muted">
              Assumptions: {proposal[id].assumptions.join(" ")}
            </p>
          )}
          {!!proposal[id].unresolved.length && (
            <p role="status">Unresolved: {proposal[id].unresolved.join(" ")}</p>
          )}
        </section>
      ))}
      <h3>Marketplace assets</h3>
      {project.assetDiscovery?.groups.map((g) => {
        const choice = project.assetDiscovery?.choices?.[g.id];
        const asset = g.options.find((a) => a.assetId === choice?.assetId);
        return (
          <p key={g.id}>
            <strong>{g.label}:</strong>{" "}
            {asset
              ? `${asset.name} #${asset.assetId}${choice?.clipKey ? ` · clip ${choice.clipKey}` : ""}`
              : g.preview === "animation"
                ? "Unselected · preview and choose a clip below"
                : "Unselected · choose an asset below"}
            {project.assetDiscovery?.pinned?.includes(g.id)
              ? " · your pinned choice"
              : ""}
          </p>
        );
      }) ?? (
        <p>
          Connect Marketplace to retrieve recommendations. Your game proposal
          stays editable.
        </p>
      )}
      {project.assetAttachments
        ?.filter((a) => a.inspectionLimitations?.length)
        .map((a) => (
          <p role="status" key={a.assetId}>
            Acknowledged inspection coverage limitation for {a.name}:{" "}
            {a.inspectionLimitations!.join(" ")}
          </p>
        ))}
      <p className="muted">
        Recommendations use inspected content. Playback, permissions and
        gameplay still need Studio testing. Preview or replace assets below.
      </p>
      {proposal.summary && <p>{proposal.summary}</p>}
      {project.pendingProposalEdit && (
        <div role="status">
          <p>Pending edit: {project.pendingProposalEdit.text}</p>
          <button disabled={disabled} onClick={discard}>
            Discard pending edit
          </button>
        </div>
      )}
      {project.staleImplementation && (
        <p>
          Previous files are retained. They do not implement this revised
          proposal yet.
        </p>
      )}
      {missingAssets.length > 0 && (
        <p role="status">
          Before building, choose an asset or Find later for:{" "}
          {missingAssets.map((group) => group.label).join(", ")}. Open Preview
          &amp; choose assets below.
        </p>
      )}
      {project.assetDiscovery?.analysisError && (
        <p role="alert">{project.assetDiscovery.analysisError}</p>
      )}
      {approvalError && (
        <p role="alert">Build did not start: {approvalError}</p>
      )}
      {project.jobId && (
        <p role="status">
          Work is still running. Approval is unavailable until it finishes.
        </p>
      )}
      <button
        className="primary"
        disabled={disabled || approving || !!project.pendingProposalEdit}
        onClick={async () => {
          if (questions.length) {
            setOpen(true);
            return;
          }
          setApproving(true);
          setApprovalError("");
          try {
            await approve();
          } catch (error) {
            setApprovalError((error as Error).message);
          } finally {
            setApproving(false);
          }
        }}
      >
        {questions.length
          ? `Answer ${questions.length} questions first`
          : approving
            ? "Checking build approval…"
            : "Approve & build"}
      </button>
    </section>
  );
}
