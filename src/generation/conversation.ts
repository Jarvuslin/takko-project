import { randomUUID } from "node:crypto";
import type { Project } from "./schema";

export type ConversationTurn = {
  id: string;
  at: string;
  revision: number;
  kind: "user" | "snapshot" | "run" | "approval" | "studio" | "media";
  text: string;
  clarifications?: { id: string; prompt: string; answer: string }[];
  runId?: string;
  status?: string;
  events?: { at: string; message: string }[];
  costMicros?: number;
  chargeStart?: number;
  proposal?: Project["concept"];
  plan?: Pick<
    NonNullable<Project["spec"]>,
    "title" | "summary" | "requirements" | "tasks"
  >;
  files?: string[];
  assets?: NonNullable<Project["artifact"]>["assets"];
  effects?: string[];
  architecture?: Project["architecture"];
  screenshot?: string;
  feedback?: "helpful" | "needs_work";
  animationId?: string;
  animationPackId?: string;
};
export type BriefChange = { id: string; text: string };
export function appendTurn(
  p: Project,
  kind: ConversationTurn["kind"],
  text: string,
  extra: Partial<ConversationTurn> = {},
) {
  const turn = {
    id: randomUUID(),
    at: new Date().toISOString(),
    revision: p.revision,
    kind,
    text,
    ...extra,
  };
  (p.conversation ??= []).push(turn);
  return turn;
}

/** Capture only observed state transitions. Legacy imports never invent dialogue. */
export function recordConversation(p: Project, previous?: Project) {
  if (!p.conversation) {
    p.conversation = [];
    appendTurn(
      p,
      previous ? "snapshot" : "user",
      previous
        ? `Saved project imported at revision ${p.revision}. Earlier conversation was not recorded. Request: ${p.request}`
        : p.request,
    );
  }
  if (previous && previous.request !== p.request)
    appendTurn(p, "user", `Updated brief: ${p.request}`);
  if (
    previous &&
    JSON.stringify(previous.answers) !== JSON.stringify(p.answers)
  ) {
    const changed = Object.entries(p.answers).filter(
      ([id, answer]) => previous.answers[id] !== answer,
    );
    if (changed.length)
      appendTurn(
        p,
        "user",
        changed
          .map(([id, answer]) => `${p.answerQuestions?.[id] ?? id}: ${answer}`)
          .join("\n"),
        {
          clarifications: changed.map(([id, answer]) => ({
            id,
            prompt: p.answerQuestions?.[id] ?? p.conceptQuestions?.[id] ?? id,
            answer,
          })),
        },
      );
  }
  if (p.approvedRevision && p.approvedRevision !== previous?.approvedRevision)
    appendTurn(
      p,
      "approval",
      `Approved plan for revision ${p.approvedRevision}.`,
    );
  const runId = p.jobId ?? previous?.jobId;
  if (runId) {
    let turn = p.conversation.find((t) => t.runId === runId);
    if (!turn)
      turn = appendTurn(p, "run", "Working on your game", {
        runId,
        events: [],
        chargeStart: previous?.charges.length ?? p.charges.length,
      });
    const known = new Set(turn.events?.map((e) => JSON.stringify(e)));
    const baseline = new Set(
      previous?.events.map((e) => JSON.stringify(e)) ?? [],
    );
    for (const event of p.events)
      if (
        !known.has(JSON.stringify(event)) &&
        (!baseline.has(JSON.stringify(event)) || event.at >= turn.at)
      )
        (turn.events ??= []).push(event);
    turn.status = p.jobId ? "running" : p.stage;
    turn.text =
      p.error ??
      (p.jobId
        ? (p.events.at(-1)?.message ?? "Working on your game")
        : p.stage === "ready_to_test"
          ? "Build ready to test in Studio"
          : (p.concept?.playerExperience ??
            p.spec?.summary ??
            p.stage.replaceAll("_", " ")));
    turn.costMicros = p.charges
      .slice(turn.chargeStart ?? 0)
      .reduce((sum, c) => sum + c.chargedMicros, 0);
    if (!p.jobId && p.concept) turn.proposal = structuredClone(p.concept);
    if (!p.jobId && p.spec)
      turn.plan = structuredClone({
        title: p.spec.title,
        summary: p.spec.summary,
        requirements: p.spec.requirements,
        tasks: p.spec.tasks,
      });
    if (
      p.artifact &&
      JSON.stringify(p.artifact) !== JSON.stringify(previous?.artifact)
    ) {
      turn.files = p.artifact.files.map((f) => f.path);
      turn.assets = structuredClone(p.artifact.assets);
      turn.effects = p.artifact.scene
        .filter((n) =>
          ["ParticleEmitter", "Beam", "Trail", "Sound"].includes(n.className),
        )
        .map((n) => `${n.className}: ${n.path}`);
    }
    if (
      p.spec?.architectureProposal &&
      JSON.stringify(p.spec.architectureProposal) !==
        JSON.stringify(previous?.spec?.architectureProposal)
    )
      turn.architecture = structuredClone(p.spec.architectureProposal);
  }
  if (
    p.studioEvidence &&
    JSON.stringify(p.studioEvidence) !==
      JSON.stringify(previous?.studioEvidence)
  )
    appendTurn(
      p,
      "studio",
      `Studio checks: ${p.studioEvidence.checks.map((c) => `${c.id}: ${c.status}`).join(", ")}. These receipts do not establish full gameplay quality.`,
    );
  if (
    p.visualEvidence &&
    p.visualEvidence.dataUrl !== previous?.visualEvidence?.dataUrl
  )
    appendTurn(p, "media", p.visualEvidence.notes, {
      screenshot: p.visualEvidence.dataUrl,
    });
}
