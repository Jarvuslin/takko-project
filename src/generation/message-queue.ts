import type { Project } from "./schema";
import { appendTurn } from "./conversation";

export type QueuedMessage = {
  id: string;
  hash: string;
  text: string;
  revision: number;
  jobId: string;
  at: string;
  status: "queued" | "applying" | "applied" | "held" | "cancelled";
  reason?: string;
  answers?: Record<string, string>;
  attachments?: Project["assetAttachments"];
};
export class QueuedChangeBoundary extends Error {}

/** A worker holds an older object while HTTP submissions write to disk. Merge only
 * new queue entries and their receipts, never overwrite worker checkpoints. */
export function mergeQueuedMessages(p: Project, previous?: Project) {
  for (const message of previous?.queuedMessages ?? []) {
    const existing = p.queuedMessages?.find((q) => q.id === message.id);
    if (existing) {
      if (message.status === "cancelled") {
        existing.status = "cancelled";
        const turn = p.conversation?.find((t) => t.id === message.id);
        if (turn) turn.status = "cancelled";
      }
      continue;
    }
    (p.queuedMessages ??= []).push(structuredClone(message));
    const turn = previous?.conversation?.find((t) => t.id === message.id);
    if (turn && !p.conversation?.some((t) => t.id === turn.id))
      (p.conversation ??= []).push(structuredClone(turn));
  }
}
export function markQueued(
  p: Project,
  status: QueuedMessage["status"],
  reason: string,
  ids?: string[],
) {
  for (const q of p.queuedMessages ?? []) {
    if (
      !["queued", "applying"].includes(q.status) ||
      (ids && !ids.includes(q.id))
    )
      continue;
    q.status = status;
    q.reason = reason;
    const turn = p.conversation?.find((t) => t.id === q.id);
    if (turn) turn.status = status;
  }
}
export function queueReceipt(p: Project, message: QueuedMessage) {
  (p.queuedMessages ??= []).push(message);
  appendTurn(p, "user", message.text, { id: message.id, status: "queued" });
}
