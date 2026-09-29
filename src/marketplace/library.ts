import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { RequestError, StoredDataError, UpstreamError } from "../errors";
import { SCANNER_VERSION, inspectSnapshot, snapshotHash } from "./inspection";
import {
  assetIdSchema,
  metadataSchema,
  snapshotSchema,
  attachmentInputSchema,
  type AssetAttachment,
  type AssetMetadata,
  type AssetSnapshot,
  type LibraryAsset,
  type MarketplaceKind,
} from "./types";

export interface MarketplaceProvider {
  searchPage?(
    studioId: string,
    query: string,
    kind: MarketplaceKind,
    cursor?: string,
  ): Promise<import("./creator-store").SearchPage>;
  preview?(
    studioId: string,
    metadata: AssetMetadata,
  ): Promise<import("./preview").ModelPreview>;
  studios(): Promise<{ id: string; name: string }[]>;
  search(
    studioId: string,
    query: string,
    kind: MarketplaceKind,
  ): Promise<AssetMetadata[]>;
  metadata(studioId: string, assetId: string): Promise<AssetMetadata>;
  snapshot(studioId: string, metadata: AssetMetadata): Promise<AssetSnapshot>;
  animations?(
    studioId: string,
    metadata: AssetMetadata,
    limit?: number,
  ): Promise<import("./animations").AnimationPack>;
}
type AssetRecord = { asset: LibraryAsset; snapshot?: AssetSnapshot };
function upstreamMetadata(input: unknown): AssetMetadata {
  const parsed = metadataSchema.safeParse(input);
  if (!parsed.success)
    throw new UpstreamError("Studio returned invalid asset metadata data.");
  return parsed.data;
}
export const revisionKey = (m: AssetMetadata) =>
  m.versionId
    ? "version:" + m.versionId
    : m.updated
      ? "updated:" + m.updated
      : "";

