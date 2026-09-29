import { useEffect, useRef, useState } from "react";
import type { Project } from "../generation/schema";
import type { AssetDiscovery } from "../marketplace/discovery";
import { SettingsDialog } from "./SettingsWorkspace";
import "./asset-choices.css";
import { AssetPreviewDialog } from "./AssetPreviewDialog";
import { AssetVotes } from "./AssetVotes";
import {
  MarketplaceConnection,
  useMarketplaceConnection,
} from "./MarketplaceConnection";
import { useAssetThumbnails } from "./useAssetThumbnails";
async function request<T>(url: string, body?: unknown): Promise<T> {
  const r = await fetch("/api/" + url, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await r.json();
  if (!r.ok) throw Error(data.error ?? "Asset request failed.");
  return data;
}
export function AssetChoices({
  project,
  disabled,
  update,
  plan,
  connect,
  offline = false,
  blockedReason,
  searchBlockedReason,
}: {
  project: Project;
  disabled: boolean;
  update: (p: Project) => void;
  plan: (p: Project) => Promise<void>;
  connect: () => void;
  offline?: boolean;
  blockedReason?: string;
  searchBlockedReason?: string;
}) {
  const savedReview =
    project.assetDiscovery?.revision === project.revision
      ? project.assetDiscovery
      : undefined;
  const review =
    project.proposal && savedReview
      ? { ...savedReview, approved: false }
      : savedReview;
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  const connection = useMarketplaceConnection(review?.studioId, offline);
  const { studioId } = connection;
  const [choices, setChoices] = useState<
    NonNullable<AssetDiscovery["choices"]>
  >(() => {
    try {
      return (
        JSON.parse(
          sessionStorage.getItem(
            `takko-asset-choices-${project.id}-${project.revision}`,
          ) ?? "null",
        ) ??
        review?.choices ??
        {}
      );
    } catch {
      return {};
    }
  });
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [active, setActive] = useState("");
  const [groupId, setGroupId] = useState("");
  const visibleGroup =
    review?.groups.find((g) => g.id === groupId) ?? review?.groups[0];
  const thumbnails = useAssetThumbnails(
    visibleGroup?.options.map((a) => a.assetId) ?? [],
  );
  const attempted = useRef(""),
    live = useRef(true),
    lock = useRef(false);
  const approvedBrief =
    !!project.proposal || project.briefApprovedRevision === project.revision;
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  function choose(
    id: string,
    choice: NonNullable<AssetDiscovery["choices"]>[string],
  ) {
    const next = { ...choices, [id]: choice };
    setChoices(next);
    try {
      sessionStorage.setItem(
        `takko-asset-choices-${project.id}-${project.revision}`,
        JSON.stringify(next),
      );
    } catch {
      /* Keep in-memory choices. */
    }
  }
  async function run(
    label: string,
    action: () => Promise<void>,
    manualSearch = false,
  ) {
    if (lock.current || (manualSearch ? !!searchBlockedReason : disabled))
      return;
    lock.current = true;
    setBusy(label);
    setError("");
    try {
      await action();
    } catch (e) {
      if (live.current) setError((e as Error).message);
    } finally {
      lock.current = false;
      if (live.current) setBusy("");
    }
  }
  async function search(groupId?: string, refresh = false, cursor?: string) {
    if (!connection.connected) return;
    await run(
      "Searching Creator Store…",
      async () => {
        const p = await request<Project>(
          `projects/${project.id}/asset-options`,
          {
            revision: project.revision,
            studioId,
            ...(cursor ? { cursor, discoveryId: review!.id } : {}),
            ...(refresh ? { refresh: true } : {}),
            ...(groupId
              ? {
                  groupId,
                  query:
                    (!cursor ? queries[groupId] : undefined) ??
                    review?.groups.find((g) => g.id === groupId)?.query,
                }
              : {}),
          },
        );
        if (live.current) {
          if (refresh || (review && review.studioId !== studioId)) {
            setChoices({});
            sessionStorage.removeItem(
              `takko-asset-choices-${project.id}-${project.revision}`,
            );
          }
          if (groupId && !cursor) choose(groupId, {});
          update(p);
          if (p.proposal) setChoices(p.assetDiscovery?.choices ?? {});
        }
      },
      !!groupId,
    );
  }
  useEffect(() => {
    const key = `${connection.checked}:${studioId}:${project.id}:${project.revision}`;
    if (
      !disabled &&
      !project.clarificationQuestions?.length &&
      connection.connected &&
      savedReview?.recommendationRevision !== project.revision &&
      (!review || (!!project.proposal && !savedReview?.approved)) &&
      attempted.current !== key
    ) {
      attempted.current = key;
      void search();
    }
  }, [
    disabled,
    project.clarificationQuestions?.length,
    studioId,
    !!review,
    project.proposal?.hash,
    !!project.spec,
    connection.connected,
    connection.checked,
  ]);
  const groups = review?.groups ?? [];
  const complete =
    groups.length > 0 &&
    groups.every((g) => {
      const c = choices[g.id];
      return (
        c?.skip ||
        g.options.some(
          (a) =>
            a.assetId === c?.assetId &&
            (g.preview !== "animation" ||
              a.previewData?.pack?.entries.some(
                (e) => e.key === c.clipKey && e.clip,
              )),
        )
      );
    });
  const previewGroup = groups.find((g) =>
    g.options.some((a) => active === g.id + ":" + a.assetId),
  );
  const previewAsset = previewGroup?.options.find(
    (a) => active === previewGroup.id + ":" + a.assetId,
  );
  function preview(
    g: AssetDiscovery["groups"][number],
    assetId: string,
    reload = false,
  ) {
    setActive(g.id + ":" + assetId);
    const a = g.options.find((a) => a.assetId === assetId)!;
    if (!reload && (a.previewData || review?.approved)) return;
    void run("Loading " + a.name + "…", async () => {
      const p = await request<Project>(`projects/${project.id}/asset-preview`, {
        revision: project.revision,
        discoveryId: review!.id,
        groupId: g.id,
        assetId,
      });
      if (live.current) update(p);
    });
  }
  return (
    <section
      className="asset-choices-summary"
      aria-label="Assets for your brief"
      aria-busy={!!busy}
    >
      <div>
        <span className="eyebrow">ASSETS FOR YOUR BRIEF</span>
        <h2>
          {review?.approved
            ? "Asset choices approved"
            : "Find your game’s look and movement"}
        </h2>
      </div>
      <p className="muted">
        {review?.approved
          ? "Your selected references are saved for the build plan."
          : groups.length
            ? `${groups.length} asset groups · preview a few options and choose what fits.`
            : "Takko searches the free Creator Store using your brief. Nothing is inserted yet."}
      </p>
      {busy && <p role="status">{busy}</p>}
      {!open && error && <p role="alert">{error}</p>}

      <div className="actions">
        {review?.approved && (
          <button
            disabled={disabled || !!busy}
            onClick={() =>
              run("Reopening asset choices…", async () => {
                const p = await request<Project>(
                  `projects/${project.id}/reopen-assets`,
                  { revision: project.revision },
                );
                if (live.current) update(p);
              })
            }
          >
            Change asset choices
          </button>
        )}
        <button onClick={() => setOpen(true)}>
          {review?.approved
            ? "Review chosen assets"
            : "Preview & choose assets"}
        </button>
        {review?.approved && !project.spec && (
          <button
            className="primary"
            disabled={disabled || !!busy}
            onClick={() => run("Creating build plan…", () => plan(project))}
          >
            Create build plan
          </button>
        )}
      </div>
      {open && (
        <SettingsDialog
          title="Choose assets"
          scrollBody
          close={() => {
            setOpen(false);
            setActive("");
          }}
        >
          <div className="asset-choices-workspace" aria-busy={!!busy}>
            <p>
              Preview options, choose one per group, or mark it Find later.
              Search results are suggestions. You approve the final references.
            </p>
            {!review?.approved && (
              <MarketplaceConnection
                connection={connection}
                label="Asset search Studio"
                busy={!!busy}
              >
                {!studioId && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      connect();
                    }}
                  >
                    Connect Studio
                  </button>
                )}
                {(!review || review.studioId !== studioId) && (
                  <button
                    disabled={disabled || !!busy || !connection.connected}
                    onClick={() => search(undefined, !!review)}
                  >
                    Find assets
                  </button>
                )}
              </MarketplaceConnection>
            )}
            {disabled && (
              <p role="status">
                {blockedReason ??
                  "Finish the current brief changes before finding assets."}
              </p>
            )}
            {busy && (
              <p role="status" className="asset-loading">
                <span className="spinner" aria-hidden="true" />
                {busy}
              </p>
            )}
            {error && <p role="alert">{error}</p>}
            {!studioId && approvedBrief && !review?.approved && (
              <button
                disabled={disabled || !!busy}
                onClick={() =>
                  run("Deferring asset discovery…", async () => {
                    const p = await request<Project>(
                      `projects/${project.id}/defer-assets`,
                      { revision: project.revision },
                    );
                    if (live.current) {
                      update(p);
                      setOpen(false);
                      if (!project.proposal) await plan(p);
                    }
                  })
                }
              >
                {project.proposal
                  ? "Defer asset recommendations"
                  : "Find assets later & create plan"}
              </button>
            )}
            {!groups.length && !busy && !disabled && connection.connected && (
              <p>
                Choose Find assets to search the Creator Store using your saved
                brief.
              </p>
            )}
            <nav className="asset-group-tabs" aria-label="Asset groups">
              {groups.map((g) => (
                <button
                  key={g.id}
                  aria-label={
                    g.label +
                    (choices[g.id]?.assetId
                      ? " ✓"
                      : choices[g.id]?.skip
                        ? " · Later"
                        : "")
                  }
                  aria-pressed={visibleGroup?.id === g.id}
                  onClick={() => setGroupId(g.id)}
                >
                  {g.query}
                  {choices[g.id]?.assetId
                    ? " ✓"
                    : choices[g.id]?.skip
                      ? " · Later"
                      : ""}
                </button>
              ))}
            </nav>
            {(visibleGroup ? [visibleGroup] : []).map((g) => (
              <section
                className="asset-choice-group"
                key={g.id}
                aria-label={g.label}
              >
                <h3>{g.query}</h3>
                {!review?.approved && (
                  <form
                    className="asset-choice-search control-row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void search(g.id);
                    }}
                  >
                    <input
                      aria-label={`Search for ${g.label}`}
                      value={queries[g.id] ?? g.query}
                      maxLength={200}
                      onChange={(e) =>
                        setQueries((q) => ({ ...q, [g.id]: e.target.value }))
                      }
                    />
                    <button
                      disabled={
                        !!searchBlockedReason ||
                        !!busy ||
                        !connection.connected ||
                        !(queries[g.id] ?? g.query).trim()
                      }
                    >
                      Search again
                    </button>
                  </form>
                )}
                <small className="muted">{g.label}</small>
                {!review?.approved &&
                  (searchBlockedReason || busy || !connection.connected || !(queries[g.id] ?? g.query).trim()) && (
                    <p role="status">
                      {searchBlockedReason ||
                        busy ||
                        connection.error ||
                        (!connection.connected ? "Connect Studio to search the Creator Store." : "Enter search words to find assets.")}
                    </p>
                  )}
                {g.error && <p role="alert">{g.error}</p>}
                {review?.analysisError && (
                  <p role="alert">{review.analysisError}</p>
                )}
                {g.relevance && (
                  <p className="muted">
                    {g.relevance.state === "uncertain"
                      ? "Relevance is uncertain. Preview these options before choosing."
                      : g.relevance.state === "captured_evidence"
                        ? "Jev assessed captured asset evidence. Integration and gameplay are still unverified."
                        : "Jev suggested a match from its listing. Contents and gameplay are still unverified."}
                  </p>
                )}
                {!g.options.length && (
                  <p>No options found. Try another search or Find later.</p>
                )}
                <div className="asset-option-grid">
                  {g.options.map((a) => {
                    const picked = choices[g.id]?.assetId === a.assetId;
                    return (
                      <article
                        className={
                          picked ? "asset-option selected" : "asset-option"
                        }
                        key={a.assetId}
                      >
                        <div className="asset-choice-image">
                          {thumbnails[a.assetId] && (
                            <img
                              className="asset-choice-thumbnail"
                              src={thumbnails[a.assetId]}
                              alt=""
                              loading="lazy"
                            />
                          )}
                        </div>
                        <strong title={a.name}>{a.name}</strong>
                        {g.relevance?.candidateId === a.assetId && (
                          <small>Suggested relevance · preview required</small>
                        )}
                        {picked &&
                          a.previewData?.pack?.entries.some(
                            (entry) =>
                              entry.key === choices[g.id]?.clipKey &&
                              entry.clip &&
                              !entry.animationId,
                          ) && (
                            <small>
                              Editable keyframes selected. Runtime animation
                              playback still needs setup and testing.
                            </small>
                          )}
                        <small>
                          {a.creatorName} · #{a.assetId}
                        </small>
                        <AssetVotes votes={a.votes} />
                        <div className="asset-result-actions">
                          <button
                            disabled={!!busy || (disabled && !a.previewData)}
                            onClick={() => preview(g, a.assetId)}
                          >
                            Preview
                          </button>
                          <button
                            aria-pressed={picked}
                            disabled={disabled || !!busy || !!review?.approved}
                            onClick={() => {
                              if (
                                g.preview === "animation" ||
                                a.inspectionLimitations?.length
                              )
                                preview(g, a.assetId);
                              else
                                choose(
                                  g.id,
                                  picked ? {} : { assetId: a.assetId },
                                );
                            }}
                          >
                            {picked
                              ? review?.approved
                                ? "Approved ✓"
                                : "Selected ✓"
                              : "Select"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
                <div className="asset-page-actions">
                  <small>
                    {g.options.length} loaded · Free · Creator Store relevance
                  </small>
                  {g.nextCursor && (
                    <button
                      disabled={disabled || !!busy || !connection.connected}
                      onClick={() => search(g.id, false, g.nextCursor)}
                    >
                      Load more results
                    </button>
                  )}
                </div>
                <label className="asset-pick">
                  <input
                    type="radio"
                    name={`choice-${g.id}`}
                    checked={!!choices[g.id]?.skip}
                    disabled={disabled || !!busy || !!review?.approved}
                    onChange={() => choose(g.id, { skip: true })}
                  />
                  Find later
                </label>
              </section>
            ))}
            {!review?.approved && (
              <footer className="asset-approval">
                <p className="muted">
                  {!approvedBrief
                    ? "Approve the brief in the conversation before approving these choices."
                    : !complete
                      ? "Choose an asset or Find later in each group."
                      : "Next: inspect the selected assets and create the build plan using your configured planner and budget."}
                </p>
                <button
                  className="primary"
                  disabled={disabled || !!busy || !approvedBrief || !complete}
                  onClick={() =>
                    run("Inspecting selected assets…", async () => {
                      const p = await request<Project>(
                        `projects/${project.id}/approve-assets`,
                        {
                          revision: project.revision,
                          discoveryId: review!.id,
                          choices,
                        },
                      );
                      if (live.current) {
                        update(p);
                        setOpen(false);
                        if (!project.proposal) await plan(p);
                      }
                    })
                  }
                >
                  {project.proposal
                    ? "Save replacements"
                    : "Approve assets & create plan"}
                </button>
              </footer>
            )}
          </div>
        </SettingsDialog>
      )}
      {open && previewAsset && previewGroup && (
        <AssetPreviewDialog
          key={active}
          asset={previewAsset}
          group={previewGroup}
          choice={choices[previewGroup.id]}
          approved={!!review?.approved}
          disabled={disabled}
          busy={!!busy}
          revision={project.revision}
          close={() => setActive("")}
          choose={(choice) => choose(previewGroup.id, choice)}
          reload={() => preview(previewGroup, previewAsset.assetId, true)}
        />
      )}
    </section>
  );
}
