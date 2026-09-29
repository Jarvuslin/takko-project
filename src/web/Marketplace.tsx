import {
  MarketplaceConnection,
  useMarketplaceConnection,
} from "./MarketplaceConnection";
import { AssetVotes } from "./AssetVotes";
import { useAssetThumbnails } from "./useAssetThumbnails";
import { useEffect, useRef, useState, type DragEvent } from "react";
import type {
  AssetAttachment,
  LibraryAsset,
  MarketplaceKind,
} from "../marketplace/types";
import { parseAssetReference } from "../marketplace/types";
import { Icon } from "./Icons";
import { SettingsDialog } from "./SettingsWorkspace";

async function request<T>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch("/api/marketplace/" + url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error ?? "Asset request failed.");
  return result;
}
export function useAssetAttachments(
  context: string,
  initial: AssetAttachment[] | undefined,
  disabled: boolean,
  previewAnimations?: (asset: LibraryAsset, studioId: string) => Promise<void>,
) {
  const [attachments, setAttachments] = useState<AssetAttachment[]>(
    initial ?? [],
  );
  const [studioId, setStudioId] = useState(
    () => localStorage.getItem("takko-marketplace-studio") ?? "",
  );
  const [inspecting, setInspecting] = useState(false),
    [message, setMessage] = useState("");
  const [report, setReport] = useState<LibraryAsset | null>(null);
  const contextRef = useRef(context),
    lock = useRef(false);
  contextRef.current = context;
  useEffect(() => {
    setAttachments(initial ?? []);
    setMessage("");
    setReport(null);
  }, [context]);
  function chooseStudio(id: string) {
    setStudioId(id);
    localStorage.setItem("takko-marketplace-studio", id);
  }
  async function add(reference: string) {
    if (disabled || lock.current) return;
    const current = context;
    try {
      const id = parseAssetReference(reference);
      if (!studioId)
        throw Error(
          "Open Marketplace and select your Studio before attaching an asset.",
        );
      const alreadyAttached = attachments.some((a) => a.assetId === id);
      if (alreadyAttached && !previewAnimations)
        throw Error("This asset is already attached.");
      if (attachments.length >= 8 && !alreadyAttached)
        throw Error("Attach up to eight assets per project.");
      lock.current = true;
      setInspecting(true);
      setMessage("Checking the asset and its cached inspection…");
      setReport(null);
      const result = await request<{ asset: LibraryAsset; cacheHit: boolean }>(
        "inspect",
        "POST",
        { studioId, reference: id },
      );
      if (contextRef.current !== current) return;
      const a = result.asset,
        i = a.inspection;
      setReport(a);
      let previewError = "";
      if (previewAnimations && ["Model", "Animation"].includes(a.kind)) {
        setMessage("Loading this asset’s animations into chat…");
        try {
          await previewAnimations(a, studioId);
        } catch (error) {
          previewError = " Animation preview: " + (error as Error).message;
        }
        if (contextRef.current !== current) return;
      }
      if (i?.status === "limited") {
        setMessage(
          "Inspection coverage is incomplete. Preview and acknowledge the limitation in the project's asset choices before attaching." +
            previewError,
        );
        return;
      }
      if (!i || i.status !== "no_issues_found") {
        setMessage(
          "Asset needs review and was not attached. Findings are shown below." +
            previewError,
        );
        return;
      }
      if (!alreadyAttached)
        setAttachments((old) => [
          ...old,
          {
            assetId: a.assetId,
            name: a.name,
            kind: a.kind,
            creatorName: a.creatorName,
            contentHash: i.contentHash,
            revisionKey: a.versionId
              ? "version:" + a.versionId
              : a.updated
                ? "updated:" + a.updated
                : "",
            inspectedAt: i.inspectedAt,
            scannerVersion: i.scannerVersion,
            scriptCount: i.scriptCount,
            usage: "",
          },
        ]);
      setMessage(
        (result.cacheHit
          ? "Attached using the cached inspection."
          : "Inspected and attached. No issues found by static checks.") +
          previewError,
      );
    } catch (error) {
      if (contextRef.current === current) setMessage((error as Error).message);
    } finally {
      lock.current = false;
      setInspecting(false);
    }
  }
  function drop(event: DragEvent) {
    event.preventDefault();
    const value =
      event.dataTransfer.getData("application/x-takko-asset") ||
      event.dataTransfer
        .getData("text/uri-list")
        .split(/\r?\n/)
        .find((s) => s && !s.startsWith("#")) ||
      event.dataTransfer.getData("text/plain");
    if (value) void add(value);
  }
  return {
    attachments,
    setAttachments,
    studioId,
    chooseStudio,
    inspecting,
    message,
    report,
    add,
    drop,
  };
}
export type AssetDraft = ReturnType<typeof useAssetAttachments>;

