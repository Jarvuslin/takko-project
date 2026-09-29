import { RequestError, ConflictError, UpstreamError } from "../errors";
import {
  StdioStudioClient,
  StudioMcpError,
} from "../generation/studio-mcp-client";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  isVerifiedEditState,
  isVerifiedClientPlayState,
} from "../generation/studio-state";
import {
  INSPECTION_BYTE_LIMIT,
  assetIdSchema,
  metadataSchema,
  snapshotSchema,
  type AssetMetadata,
  type MarketplaceKind,
} from "./types";
import type { MarketplaceProvider } from "./library";
import {
  animationCaptureLuau,
  animationPackSchema,
  type AnimationPack,
} from "./animations";
import { animationClipSchema } from "../generation/animation";
import { revisionKey } from "./library";
import { modelPreviewLuau, modelPreviewSchema } from "./preview";
import { CreatorStore } from "./creator-store";

export function unpackMarketplace(raw: any): any {
  for (let i = 0; i < 8; i++) {
    if (raw?.isError)
      throw new UpstreamError(
        "Studio could not complete this asset request. Check its connection and Edit mode.",
      );
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
        continue;
      } catch {
        return raw;
      }
    }
    if (raw?.structuredContent) {
      raw = raw.structuredContent;
      continue;
    }
    if (raw?.content?.length === 1 && raw.content[0].type === "text") {
      raw = raw.content[0].text;
      continue;
    }
    if (
      raw &&
      typeof raw === "object" &&
      Object.keys(raw).length === 1 &&
      "result" in raw
    ) {
      raw = raw.result;
      continue;
    }
    return raw;
  }
  throw new UpstreamError("Unrecognized Studio response.");
}
type Client = Pick<StdioStudioClient, "callTool" | "close">;
const CHUNK_BYTES = 32768;
const MAX_TRANSFER_BYTES = 4 * 1024 * 1024;
const transferSchema = z
  .object({
    offset: z.number().int().min(0).max(MAX_TRANSFER_BYTES),
    bytes: z.number().int().min(1).max(MAX_TRANSFER_BYTES),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    hex: z
      .string()
      .min(2)
      .max(CHUNK_BYTES * 2)
      .regex(/^(?:[a-f0-9]{2})+$/),
  })
  .strict();
