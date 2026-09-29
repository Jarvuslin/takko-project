import { RequestError } from "../errors";
import { z } from "zod";

export const assetIdSchema = z
  .string()
  .regex(/^[1-9]\d{0,15}$/)
  .refine((v) => Number.isSafeInteger(Number(v)));
export const marketplaceKindSchema = z.enum([
  "Model",
  "MeshPart",
  "Audio",
  "Image",
  "Animation",
]);
export type MarketplaceKind = z.infer<typeof marketplaceKindSchema>;
export const metadataSchema = z
  .object({
    assetId: assetIdSchema,
    name: z.string().min(1).max(200),
    kind: marketplaceKindSchema,
    creatorName: z.string().max(200),
    updated: z.string().max(100),
    isFree: z.boolean().optional(),
    scriptCount: z.number().int().nonnegative().optional(),
    versionId: assetIdSchema.optional(),
    votes: z
      .object({
        up: z.number().int().nonnegative(),
        down: z.number().int().nonnegative(),
      })
      .strict()
      .optional(),
  })
  .strict();
export type AssetMetadata = z.infer<typeof metadataSchema>;
export const INSPECTION_BYTE_LIMIT = 4 * 1024 * 1024;
export const snapshotSchema = z
  .object({
    nodes: z.array(
      z
        .object({
          name: z.string().max(1024),
          className: z.string().max(100),
        })
        .strict(),
    ),
    scripts: z
      .array(
        z
          .object({
            name: z.string().max(1024),
            source: z.string().max(262144),
          })
          .strict(),
      )
      .max(100),
    complete: z.boolean(),
    issues: z.array(z.string().max(300)).max(100),
  })
  .strict()
  .refine((s) => s.scripts.reduce((n, x) => n + x.source.length, 0) <= 262144)
  .refine(
    (s) =>
      new TextEncoder().encode(JSON.stringify(s)).length <=
      INSPECTION_BYTE_LIMIT,
    "Inspection exceeds the transfer byte budget",
  );
export type AssetSnapshot = z.infer<typeof snapshotSchema>;
export type Finding = {
  rule: string;
  severity: "blocked" | "review";
  script?: string;
  message: string;
};
export type Inspection = {
  scannerVersion: number;
  contentHash: string;
  inspectedAt: string;
  status: "no_issues_found" | "limited" | "review_required" | "blocked";
  limitations?: string[];
  findings: Finding[];
  scriptCount: number;
  nodeCount: number;
};
export type LibraryAsset = AssetMetadata & {
  liked: boolean;
  saved: boolean;
  inspection?: Inspection;
};
export type AssetAttachment = {
  assetId: string;
  name: string;
  kind: MarketplaceKind;
  creatorName: string;
  contentHash: string;
  revisionKey: string;
  inspectedAt: string;
  scannerVersion: number;
  scriptCount: number;
  usage: string;
  inspectionLimitations?: string[];
};
export const attachmentInputSchema = z
  .array(
    z
      .object({
        assetId: assetIdSchema,
        contentHash: z.string().regex(/^[a-f0-9]{64}$/),
        usage: z.string().trim().max(500).default(""),
        acknowledgeInspectionLimitations: z.boolean().optional(),
      })
      .strict(),
  )
  .max(8);

/** URLs are identifiers, never fetch destinations. */
export function parseAssetReference(value: string): string {
  const text = value.trim();
  if (/^\d+$/.test(text)) return assetIdSchema.parse(text);
  if (/^rbxassetid:\/\/\d+$/.test(text))
    return assetIdSchema.parse(text.slice(13));
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    throw new RequestError("Drop a Roblox asset link or asset ID.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !["create.roblox.com", "www.roblox.com", "roblox.com"].includes(
      url.hostname,
    )
  )
    throw new RequestError("Use a Roblox Creator Store asset link.");
  const match = url.pathname.match(
    /^\/(?:store\/asset|library|catalog)\/(\d+)(?:\/|$)/,
  );
  if (!match)
    throw new RequestError("This link does not identify a Roblox asset.");
  return assetIdSchema.parse(match[1]);
}