export function AssetAttachments({
  draft,
  disabled,
}: {
  draft: AssetDraft;
  disabled: boolean;
}) {
  return (
    <div
      className="asset-attachments"
      role="group"
      aria-label="Attached assets"
    >
      {!!draft.attachments.length && (
        <p className="muted">
          Selected assets · tell the AI what to keep or change
        </p>
      )}
      {draft.attachments.map((asset) => (
        <div className="asset-attachment" key={asset.assetId}>
          <div>
            <strong>{asset.name}</strong>
            <small>#{asset.assetId} · inspected</small>
          </div>
          <button
            type="button"
            aria-label={"Remove " + asset.name}
            disabled={disabled}
            onClick={() =>
              draft.setAttachments((items) =>
                items.filter((a) => a.assetId !== asset.assetId),
              )
            }
          >
            <Icon name="close" size={16} />
          </button>
          <input
            aria-label={"Use for " + asset.name}
            placeholder="Use for… preserve its animations, change its controls…"
            maxLength={500}
            value={asset.usage}
            disabled={disabled}
            onChange={(e) =>
              draft.setAttachments((items) =>
                items.map((a) =>
                  a.assetId === asset.assetId
                    ? { ...a, usage: e.target.value }
                    : a,
                ),
              )
            }
          />
        </div>
      ))}
      {!!draft.message && (
        <p role="status" className="asset-status">
          {draft.message}
        </p>
      )}
      {!!draft.report?.inspection?.findings.length && (
        <details className="asset-findings" open>
          <summary>Inspection findings · {draft.report.name}</summary>
          <ul>
            {draft.report.inspection.findings.map((f, i) => (
              <li key={i}>
                {f.message}
                {f.script && <small>{f.script}</small>}
              </li>
            ))}
          </ul>
        </details>
      )}
      {draft.report?.inspection?.limitations?.map((limitation, i) => (
        <p className="asset-status" key={i}>
          {limitation}
        </p>
      ))}
    </div>
  );
}