function studioData<T>(schema: z.ZodType<T>, value: unknown, label: string): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    if (typeof value === "string" && value.includes("(truncated)"))
      throw new UpstreamError(
        "Studio cut off the asset inspection response. Retry the asset inspection.",
      );
    const fields = parsed.error.issues
      .slice(0, 4)
      .map((i) => i.path.join(".") || "response")
      .join(", ");
    throw new UpstreamError(
      `Studio returned invalid ${label} data (${fields}). Retry the asset inspection.`,
    );
  }
  return parsed.data;
}
export class StudioMarketplace implements MarketplaceProvider {
  private readonly creatorStore = new CreatorStore();
  async searchPage(
    _studioId: string,
    query: string,
    kind: MarketplaceKind,
    cursor?: string,
  ) {
    return this.creatorStore.search(query, kind, cursor);
  }
  constructor(
    private readonly createClient: () => Client = () =>
      new StdioStudioClient({ timeoutMs: 90000 }),
  ) {}
  private async use<T>(run: (client: Client) => Promise<T>) {
    const client = this.createClient();
    try {
      return await run(client);
    } catch (error) {
      if (error instanceof RequestError) throw error;
      if (error instanceof StudioMcpError) {
        const recovery: Record<string, string> = {
          not_installed:
            "Roblox’s Studio connector was not found. Update Roblox Studio, open Assistant settings → MCP Servers and enable Studio as an MCP server. Then check the connection again.",
          timeout:
            "Studio did not respond in time. Open your place in Studio and check Assistant settings → MCP Servers. Then check the connection again.",
          spawn_failed:
            "Takko could not start Roblox’s Studio connector. Check that Roblox Studio is installed and that Windows allows StudioMCP.exe to run.",
          process_error:
            "Roblox’s Studio connector could not run. Update Studio and check that Windows allows StudioMCP.exe to run.",
          process_exit:
            "Roblox’s Studio connector closed. Open Studio, enable Studio as an MCP server in Assistant settings and check the connection again.",
        };
        throw new UpstreamError(
          recovery[error.code] ??
            "Studio’s connector could not complete the request. Open Assistant settings → MCP Servers and check that Studio as an MCP server is enabled.",
        );
      }
      throw new UpstreamError(
        "Studio request failed. Check its connection and try again.",
      );
    } finally {
      await client.close();
    }
  }
  async studios() {
    return this.use(async (c) => {
      const data = unpackMarketplace(
        await c.callTool("list_roblox_studios", {}),
      );
      if (!Array.isArray(data?.studios))
        throw new UpstreamError("Studio discovery unavailable.");
      return data.studios.map((s: any) => ({
        id: String(s.id),
        name: String(s.name),
      }));
    });
  }
  async search(studioId: string, query: string, kind: MarketplaceKind) {
    // Creator Store search exposes animation packs as Models, not Animation.
    const searchKind = kind === "Animation" ? "Model" : kind;
    return this.use(async (c) => {
      const data = unpackMarketplace(
        await c.callTool("search_asset", {
          studio_id: studioId,
          scope: "creator_store",
          priceFilter: "free",
          maxResults: 20,
          query: kind === "Animation" ? query + " animation" : query,
          assetType: searchKind,
        }),
      );
      if (data?.scope !== "creator_store" || !Array.isArray(data.results))
        throw new UpstreamError("Creator Store search unavailable.");
      return data.results
        .filter(
          (r: any) =>
            r.source === "creator_store" &&
            r.assetType === searchKind &&
            r.isFree === true &&
            r.priceCents === 0,
        )
        .map((r: any) =>
          metadataSchema.parse({
            assetId: String(r.assetId),
            name: String(r.name).slice(0, 200),
            kind: searchKind,
            creatorName: String(r.creatorName ?? "Unknown creator").slice(
              0,
              200,
            ),
            updated: "",
          }),
        );
    });
  }
  private async execute(studioId: string, code: string, metadataOnly = false) {
    return this.use(async (c) => {
      const state = unpackMarketplace(
        await c.callTool("get_studio_state", { studio_id: studioId }),
      );
      const mode = isVerifiedEditState(state)
        ? "Edit"
        : metadataOnly && isVerifiedClientPlayState(state)
          ? "Server"
          : null;
      if (!mode)
        throw new ConflictError(
          "Stop Play in the selected Studio before inspecting new assets.",
        );
      return unpackMarketplace(
        await c.callTool("execute_luau", {
          studio_id: studioId,
          datamodel_type: mode,
          code,
        }),
      );
    });
  }
  private async transferred(studioId: string, capture: string) {
    const chunks: Buffer[] = [];
    let expected: z.infer<typeof transferSchema> | undefined;
    for (
      let offset = 0;
      offset < (expected?.bytes ?? 1);
      offset += CHUNK_BYTES
    ) {
      const frame = studioData(
        transferSchema,
        await this.execute(studioId, animationTransferLuau(capture, offset)),
        "animation transfer",
      );
      if (
        frame.offset !== offset ||
        (expected &&
          (expected.bytes !== frame.bytes || expected.sha256 !== frame.sha256))
      )
        throw new UpstreamError(
          "Animation changed during transfer. Drop it again to retry.",
        );
      expected ??= frame;
      const chunk = Buffer.from(frame.hex, "hex");
      if (chunk.length !== Math.min(CHUNK_BYTES, frame.bytes - offset))
        throw new UpstreamError("Incomplete animation transfer.");
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (createHash("sha256").update(bytes).digest("hex") !== expected?.sha256)
      throw new UpstreamError("Animation integrity check failed.");
    const decoded = JSON.parse(bytes.toString("utf8"));
    if (typeof decoded?.captureError === "string")
      throw new UpstreamError(decoded.captureError);
    return decoded;
  }
  async preview(studioId: string, metadata: AssetMetadata) {
    const preview = studioData(
      modelPreviewSchema,
      unpackMarketplace(
        await this.transferred(studioId, modelPreviewLuau(metadata.assetId)),
      ),
      "model preview",
    );
    const after = await this.metadata(studioId, metadata.assetId);
    if (
      after.assetId !== metadata.assetId ||
      after.kind !== metadata.kind ||
      revisionKey(after) !== revisionKey(metadata)
    )
      throw new UpstreamError(
        "The asset changed while its preview was loading. Preview it again.",
      );
    return preview;
  }
  async metadata(studioId: string, assetId: string): Promise<AssetMetadata> {
    assetIdSchema.parse(assetId);
    return studioData(
      metadataSchema,
      await this.execute(
        studioId,
        `
local id=${assetId}
local info=game:GetService("MarketplaceService"):GetProductInfo(id)
local kinds={[10]="Model",[40]="MeshPart",[3]="Audio",[1]="Image",[13]="Image",[24]="Animation"}
local kind=assert(kinds[info.AssetTypeId],"This asset type is not supported")
local ok,version=pcall(function() return game:GetService("InsertService"):GetLatestAssetVersionAsync(id) end)
return game:GetService("HttpService"):JSONEncode({assetId="${assetId}",name=string.sub(info.Name,1,200),kind=kind,
 creatorName=string.sub(info.Creator and info.Creator.Name or "Unknown creator",1,200),updated=tostring(info.Updated or ""),versionId=ok and string.format("%.0f",version) or nil})`,
        true,
      ),
      "asset metadata",
    );
  }
  async animations(
    studioId: string,
    metadata: AssetMetadata,
    limit = 100,
  ): Promise<AnimationPack> {
    z.number().int().min(1).max(100).parse(limit);
    const empty = {
      assetId: metadata.assetId,
      name: metadata.name,
      revisionKey: revisionKey(metadata),
      entries: [],
    };
    if (!["Model", "Animation"].includes(metadata.kind)) return empty;
    const read = (index: number) =>
      this.transferred(
        studioId,
        animationCaptureLuau(metadata.assetId, metadata.kind, index),
      );
    const manifest = studioData(
      z
        .object({
          entries: z
            .array(
              z
                .object({
                  key: z.string().max(1024),
                  name: z.string().max(200),
                  // The manifest describes authored instances, including broken IDs.
                  // Isolate unsupported identities per entry rather than losing the pack.
                  animationId: z.string().max(1024).optional(),
                })
                .strict(),
            )
            .max(100),
          context: animationPackSchema.shape.context,
        })
        .strict(),
      await read(-1),
      "animation manifest",
    );
    const entries: AnimationPack["entries"] = [];
    for (const [index, entry] of manifest.entries.slice(0, limit).entries()) {
      if (metadata.kind === "Animation") entry.name = metadata.name;
      if (
        entry.animationId !== undefined &&
        !assetIdSchema.safeParse(entry.animationId).success
      ) {
        entries.push({
          key: entry.key,
          name: entry.name,
          error:
            "This embedded Animation has an invalid published identity. Other clips remain available.",
        });
        continue;
      }
      try {
        const clip = studioData(
          animationClipSchema,
          await read(index),
          "animation clip",
        );
        clip.name = entry.name.slice(0, 80);
        const offered = { ...entry, clip };
        // Include metadata/context and reserve room for bounded error entries.
        const bytes = Buffer.byteLength(
          JSON.stringify({
            ...empty,
            context: manifest.context,
            entries: [...entries, offered],
          }),
        );
        const errorReserve =
          (Math.min(limit, manifest.entries.length) - index - 1) * 2048;
        if (bytes + errorReserve > MAX_TRANSFER_BYTES)
          throw new UpstreamError(
            "This pack exceeds the 4 MB preview limit. Preview this animation using its own asset link.",
          );
        entries.push(offered);
      } catch (error) {
        entries.push({
          ...entry,
          error:
            error instanceof RequestError
              ? error.message.slice(0, 400)
              : "Roblox could not load this clip. It may be private, unavailable, or outside the supported R6/R15 preview format.",
        });
      }
    }
    const after = await this.metadata(studioId, metadata.assetId);
    if (
      after.assetId !== metadata.assetId ||
      after.kind !== metadata.kind ||
      revisionKey(after) !== revisionKey(metadata)
    )
      throw new UpstreamError(
        "The asset changed while its animations were loading. Drop it again to retry.",
      );
    return animationPackSchema.parse({
      ...empty,
      entries,
      context: manifest.context,
    });
  }
  async snapshot(studioId: string, metadata: AssetMetadata) {
    const id = assetIdSchema.parse(metadata.assetId);
    // Media types have no executable script containers. No autoplay or Studio insertion.
    if (["Audio", "Image", "Animation"].includes(metadata.kind))
      return snapshotSchema.parse({
        nodes: [
          {
            name: metadata.name,
            className: metadata.kind === "Audio" ? "Sound" : metadata.kind,
          },
        ],
        scripts: [],
        complete: true,
        issues: [],
      });
    const chunks: Buffer[] = [];
    let expected: z.infer<typeof transferSchema> | undefined;
    for (
      let offset = 0;
      offset < (expected?.bytes ?? 1);
      offset += CHUNK_BYTES
    ) {
      const frame = studioData(
        transferSchema,
        await this.execute(studioId, inspectionTransferLuau(id, offset)),
        "inspection transfer",
      );
      if (
        frame.offset !== offset ||
        (expected &&
          (frame.bytes !== expected.bytes || frame.sha256 !== expected.sha256))
      )
        throw new UpstreamError(
          "Asset inspection changed during transfer. Drop it again to retry.",
        );
      expected ??= frame;
      const chunk = Buffer.from(frame.hex, "hex");
      if (chunk.length !== Math.min(CHUNK_BYTES, frame.bytes - offset))
        throw new UpstreamError(
          "Asset inspection transfer is incomplete. Drop it again to retry.",
        );
      chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks);
    if (
      !expected ||
      createHash("sha256").update(bytes).digest("hex") !== expected.sha256
    )
      throw new UpstreamError(
        "Asset inspection transfer failed its integrity check. Drop it again to retry.",
      );
    let value: unknown;
    try {
      value = JSON.parse(bytes.toString("utf8"));
    } catch {
      throw new UpstreamError(
        "Studio returned unreadable asset inspection data. Drop it again to retry.",
      );
    }
    const packed = studioData(
      z.tuple([
        z.boolean(),
        z.array(z.string()),
        z.array(z.tuple([z.string(), z.string()])),
        z.array(z.tuple([z.string(), z.string()])),
      ]),
      value,
      "inspection snapshot",
    );
    return studioData(
      snapshotSchema,
      {
        complete: packed[0],
        issues: packed[1],
        nodes: packed[2].map(([name, className]) => ({ name, className })),
        scripts: packed[3].map(([name, source]) => ({ name, source })),
      },
      "inspection snapshot",
    );
  }
}

/** Studio truncates execute_luau output at 100,000 characters. Each reply stays below 66K.
 * Recapture detached objects per page to avoid storing imported data inside the user's game.
 * Canonical arrays and SHA-256 prevent mixing different captures during reassembly.
 */
export function animationTransferLuau(capture: string, offset: number) {
  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset >= MAX_TRANSFER_BYTES ||
    offset % CHUNK_BYTES
  )
    throw new UpstreamError("Invalid animation transfer offset.");
  return `
local function capture()
${capture}
end
local http=game:GetService("HttpService")
local function encode(value)
  if type(value)~="table" then return http:JSONEncode(value) end
  local keys={}
  for k in value do table.insert(keys,k) end
  if #keys==0 then return "[]" end
  table.sort(keys)
  local out={}
  local array=type(keys[1])=="number"
  for _,k in keys do table.insert(out,(array and "" or http:JSONEncode(k)..":")..encode(value[k])) end
  return (array and "[" or "{")..table.concat(out,",")..(array and "]" or "}")
end
local encoded=encode(capture())
assert(#encoded<=${MAX_TRANSFER_BYTES},"Animation exceeds the transfer size limit")
local digest=game:GetService("EncodingService"):ComputeStringHash(encoded,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
local hex=string.sub(encoded,${offset + 1},${offset + CHUNK_BYTES}):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
return http:JSONEncode({offset=${offset},bytes=#encoded,sha256=digest,hex=hex})`;
}
export function inspectionTransferLuau(id: string, offset: number) {
  if (
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset >= MAX_TRANSFER_BYTES ||
    offset % CHUNK_BYTES
  )
    throw new UpstreamError("Invalid inspection transfer offset.");
  return `
local function capture()
${inspectionLuau(id)}
end
local http=game:GetService("HttpService")
local snapshot=http:JSONDecode(capture())
local nodes,scripts={},{}
for _,node in snapshot.nodes do table.insert(nodes,{node.name,node.className}) end
for _,source in snapshot.scripts do table.insert(scripts,{source.name,source.source}) end
local encoded=http:JSONEncode({snapshot.complete,snapshot.issues,nodes,scripts})
assert(#encoded<=${MAX_TRANSFER_BYTES},"Asset inspection exceeds the transfer size limit")
local digest=game:GetService("EncodingService"):ComputeStringHash(encoded,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
local chunk=string.sub(encoded,${offset + 1},${offset + CHUNK_BYTES})
local hex=chunk:gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
return http:JSONEncode({offset=${offset},bytes=#encoded,sha256=digest,hex=hex})
`;
}

