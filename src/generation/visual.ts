import { RequestError, ConflictError } from "../errors";
import { z } from "zod";
import { bundleHash } from "./validation";
import type { Project } from "./schema";
const schema = z
  .object({
    revision: z.number().int(),
    dataUrl: z
      .string()
      .max(1_100_000)
      .regex(/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/),
    notes: z.string().trim().min(5).max(3000),
  })
  .strict();

// Missing status is supported for screenshots saved before feedback tracking.
export function currentVisualFeedback(p: Project) {
  const evidence = p.visualEvidence;
  return evidence &&
    evidence.reviewStatus !== "awaiting_inspection" &&
    p.artifact &&
    evidence.artifactHash === bundleHash(p.artifact)
    ? evidence
    : null;
}

export function markVisualFeedbackForInspection(p: Project) {
  if (p.visualEvidence) p.visualEvidence.reviewStatus = "awaiting_inspection";
}

export function attachVisual(p: Project, input: unknown) {
  const b = schema.parse(input);
  if (p.jobId || p.revision !== b.revision)
    throw new ConflictError("Revision conflict or generation is running");
  if (!p.artifact)
    throw new ConflictError("Build an artifact before attaching a screenshot");
  const bytes = Buffer.from(b.dataUrl.split(",")[1], "base64");
  if (
    bytes.length < 33 ||
    bytes.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a" ||
    bytes.subarray(12, 16).toString() !== "IHDR"
  )
    throw new RequestError("Upload a PNG screenshot");
  const width = bytes.readUInt32BE(16),
    height = bytes.readUInt32BE(20);
  if (width < 1 || height < 1 || width > 2048 || height > 2048)
    throw new RequestError(
      "Screenshot dimensions must be at most 2048 by 2048",
    );
  p.visualEvidence = {
    revision: p.revision,
    artifactHash: bundleHash(p.artifact),
    dataUrl: b.dataUrl,
    notes: b.notes,
    source: "user-upload",
    reviewStatus: "unaddressed",
    at: new Date().toISOString(),
  };
  return p;
}
