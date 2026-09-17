import { useState } from "react";
import type { Project } from "../generation/schema";

export function AssetExecution({
  project,
  onChange,
}: {
  project: Project;
  onChange: (p: Project) => void;
}) {
  const [studios, setStudios] = useState<{ id: string; name: string }[]>([]);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const run = project.assetPipeline;
  async function discover() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/asset-studios");
      const body = await response.json();
      if (!response.ok) throw Error(body.error);
      const data = body.studios
        ? body
        : JSON.parse(
            body.content?.find((c: { type: string }) => c.type === "text")
              ?.text ?? "{}",
          );
      if (!Array.isArray(data.studios))
        throw Error("Invalid Studio discovery response");
      setStudios(data.studios);
      if (!data.studios.length)
        setMessage(
          "No Studio is connected. Enable Studio as MCP server in Roblox Studio, then refresh.",
        );
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Studio unavailable");
    } finally {
      setBusy(false);
    }
  }
  async function select(studioId: string) {
    if (!studioId) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/projects/${project.id}/asset-studio`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revision: project.revision, studioId }),
      });
      const body = await response.json();
      if (!response.ok) throw Error(body.error);
      onChange(body);
      setMessage("Asset execution will use the selected Studio.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not select Studio");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="panel" aria-label="Asset execution">
      <h3>Assets</h3>
      <p className="muted">
        Takko searches, inspects and verifies required assets during generation.
        Failed verification stops that requirement; automatic external rescue is
        disabled.
      </p>
      <button
        type="button"
        onClick={discover}
        disabled={busy || !!project.jobId}
      >
        Find Studio for assets
      </button>
      {!!studios.length && (
        <label>
          Asset test place{" "}
          <select
            aria-label="Asset test place"
            value={project.assetStudioId ?? ""}
            onChange={(e) => select(e.target.value)}
            disabled={busy || !!project.jobId}
          >
            <option value="">Select a place</option>
            {studios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      )}
      {project.assetStudioId && (
        <p className="muted">Studio selected for this project.</p>
      )}
      {!!message && <p role="status">{message}</p>}
      {!!project.spec?.assetNeeds?.length && (
        <ul>
          {project.spec.assetNeeds.map((n) => (
            <li key={n.id}>
              {n.role} · {n.kind}
            </li>
          ))}
        </ul>
      )}
      {run && (
        <>
          <p>
            <strong>Asset run: {run.status.replaceAll("_", " ")}</strong>
          </p>
          {run.error && <p role="alert">{run.error}</p>}
          <ul>
            {run.entries.map((e) => (
              <li key={e.needId}>
                {e.needId}: {e.status.replaceAll("_", " ")} · {e.attempts}{" "}
                attempts{e.reason ? " — " + e.reason : ""}
              </li>
            ))}
          </ul>
          <details>
            <summary>Asset execution history</summary>
            <ol>
              {run.events.map((e, i) => (
                <li key={i}>
                  {e.at} · {e.needId} · {e.step}
                  <pre>{JSON.stringify(e.data, null, 2)}</pre>
                </li>
              ))}
            </ol>
          </details>
        </>
      )}
    </section>
  );
}