export function inspectionLuau(id: string) {
  assetIdSchema.parse(id);
  return `
assert(not game:GetService("RunService"):IsRunning(),"Stop Play before inspecting")
local roots=game:GetObjects("rbxassetid://${id}")
local result={nodes={},scripts={},complete=true,issues={}}
local ok,err=pcall(function()
  assert(#roots>0,"Asset returned no objects")
  local bytes=0
  local transferBytes=4096
  local function reserve(value)
    transferBytes+=#game:GetService("HttpService"):JSONEncode(value)+1
    assert(transferBytes<=${INSPECTION_BYTE_LIMIT},"Inspection coverage reached the transfer byte budget")
  end
  for _,root in roots do
    assert(root.Parent==nil,"Inspection requires detached objects")
    local objects={root}
    for _,item in root:GetDescendants() do table.insert(objects,item) end
    for _,item in objects do
      local node={name=string.sub(item:GetFullName(),1,1024),className=item.ClassName}
      reserve(node)
      table.insert(result.nodes,node)
      if item:IsA("BaseScript") then item.Enabled=false end
      if item:IsA("Sound") then item.PlayOnRemove=false end
      if item:IsA("LuaSourceContainer") then
        assert(#result.scripts<100,"Asset exceeds 100 scripts")
        local readable,source=pcall(function() return item.Source end)
        if not readable then result.complete=false;table.insert(result.issues,"Unreadable script source")
        else
          bytes+=#source;assert(bytes<=262144,"Asset source exceeds inspection limit")
          local captured={name=string.sub(item:GetFullName(),1,1024),source=source}
          reserve(captured)
          table.insert(result.scripts,captured)
        end
      end
    end
  end
end)
for _,root in roots do root:Destroy() end
if not ok then result.complete=false;table.insert(result.issues,string.sub(tostring(err),1,300)) end
assert(not game:GetService("RunService"):IsRunning(),"Studio mode changed during inspection")
return game:GetService("HttpService"):JSONEncode(result)
`;
}