export class AssetLibrary {
  private unreadable = new Set<string>();
  private pending = new Map<
    string,
    Promise<{ asset: LibraryAsset; cacheHit: boolean }>
  >();
  constructor(
    readonly directory: string,
    readonly provider: MarketplaceProvider,
  ) {
    fs.mkdirSync(directory, { recursive: true });
  }
  private file(id: string) {
    return path.join(this.directory, assetIdSchema.parse(id) + ".json");
  }
  private read(id: string): AssetRecord | undefined {
    const file = this.file(id);
    try {
      const record = JSON.parse(fs.readFileSync(file, "utf8")) as AssetRecord;
      const {
        liked: _l,
        saved: _s,
        inspection: _i,
        ...metadata
      } = record.asset;
      metadataSchema.parse(metadata);
      if (
        record.asset.assetId !== id ||
        typeof record.asset.liked !== "boolean" ||
        typeof record.asset.saved !== "boolean"
      )
        throw Error("Invalid asset cache record.");
      if (record.snapshot) {
        snapshotSchema.parse(record.snapshot);
        if (record.asset.inspection?.scannerVersion !== SCANNER_VERSION) record.asset.inspection = inspectSnapshot(record.snapshot);
      }
      return record;
    } catch (cause) {
      if ((cause as NodeJS.ErrnoException).code === "ENOENT") return;
      throw new StoredDataError("asset cache record", { cause });
    }
  }
  private write(record: AssetRecord) {
    const file = this.file(record.asset.assetId),
      temp = file + "." + randomUUID() + ".tmp";
    fs.writeFileSync(temp, JSON.stringify(record));
    fs.renameSync(temp, file);
  }
  get(id: string) {
    const record = this.read(id);
    return record && structuredClone(record.asset);
  }
  sourceSnapshot(id: string) {
    const snapshot = this.read(id)?.snapshot;
    return snapshot && structuredClone(snapshot);
  }
  list(filter: "all" | "liked" | "saved" = "all") {
    return fs
      .readdirSync(this.directory)
      .filter(
        (f) =>
          f.endsWith(".json") &&
          assetIdSchema.safeParse(f.slice(0, -5)).success,
      )
      .flatMap((f) => {
        try {
          const asset = this.get(f.slice(0, -5));
          this.unreadable.delete(f);
          return asset ? [asset] : [];
        } catch (error) {
          if (!(error instanceof StoredDataError)) throw error;
          if (!this.unreadable.has(f)) {
            console.warn(
              `Skipped unreadable asset ${f}. Original file preserved.`,
            );
            this.unreadable.add(f);
          }
          return [];
        }
      })
      .filter((a) => filter === "all" || a[filter])
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  remember(input: AssetMetadata) {
    const metadata = upstreamMetadata(input),
      old = this.read(metadata.assetId);
    // Search results lack authoritative revision information. Do not overwrite an inspected revision.
    if (old) return old.asset;
    const asset: LibraryAsset = { ...metadata, liked: false, saved: false };
    this.write({ asset });
    return asset;
  }
  preferences(id: string, patch: { liked?: boolean; saved?: boolean }) {
    const record = this.read(id);
    if (!record)
      throw new RequestError(
        "Asset not found. Search or inspect it first.",
        404,
      );
    record.asset = { ...record.asset, ...patch };
    this.write(record);
    return record.asset;
  }
  inspect(studioId: string, id: string) {
    assetIdSchema.parse(id);
    const key = studioId + ":" + id;
    const existing = this.pending.get(key);
    if (existing) return existing;
    const task = this.inspectOnce(studioId, id).finally(() =>
      this.pending.delete(key),
    );
    this.pending.set(key, task);
    return task;
  }
  private async inspectOnce(studioId: string, id: string) {
    const metadata = upstreamMetadata(
      await this.provider.metadata(studioId, id),
    );
    if (metadata.assetId !== id)
      throw new RequestError("Asset metadata identity mismatch.", 502);
    const old = this.read(id),
      key = revisionKey(metadata);
    if (
      old?.snapshot &&
      old.asset.inspection &&
      key &&
      key === revisionKey(old.asset) &&
      old.asset.kind === metadata.kind &&
      old.asset.inspection.scannerVersion === SCANNER_VERSION &&
      snapshotHash(old.snapshot) === old.asset.inspection.contentHash
    )
      return { asset: old.asset, cacheHit: true };
    const parsedSnapshot = snapshotSchema.safeParse(
      await this.provider.snapshot(studioId, metadata),
    );
    if (!parsedSnapshot.success)
      throw new UpstreamError("Studio returned invalid asset inspection data.");
    const snapshot = parsedSnapshot.data;
    const after = upstreamMetadata(await this.provider.metadata(studioId, id));
    if (
      after.assetId !== id ||
      after.kind !== metadata.kind ||
      revisionKey(after) !== key
    )
      throw new RequestError(
        "Asset changed during inspection. Drop it again to inspect the new version.",
        409,
      );
    const preferences = this.read(id)?.asset;
    const asset: LibraryAsset = {
      ...metadata,
      liked: preferences?.liked ?? false,
      saved: preferences?.saved ?? false,
      inspection: inspectSnapshot(snapshot),
    };
    this.write({ asset, snapshot });
    return { asset, cacheHit: false };
  }
  attachments(input: unknown): AssetAttachment[] {
    const refs = attachmentInputSchema.parse(input);
    if (new Set(refs.map((r) => r.assetId)).size !== refs.length)
      throw new RequestError("An asset can only be attached once.");
    return refs.map((ref) => {
      const record = this.read(ref.assetId),
        asset = record?.asset,
        inspection = asset?.inspection;
      if (
        !asset ||
        !record.snapshot ||
        !inspection ||
        inspection.contentHash !== ref.contentHash ||
        inspection.scannerVersion !== SCANNER_VERSION ||
        snapshotHash(record.snapshot) !== ref.contentHash ||
        (!["no_issues_found", "review_required"].includes(inspection.status) &&
          !(
            inspection.status === "limited" &&
            ref.acknowledgeInspectionLimitations
          ))
      )
        throw new RequestError(
          "Asset inspection is missing, outdated or needs review. Inspect the asset before attaching it.",
        );
      // Recompute the verdict rather than trusting an editable local JSON status field.
      const verdict = inspectSnapshot(record.snapshot);
      if (
        !["no_issues_found", "review_required"].includes(verdict.status) &&
        !(verdict.status === "limited" && ref.acknowledgeInspectionLimitations)
      )
        throw new RequestError("Asset needs review.");
      return {
        assetId: asset.assetId,
        name: asset.name,
        kind: asset.kind,
        creatorName: asset.creatorName,
        contentHash: inspection.contentHash,
        revisionKey: revisionKey(asset),
        inspectedAt: inspection.inspectedAt,
        scannerVersion: inspection.scannerVersion,
        scriptCount: inspection.scriptCount,
        usage: ref.usage,
        ...(verdict.limitations?.length
          ? { inspectionLimitations: verdict.limitations }
          : {}),
      };
    });
  }
}