export function Marketplace({
  draft,
  close,
  disabled,
}: {
  draft: AssetDraft;
  close: () => void;
  disabled: boolean;
}) {
  const [assets, setAssets] = useState<LibraryAsset[]>([]);
  const connection = useMarketplaceConnection(draft.studioId);
  useEffect(() => {
    if (
      connection.state !== "checking" &&
      draft.studioId !== connection.studioId
    )
      draft.chooseStudio(connection.studioId);
  }, [connection.studioId, connection.state]);
  const [query, setQuery] = useState(""),
    [kind, setKind] = useState<MarketplaceKind>("Model");
  const [tab, setTab] = useState("search"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const images = useAssetThumbnails(assets.map((a) => a.assetId));
  const [nextCursor, setNextCursor] = useState<string>();
  const searched = useRef({ query: "", kind: "Model" as MarketplaceKind });
  const sequence = useRef(0);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panel.current?.querySelector<HTMLInputElement>("#asset-search")?.focus();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  useEffect(
    () => () => {
      sequence.current++;
    },
    [],
  );
  useEffect(() => {
    if (draft.report)
      setAssets((items) =>
        items.map((a) =>
          a.assetId === draft.report!.assetId ? draft.report! : a,
        ),
      );
  }, [draft.report]);
  async function load(
    nextTab: string,
    searchQuery = query,
    searchKind = kind,
    cursor?: string,
  ) {
    const current = ++sequence.current;
    setTab(nextTab);
    setBusy(true);
    setError("");
    try {
      if (
        nextTab === "search" &&
        (!searchQuery.trim() || !connection.connected)
      ) {
        setAssets([]);
        return;
      }
      const result =
        nextTab === "search"
          ? await request<{ assets: LibraryAsset[]; nextCursor?: string }>(
              "search",
              "POST",
              {
                studioId: draft.studioId,
                query: searchQuery,
                kind: searchKind,
                ...(cursor ? { cursor } : {}),
              },
            )
          : await request<{ assets: LibraryAsset[] }>(
              "library?filter=" + nextTab,
            );
      if (sequence.current === current) {
        setAssets((old) =>
          cursor
            ? [
                ...old,
                ...result.assets.filter(
                  (a) => !old.some((o) => o.assetId === a.assetId),
                ),
              ]
            : result.assets,
        );
        setNextCursor(
          "nextCursor" in result && typeof result.nextCursor === "string"
            ? result.nextCursor
            : undefined,
        );
        searched.current = { query: searchQuery, kind: searchKind };
      }
    } catch (e) {
      if (sequence.current === current) setError((e as Error).message);
    } finally {
      if (sequence.current === current) setBusy(false);
    }
  }
  async function preference(asset: LibraryAsset, field: "liked" | "saved") {
    try {
      const updated = await request<LibraryAsset>(
        "library/" + asset.assetId,
        "PATCH",
        { [field]: !asset[field] },
      );
      setAssets((items) =>
        items
          .map((a) => (a.assetId === asset.assetId ? updated : a))
          .filter((a) => tab !== field || a[field]),
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <SettingsDialog
      title="Marketplace"
      description="Discover free Roblox assets for your next idea."
      close={close}
      closeLabel="Close Marketplace"
      modal={false}
      scrollBody
    >
      <aside
        ref={panel}
        className="marketplace-panel"
        aria-label="Marketplace"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            close();
          }
        }}
      >
        <MarketplaceConnection
          connection={connection}
          label="Marketplace Studio"
          busy={busy}
        />
        <div className="market-tabs" aria-label="Asset collections">
          {[
            ["search", "Search"],
            ["all", "Library"],
            ["liked", "Liked"],
            ["saved", "Saved"],
          ].map(([value, label]) => (
            <button
              type="button"
              key={value}
              aria-pressed={tab === value}
              onClick={() => load(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "search" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void load("search");
            }}
          >
            <label className="sr-only" htmlFor="asset-search">
              Search Marketplace
            </label>
            <input
              id="asset-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search models, animations, sound effects…"
              maxLength={200}
            />
            <div className="market-search-controls control-row">
              <select
                aria-label="Asset type"
                value={kind}
                onChange={(e) => setKind(e.target.value as MarketplaceKind)}
              >
                {["Model", "Animation", "MeshPart", "Audio", "Image"].map(
                  (k) => (
                    <option key={k}>{k}</option>
                  ),
                )}
              </select>
              <button disabled={busy || !connection.connected || !query.trim()}>
                Search assets
              </button>
            </div>
          </form>
        )}
        {tab === "search" && (
          <div className="market-categories" aria-label="Asset categories">
            {(
              [
                ["Models", "Model", "training dummy", "cube"],
                ["Animations", "Animation", "combat", "play"],
                ["Sound effects", "Audio", "punch impact", "bolt"],
                ["Visual effects", "Model", "impact VFX", "grid"],
                ["Environments", "Model", "training arena", "models"],
              ] as const
            ).map(([label, type, term, icon]) => (
              <button
                key={label}
                disabled={!connection.connected || busy}
                onClick={() => {
                  setKind(type);
                  setQuery(term);
                  void load("search", term, type);
                }}
              >
                <Icon name={icon} size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        {busy && (
          <p role="status" className="asset-loading">
            <span className="spinner" aria-hidden="true" />
            Loading assets…
          </p>
        )}
        {!!assets.length && (
          <div className="market-results-heading">
            <h3>
              {tab === "search"
                ? "Search results"
                : tab === "all"
                  ? "Your library"
                  : tab === "liked"
                    ? "Liked assets"
                    : "Saved assets"}
            </h3>
            <span>
              {assets.length} {assets.length === 1 ? "asset" : "assets"}
              {tab === "search" ? " · Free" : ""}
            </span>
          </div>
        )}
        {!busy && !assets.length && (
          <p className="market-empty">
            {tab === "search"
              ? "Search free Roblox assets to get started."
              : "No assets in this collection yet."}
          </p>
        )}
        <div className="market-grid">
          {assets.map((asset) => (
            <article
              className="market-card"
              key={asset.assetId}
              draggable={!disabled && !draft.inspecting}
              onDragStart={(e) => {
                e.dataTransfer.setData(
                  "application/x-takko-asset",
                  asset.assetId,
                );
                e.dataTransfer.setData(
                  "text/plain",
                  "https://create.roblox.com/store/asset/" + asset.assetId,
                );
                e.dataTransfer.effectAllowed = "copy";
              }}
            >
              <div className="market-thumbnail">
                {images[asset.assetId] ? (
                  <img
                    src={images[asset.assetId]}
                    alt={asset.name}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Icon name="cube" size={36} />
                )}
              </div>
              <a
                href={"https://create.roblox.com/store/asset/" + asset.assetId}
                target="_blank"
                rel="noreferrer"
              >
                {asset.name}
              </a>
              <small>
                {asset.creatorName} · {asset.kind}
              </small>
              <AssetVotes votes={asset.votes} />
              <small>#{asset.assetId}</small>
              <span className="inspection-label">
                {!asset.inspection
                  ? "Not inspected"
                  : asset.inspection.status === "no_issues_found"
                    ? "Inspected snapshot"
                    : asset.inspection.status === "limited"
                      ? "Inspection coverage incomplete"
                      : asset.inspection.status === "blocked"
                        ? "Blocked by inspection"
                        : "Needs review"}
              </span>
              <div className="market-card-actions">
                <button
                  type="button"
                  aria-label={"Like " + asset.name}
                  aria-pressed={asset.liked}
                  onClick={() => preference(asset, "liked")}
                >
                  <Icon name="heart" size={16} />
                </button>
                <button
                  type="button"
                  aria-label={"Save " + asset.name}
                  aria-pressed={asset.saved}
                  onClick={() => preference(asset, "saved")}
                >
                  <Icon name="bookmark" size={16} />
                  <span className="sr-only">Save</span>
                </button>
                <button
                  type="button"
                  disabled={disabled || draft.inspecting}
                  onClick={() => draft.add(asset.assetId)}
                >
                  <Icon name="plus" size={16} /> Add
                </button>
              </div>
            </article>
          ))}
        </div>
        {tab === "search" && nextCursor && (
          <button
            disabled={busy}
            onClick={() =>
              load(
                "search",
                searched.current.query,
                searched.current.kind,
                nextCursor,
              )
            }
          >
            Load more results
          </button>
        )}
        <p className="market-notice">
          Add an asset to inspect it and attach it to your brief. Models with
          animation clips open a preview in your conversation. Static inspection
          does not verify gameplay or media permissions.
        </p>
      </aside>
    </SettingsDialog>
  );
}
