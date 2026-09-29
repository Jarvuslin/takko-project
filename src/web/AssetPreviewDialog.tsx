import { lazy, Suspense, useState } from "react";
import type { AssetDiscovery, AssetOption } from "../marketplace/discovery";
import { SettingsDialog } from "./SettingsWorkspace";
import { AssetVotes } from "./AssetVotes";
import {
  animationTier,
  studioPublishingLimitation,
} from "../marketplace/animations";
const AnimationPlayer = lazy(() =>
  import("./AnimationPlayer").then((m) => ({ default: m.AnimationPlayer })),
);
const ModelPreview = lazy(() =>
  import("./AssetModelPreview").then((m) => ({ default: m.AssetModelPreview })),
);

export function AssetPreviewDialog({
  asset,
  group,
  choice,
  approved,
  disabled,
  busy,
  revision,
  close,
  choose,
  reload,
}: {
  asset: AssetOption;
  group: AssetDiscovery["groups"][number];
  choice?: NonNullable<AssetDiscovery["choices"]>[string];
  approved: boolean;
  disabled: boolean;
  busy: boolean;
  revision: number;
  close: () => void;
  choose: (choice: NonNullable<AssetDiscovery["choices"]>[string]) => void;
  reload: () => void;
}) {
  const entries = asset.previewData?.pack?.entries ?? [];
  const [clipKey, setClipKey] = useState(
    choice?.assetId === asset.assetId ? choice.clipKey : "",
  );
  const entry =
    entries.find((e) => e.key === clipKey) ??
    entries.find((e) => e.clip) ??
    entries[0];
  const selected = choice?.assetId === asset.assetId;
  const [acknowledged, setAcknowledged] = useState(
    choice?.acknowledgeInspectionLimitations ?? false,
  );
  const limited = !!asset.inspectionLimitations?.length;
  const canSelect =
    group.preview !== "animation" ||
    (!!entry && animationTier(entry) !== "unusable");
  return (
    <SettingsDialog
      title={asset.name}
      description={`${group.label} · by ${asset.creatorName} · #${asset.assetId}`}
      close={close}
      scrollBody
      footer={
        <>
          <button onClick={close}>Back to results</button>
          {!approved && selected && (
            <button disabled={disabled} onClick={() => choose({})}>
              Remove selection
            </button>
          )}
          {approved ? (
            <span>Approved ✓</span>
          ) : (
            <button
              className="primary"
              disabled={
                disabled || busy || !canSelect || (limited && !acknowledged)
              }
              onClick={() => {
                choose({
                  assetId: asset.assetId,
                  ...(limited
                    ? { acknowledgeInspectionLimitations: acknowledged }
                    : {}),
                  ...(group.preview === "animation"
                    ? { clipKey: entry!.key }
                    : {}),
                });
                close();
              }}
            >
              {selected ? "Keep selected asset" : "Choose this asset"}
            </button>
          )}
        </>
      }
    >
      <div className="asset-preview-dialog">
        <AssetVotes votes={asset.votes} />
        <a
          href={`https://create.roblox.com/store/asset/${asset.assetId}`}
          target="_blank"
          rel="noreferrer"
        >
          {group.preview === "audio"
            ? "Listen on Creator Store"
            : "View on Creator Store"}
        </a>
        {selected && (
          <p role="status">{approved ? "Approved" : "Selected"} ✓</p>
        )}
        {busy && <p role="status">Loading preview…</p>}
        {limited && (
          <div role="status">
            <p>
              Inspection coverage limitation:{" "}
              {asset.inspectionLimitations!.join(" ")}
            </p>
            <label>
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
              />
              I acknowledge that uninspected content remains unknown.
            </label>
          </div>
        )}
        {approved && !asset.previewData && (
          <p>
            No saved preview. Reopen asset choices to load this asset, or view
            it on Creator Store.
          </p>
        )}
        {asset.previewError && <p role="alert">{asset.previewError}</p>}
        {asset.previewData?.notice && <p>{asset.previewData.notice}</p>}
        {entry && animationTier(entry) === "studio_only" && (
          <p role="status">{studioPublishingLimitation}</p>
        )}
        {asset.previewData?.pack && (
          <>
            <label>
              Clip
              <select
                aria-label={`Clip from ${asset.name}`}
                value={entry?.key ?? ""}
                onChange={(e) => setClipKey(e.target.value)}
              >
                {entries.map((e) => (
                  <option key={e.key} value={e.key} disabled={!e.clip}>
                    {e.name}
                    {e.clip ? ` · ${e.clip.rig}` : " · unavailable"}
                  </option>
                ))}
              </select>
            </label>
            {!entries.length && (
              <p>No supported animation clips found in this asset.</p>
            )}
            {entry?.clip ? (
              <Suspense fallback={<p>Loading 3D viewer…</p>}>
                <AnimationPlayer
                  animation={{
                    id: entry.key,
                    clip: entry.clip,
                    revision,
                    at: "",
                    source: "user-import",
                  }}
                  provenance={`Roblox asset #${entry.animationId ?? asset.assetId}`}
                />
              </Suspense>
            ) : (
              entry?.error && <p>{entry.error}</p>
            )}
          </>
        )}
        {asset.previewData?.model && (
          <Suspense fallback={<p>Loading 3D viewer…</p>}>
            <ModelPreview model={asset.previewData.model} name={asset.name} />
          </Suspense>
        )}
        {!canSelect && (
          <p>Load a playable clip before choosing this animation asset.</p>
        )}
        {!approved && (
          <button disabled={disabled || busy} onClick={reload}>
            Reload preview
          </button>
        )}
      </div>
    </SettingsDialog>
  );
}
