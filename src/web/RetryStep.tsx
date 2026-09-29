import { useEffect, useState } from "react";
import type { Project } from "../generation/schema";
type Quote = {
  step: string;
  estimatedMicros: number;
  completed: number;
  kept?: string;
  kind?: string;
};
export function RetryStep({
  project,
  retry,
  openModels,
}: {
  project: Project;
  retry: () => void;
  openModels: () => void;
}) {
  const [quote, setQuote] = useState<Quote | null>(null);
  const queueState = project.queuedMessages?.map(q => `${q.id}:${q.status}`).join("|");
  useEffect(() => {
    setQuote(null);
    if (!["failed", "interrupted"].includes(project.stage)) return;
    let active = true;
    fetch(`/api/projects/${project.id}/retry-quote`)
      .then((r) => (r.ok ? r.json() : null))
      .then((q) => {
        if (active) setQuote(q);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [project.id, project.revision, project.stage, project.jobId, project.pendingProposalEdit?.id, queueState]);
  if (project.jobId) return null;
  if (
    ["ready_to_test", "verified"].includes(project.stage) &&
    project.artifact &&
    !project.staleImplementation
  )
    return (
      <section className="chat-end-card" aria-label="Ready to test">
        <h2>Ready to test</h2>
        <p>Your build is ready for a Studio playtest.</p>
        {!project.checks.some((c) => c.status === "failed") && (
          <a
            className="button primary"
            href={`/api/projects/${project.id}/export`}
          >
            Export place
          </a>
        )}
        <ul>
          {project.spec?.requirements.slice(0, 3).map((r) => (
            <li key={r.id}>Test: {r.description}</li>
          ))}
        </ul>
        <p className="muted">
          Open the place in Studio, press Play, and check controls, animation,
          sound and the full game loop. Gameplay has not been verified.
        </p>
      </section>
    );
  if (!["failed", "interrupted"].includes(project.stage)) return null;
  const stopped = project.stage === "interrupted";
  const step = quote?.step ?? project.spec?.tasks.find(t => t.id === project.failure?.taskId)?.title ?? project.failure?.phase;
  return (
    <section
      className="chat-end-card"
      aria-label={stopped ? "Stopped" : "Failed"}
    >
      <h2>{stopped ? "Stopped" : "Failed"}</h2>
      {/Output truncated/i.test(project.error ?? "") && <><strong>The model ran out of reply space</strong><p>Your saved brief and asset choices are kept. Adjust the model’s reply limit before retrying.</p><button onClick={openModels}>Open model settings</button></>}
      <p>
        {step
          ? `${stopped ? "Stopped" : "Failed"} at ${step}.`
          : "Work did not finish."}
      </p>
      <p>
        Kept:{" "}
        {quote?.kept ??
          `${project.completedBuildTasks?.length ?? 0} completed tasks, your brief and saved assets`}
        .
      </p>
      {quote?.step && (
        <button onClick={retry}>
          {stopped ? "Continue" : "Retry from this step"} · about $
          {(quote.estimatedMicros / 1e6).toFixed(2)}
        </button>
      )}
      {!quote && <button onClick={openModels}>Open model settings</button>}
      {project.charges.some(c => c.status === "error" && c.billingSource === "reservation") && <p>Unconfirmed calls retain their maximum estimated charge. Continue uses the remaining budget.</p>}
      <p className="muted">
        {quote
          ? "Historical estimate from the last call, not a guaranteed quote. The existing spending cap still applies."
          : "Review the current plan and model settings before continuing."}
        {quote?.kind === "plan"
          ? " Building requires approval after planning."
          : ""}
      </p>
      <details>
        <summary>Technical details</summary>
        <p>{project.error ?? "Stopped at a saved checkpoint."}</p>
        {project.failure && <pre>{project.failure.details}</pre>}
      </details>
    </section>
  );
}
