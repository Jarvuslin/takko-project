import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Project } from "../generation/schema";
import type { AssetDiscovery } from "../marketplace/discovery";
import { assetLabel, pickStatus } from "../marketplace/pick-status";
import { useAssetThumbnails } from "./useAssetThumbnails";
import { Icon } from "./Icons";
import {
  animationTier,
  studioPublishingLimitation,
} from "../marketplace/animations";
import { useMarketplaceConnection } from "./MarketplaceConnection";

export async function assetRequest<T>(
  projectId: string,
  action: string,
  body: unknown,
): Promise<T> {
  const response = await fetch(`/api/projects/${projectId}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok)
    throw Error(data.error ?? "The asset request failed. Try again.");
  return data;
}
export type PickingGroup = AssetDiscovery["groups"][number];
const AnimationPlayer = lazy(() =>
  import("./AnimationPlayer").then((m) => ({ default: m.AnimationPlayer })),
);
const ModelPreview = lazy(() =>
  import("./AssetModelPreview").then((m) => ({ default: m.AssetModelPreview })),
);
function ChosenGeometry({
  option,
}: {
  option: PickingGroup["options"][number];
}) {
  const [open, setOpen] = useState(false);
  return option.previewData?.model ? (
    <details onToggle={(e) => setOpen(e.currentTarget.open)}>
      <summary>View captured geometry</summary>
      {open && (
        <Suspense fallback={<p>Loading 3D viewer…</p>}>
          <ModelPreview name={option.name} model={option.previewData.model} />
        </Suspense>
      )}
    </details>
  ) : null;
}
export function AssetCard({
  project,
  disabled,
  buildBlocked,
  update,
  choose,
  approve,
  connect,
}: {
  project: Project;
  disabled: boolean;
  buildBlocked?: string;
  update: (p: Project) => void;
  choose: (groupId: string) => void;
  approve: () => Promise<void>;
  connect: () => void;
}) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [quote, setQuote] = useState<{
    groupId: string;
    token: string;
    estimatedMicros: number;
  } | null>(null);
  const [autoSheet, setAutoSheet] = useState<string>();
  const connection = useMarketplaceConnection(project.assetDiscovery?.studioId);
  const live = useRef(project.id);
  live.current = project.id;
  const lock = useRef(false);
  const init = useRef("");
  useEffect(() => {
    if (disabled || init.current === `${project.id}:${project.revision}`)
      return;
    init.current = `${project.id}:${project.revision}`;
    const id = project.id;
    void assetRequest<Project>(id, "asset-picks", {
      revision: project.revision,
    })
      .then((p) => {
        if (live.current === id) update(p);
      })
      .catch((e) => {
        if (live.current === id) setError(e.message);
      });
  }, [project.id, project.revision, disabled]);
  const groups = project.assetDiscovery?.groups ?? [];
  const images = useAssetThumbnails(
    groups.flatMap((g) => {
      const id = project.assetDiscovery?.choices?.[g.id]?.assetId;
      return id ? [id] : [];
    }),
  );
  const missing = groups.filter((g) => !pickStatus(project, g).canBuild);
  async function run(id: string, action: () => Promise<void>) {
    if (lock.current) return;
    lock.current = true;
    setBusy(id);
    setError("");
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      lock.current = false;
      setBusy("");
    }
  }
  return (
    <section
      className="need-card"
      aria-label="Assets for this game"
      aria-busy={!!busy}
    >
      <div className="need-head">
        <h2>Assets for this game</h2>
        <span className="need-count">
          {groups.length - missing.length} of {groups.length} ready
        </span>
      </div>
      <div
        className="need-progress"
        role="progressbar"
        aria-label="Assets ready"
        aria-valuenow={groups.length - missing.length}
        aria-valuemin={0}
        aria-valuemax={groups.length || 1}
      >
        <span
          style={{
            width: `${groups.length ? (100 * (groups.length - missing.length)) / groups.length : 0}%`,
          }}
        />
      </div>
      {groups.map((g) => {
        const c = project.assetDiscovery?.choices?.[g.id],
          o = g.options.find((o) => o.assetId === c?.assetId),
          s = pickStatus(project, g);
        const pending =
          busy === `finding:${g.id}`
            ? "finding"
            : busy === g.id
              ? "checking"
              : s.state;
        return (
          <section className="need-row" key={g.id} aria-label={assetLabel(g)}>
            <div className="need-row-top">
              <div>
                <strong>{assetLabel(g)}</strong>
                <p className="need-purpose">{g.label}</p>
              </div>
              <span className={`pick-pill pick-${pending}`}>
                <Icon
                  name={
                    pending === "ready"
                      ? "check"
                      : pending === "problem"
                        ? "close"
                        : pending === "warning"
                          ? "warning"
                          : pending === "empty"
                            ? "circle"
                            : "clock"
                  }
                  size={14}
                />
                {pending === "finding"
                  ? "Finding a match"
                  : pending === "checking"
                    ? "Checking"
                    : s.label}
              </span>
            </div>
            {o && (
              <div className="chosen-asset">
                {images[o.assetId] ? (
                  <img
                    src={images[o.assetId]}
                    alt=""
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Icon name="cube" size={24} />
                )}
                <div>
                  <strong>{o.name}</strong>
                  <small>
                    {o.creatorName} · #{o.assetId}
                    {c?.clipKey ? ` · ${c.clipKey}` : ""}
                  </small>
                </div>
              </div>
            )}
            {s.reason && (
              <p
                className={`pick-note pick-${s.state}`}
                role={s.state === "problem" ? "alert" : "status"}
              >
                {s.reason}
              </p>
            )}
            {o && <ChosenGeometry key={o.assetId} option={o} />}
            <div className="need-actions">
              {s.state === "warning" && o && (
                <button
                  disabled={disabled || !!busy}
                  onClick={() =>
                    run(g.id, async () =>
                      update(
                        await assetRequest<Project>(
                          project.id,
                          "asset-picks/choose",
                          {
                            revision: project.revision,
                            groupId: g.id,
                            assetId: o.assetId,
                            studioId: connection.studioId,
                            keep: true,
                          },
                        ),
                      ),
                    )
                  }
                >
                  Keep it
                </button>
              )}
              <button
                disabled={disabled || !!busy}
                onClick={() => choose(g.id)}
              >
                {s.state === "warning"
                  ? "Choose another"
                  : o
                    ? "Change"
                    : "Choose asset"}
              </button>
              {s.state !== "warning" && (
                <button
                  disabled={disabled || !!busy}
                  onClick={() =>
                    run("estimate", async () => {
                      const q = await assetRequest<{
                        project: Project;
                        token: string;
                        estimatedMicros: number;
                      }>(project.id, "asset-picks/estimate", {
                        revision: project.revision,
                        groupId: g.id,
                        studioId: connection.studioId,
                      });
                      update(q.project);
                      setQuote({ ...q, groupId: g.id });
                    })
                  }
                >
                  Choose for me
                </button>
              )}
              {s.state === "problem" && /Studio/.test(s.reason ?? "") && (
                <button onClick={connect}>Connect Studio</button>
              )}
              {g.preview === "animation" &&
                o?.previewData?.pack &&
                !c?.clipKey && (
                  <button onClick={() => setAutoSheet(g.id)}>
                    Choose clip
                  </button>
                )}
            </div>
            {quote?.groupId === g.id && (
              <div className="pick-estimate">
                <p>
                  Estimated maximum ${(quote.estimatedMicros / 1e6).toFixed(4)}.
                  Counts against this project's cap.
                </p>
                <button
                  disabled={disabled || !!busy}
                  onClick={() =>
                    run(`finding:${g.id}`, async () => {
                      setQuote(null);
                      const p = await assetRequest<Project>(
                        project.id,
                        "asset-picks/auto",
                        { revision: project.revision, token: quote.token },
                      );
                      update(p);
                      if (g.preview === "animation") setAutoSheet(g.id);
                    })
                  }
                >
                  Choose for me · ${(quote.estimatedMicros / 1e6).toFixed(4)}
                </button>
                <button onClick={() => setQuote(null)}>Cancel</button>
              </div>
            )}
          </section>
        );
      })}
      {error && (
        <p className="pick-note pick-problem" role="alert">
          {error}
        </p>
      )}
      <div className="need-foot">
        <button
          className="primary"
          disabled={
            disabled ||
            !!busy ||
            !groups.length ||
            !!missing.length ||
            !!buildBlocked
          }
          onClick={() => run("approve", approve)}
        >
          Approve &amp; build
        </button>
        {(missing.length > 0 || buildBlocked) && (
          <p>
            {buildBlocked ??
              `Choose or review: ${missing.map(assetLabel).join(", ")}.`}
          </p>
        )}
      </div>
      {autoSheet && (
        <ClipSheet
          project={project}
          groupId={autoSheet}
          update={update}
          close={() => setAutoSheet(undefined)}
        />
      )}
    </section>
  );
}

export function ClipSheet({
  project,
  groupId,
  update,
  close,
}: {
  project: Project;
  groupId: string;
  update: (p: Project) => void;
  close: () => void;
}) {
  const g = project.assetDiscovery?.groups.find((g) => g.id === groupId),
    c = project.assetDiscovery?.choices?.[groupId],
    o = g?.options.find((o) => o.assetId === c?.assetId);
  const [selected, setSelected] = useState(c?.clipKey ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sheet = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    sheet.current?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  if (!o?.previewData?.pack) return null;
  const entry =
    o.previewData.pack.entries.find((e) => e.key === selected) ??
    o.previewData.pack.entries.find((e) => e.clip);
  return (
    <div
      className="clip-sheet"
      role="dialog"
      aria-label={`Clips from ${o.name}`}
      tabIndex={-1}
      ref={sheet}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          close();
        }
      }}
    >
      <h4>
        {o.name} has {o.previewData.pack.entries.length} clips
      </h4>
      <p>
        Pick the one that plays when the player{" "}
        {g?.query.toLowerCase().includes("punch")
          ? "punches"
          : "uses this animation"}
        .
      </p>
      <div className="clip-options">
        {o.previewData.pack.entries.map((e) => (
          <button
            key={e.key}
            disabled={!e.clip || busy}
            aria-pressed={selected === e.key}
            onClick={() => setSelected(e.key)}
          >
            <Icon name="play" size={16} />
            <span>
              {e.name}
              <small>
                {e.clip
                  ? `${e.clip.duration.toFixed(2)} s · ${e.clip.rig}`
                  : "No playable clip captured"}
              </small>
            </span>
          </button>
        ))}
      </div>
      {entry?.clip && (
        <Suspense fallback={<p>Loading 3D viewer…</p>}>
          <AnimationPlayer
            animation={{
              id: entry.key,
              clip: entry.clip,
              revision: project.revision,
              at: "",
              source: "user-import",
            }}
            provenance={`Roblox asset #${entry.animationId ?? o.assetId}`}
          />
        </Suspense>
      )}
      {entry && animationTier(entry) === "studio_only" && (
        <p role="status">{studioPublishingLimitation}</p>
      )}
      {error && <p role="alert">{error}</p>}
      <div className="need-actions">
        <button
          className="primary"
          disabled={!selected || busy}
          onClick={async () => {
            setBusy(true);
            try {
              update(
                await assetRequest<Project>(project.id, "asset-picks/clip", {
                  revision: project.revision,
                  groupId,
                  assetId: o.assetId,
                  clipKey: selected,
                }),
              );
              close();
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Use this clip
        </button>
        <button onClick={close}>Cancel</button>
      </div>
    </div>
  );
}
