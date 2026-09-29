import { useEffect, useState } from "react";
import type { Project } from "../generation/schema";
import { settingsApi } from "./SettingsWorkspace";
type Studio = {
  id: string;
  name: string;
  protocolVersion?: number;
  capabilities?: string[];
  operation?: { state: string } | null;
};
type Receipt = {
  id: string;
  studioId: string;
  revision: number;
  kind: "apply" | "test";
  state: string;
  ok: boolean | null;
  reason?: string;
  checks: { id: string; status: string; detail: string }[];
  logs: string[];
};
export function StudioConversation({
  project,
  studios,
  openSetup,
  refresh,
}: {
  project: Project;
  studios: Studio[];
  openSetup: () => void;
  refresh: () => Promise<void>;
}) {
  const [receipts, setReceipts] = useState<Receipt[]>([]),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true,
      timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const next = await settingsApi<Receipt[]>(
          `/projects/${project.id}/studio-operations`,
        );
        if (!Array.isArray(next))
          throw Error(
            "Studio history could not be read. Your conversation is still available.",
          );
        if (active) {
          setReceipts(next);
          setError("");
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) timer = setTimeout(poll, 2000);
      }
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [project.id]);
  const ready =
    !!project.artifact &&
    !project.jobId &&
    ["ready_to_test", "verified"].includes(project.stage) &&
    !project.checks.some((c) => c.status === "failed");
  return (
    <section
      className="studio-conversation"
      aria-label="Studio in conversation"
    >
      {project.artifact?.coverage.some((c) => c.status === "blocked") && (
        <aside role="status" aria-label="Unmet requirements">
          <strong>Build has unmet requirements</strong>
          <p>
            Available code can be tested. These required features are still
            blocked.
          </p>
          <ul>
            {project.artifact.coverage
              .filter((c) => c.status === "blocked")
              .map((c) => (
                <li key={c.requirementId}>
                  {project.spec?.requirements.find(
                    (r) => r.id === c.requirementId,
                  )?.description ?? c.requirementId}
                  : {c.detail}
                </li>
              ))}
          </ul>
        </aside>
      )}
      {receipts.map((receipt) => (
        <article className="conversation-turn" key={receipt.id}>
          <details
            className="run-activity"
            open={receipt.state === "unknown" || receipt.ok === false}
          >
            <summary>
              {receipt.kind === "apply" ? "Apply to Studio" : "Studio playtest"}{" "}
              ·{" "}
              {receipt.state === "done"
                ? receipt.ok
                  ? "checks returned"
                  : "failed"
                : receipt.state}{" "}
              · revision {receipt.revision}
            </summary>
            {receipt.reason && <p>{receipt.reason}</p>}
            {receipt.checks.map((c, i) => (
              <p key={i}>
                {c.status}: {c.detail}
              </p>
            ))}
            {receipt.logs.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
            {receipt.state === "queued" && (
              <button
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await settingsApi(
                      `/studio/${receipt.studioId}/operations/${receipt.id}/cancel`,
                      "POST",
                      {},
                    );
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Cancel queued operation
              </button>
            )}
            {receipt.state === "unknown" && (
              <p>
                Inspect Studio before continuing. This command will not be
                replayed automatically.
              </p>
            )}
          </details>
        </article>
      ))}
      {project.artifact && (
        <div className="inline-studio-actions">
          {!studios.length ? (
            <>
              <span className="muted">
                Connect Studio to apply and test. Chat remains available.
              </span>
              <button onClick={openSetup}>Connect Studio</button>
            </>
          ) : (
            studios.map((studio) => (
              <div key={studio.id}>
                <small>{studio.name}</small>
                <div className="inline-studio-actions">
                  {(["apply", "test"] as const).map((kind) => (
                    <button
                      key={kind}
                      disabled={
                        !ready ||
                        busy ||
                        studio.protocolVersion !== 2 ||
                        !studio.capabilities?.includes(kind) ||
                        ["queued", "dispatched", "unknown"].includes(
                          studio.operation?.state ?? "",
                        )
                      }
                      onClick={async () => {
                        setBusy(true);
                        setError("");
                        try {
                          await settingsApi(
                            `/projects/${project.id}/studio`,
                            "POST",
                            { studioId: studio.id, kind },
                          );
                          setReceipts(
                            await settingsApi(
                              `/projects/${project.id}/studio-operations`,
                            ),
                          );
                          await refresh();
                        } catch (e) {
                          setError((e as Error).message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {kind === "apply" ? "Apply to Studio" : "Run playtest"}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
          <button onClick={openSetup}>
            Attach screenshot or review details
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
