import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { z } from "zod";
import { qualitySubmissionSchema, type QualitySubmission } from "./quality";

const digest = (data: string | Buffer) =>
  createHash("sha256").update(data).digest("hex");
const manifestSchema = z
  .object({
    version: z.literal(1),
    artifactHash: z.string().regex(/^[a-f0-9]{64}$/),
    submissionHash: z.string().regex(/^[a-f0-9]{64}$/),
    entries: z.array(
      z
        .object({
          evidenceId: z.string().min(1),
          uri: z.string().min(1),
          sha256: z.string().regex(/^[a-f0-9]{64}$/),
        })
        .strict(),
    ),
  })
  .strict();
export type EvidenceFileManifest = z.infer<typeof manifestSchema>;

function evidenceFile(root: string, uri: string) {
  if (path.isAbsolute(uri) || /^[a-z][a-z0-9+.-]*:/i.test(uri))
    throw Error("Evidence URI must be a workspace-relative local file: " + uri);
  const base = fs.realpathSync(root),
    file = fs.realpathSync(path.resolve(base, uri));
  const relative = path.relative(base, file);
  if (
    !relative ||
    relative === ".." ||
    relative.startsWith(".." + path.sep) ||
    path.isAbsolute(relative)
  )
    throw Error("Evidence file escapes workspace: " + uri);
  const stat = fs.statSync(file);
  if (!stat.isFile() || stat.size > 64 * 1024 * 1024)
    throw Error(
      "Evidence must be a regular file no larger than 64 MiB: " + uri,
    );
  return file;
}

/** Explicitly freeze files after review. Hashing is integrity, not evidence authenticity. */
export function createEvidenceFileManifest(
  input: QualitySubmission,
  root: string,
): EvidenceFileManifest {
  const submission = qualitySubmissionSchema.parse(input);
  if (
    new Set(submission.evidence.map((e) => e.id)).size !==
    submission.evidence.length
  )
    throw Error("Duplicate evidence IDs");
  return {
    version: 1,
    artifactHash: submission.artifactHash,
    submissionHash: digest(JSON.stringify(submission)),
    entries: submission.evidence.map((e) => ({
      evidenceId: e.id,
      uri: e.uri,
      sha256: digest(fs.readFileSync(evidenceFile(root, e.uri))),
    })),
  };
}

export function verifyEvidenceFileManifest(
  input: QualitySubmission,
  rawManifest: unknown,
  root: string,
) {
  const manifest = manifestSchema.parse(rawManifest),
    current = createEvidenceFileManifest(input, root);
  if (
    manifest.artifactHash !== current.artifactHash ||
    manifest.submissionHash !== current.submissionHash
  )
    throw Error("Submission or artifact changed since evidence was frozen");
  if (
    new Set(manifest.entries.map((e) => e.evidenceId)).size !==
      manifest.entries.length ||
    manifest.entries.length !== current.entries.length
  )
    throw Error("Evidence manifest entries do not match submission");
  for (const e of current.entries) {
    const frozen = manifest.entries.find((x) => x.evidenceId === e.evidenceId);
    if (!frozen || frozen.uri !== e.uri || frozen.sha256 !== e.sha256)
      throw Error(
        "Evidence file changed or missing from manifest: " + e.evidenceId,
      );
  }
  return {
    verifiedFiles: current.entries.length,
    integrity: "verified" as const,
    authenticity: "not established by hashes" as const,
  };
}
