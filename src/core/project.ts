import { randomUUID } from "node:crypto";
import { z } from "zod";
import { generateArtifact, type Artifact } from "./recipe";
export const choicesSchema = z
  .object({
    style: z.enum(["cinder", "jade", "violet"]).optional(),
    device: z.enum(["desktop", "both"]).optional(),
    pace: z.enum(["deliberate", "quick"]).optional(),
  })
  .strict();
export type Choices = z.infer<typeof choicesSchema>;
export const requirements = [
  {
    id: "damage",
    name: "Server-controlled damage",
    detail: "The server selects targets and validates range.",
  },
  {
    id: "cooldown",
    name: "Attack & burst ability",
    detail: "Independent cooldowns with replay rejection.",
  },
  {
    id: "hud",
    name: "Health & ability HUD",
    detail: "Health and cooldown states, keyboard and optional touch.",
  },
  {
    id: "lifecycle",
    name: "Death & respawn",
    detail: "Character state resets and connections are cleaned up.",
  },
  {
    id: "feedback",
    name: "Combat feedback",
    detail: "Procedural hit flash; animation and audio await asset selection.",
  },
  {
    id: "arena",
    name: "Practice arena",
    detail: "Playable floor, spawn points and a practice target.",
  },
];
export type Check = {
  id: string;
  name: string;
  status: "passed" | "pending";
  detail: string;
};
export type Project = {
  id: string;
  request: string;
  name: string;
  revision: number;
  stage: "discovery" | "preview" | "approved" | "built";
  choices: Choices;
  assets: { id: string; kind: string }[];
  approvedRevision: number | null;
  artifact: Artifact | null;
  checks: Check[];
  journal: { event: string; revision: number; at: string }[];
  createdAt: string;
};
function log(p: Project, event: string) {
  p.journal.push({ event, revision: p.revision, at: new Date().toISOString() });
  return p;
}
export function createProject(request: string): Project {
  request = z.string().trim().min(5).max(3000).parse(request);
  if (!/fight|combat|brawl|duel/i.test(request))
    throw Error(
      "This prototype supports combat games. Describe an arena brawler or fighting game.",
    );
  return log(
    {
      id: randomUUID(),
      request,
      name: "Untitled arena",
      revision: 1,
      stage: "discovery",
      choices: {},
      assets: [],
      approvedRevision: null,
      artifact: null,
      checks: [],
      journal: [],
      createdAt: new Date().toISOString(),
    },
    "project.created",
  );
}
function assertRevision(p: Project, revision: number) {
  if (p.revision !== revision)
    throw Error("Revision conflict. Reload the latest project before editing.");
}
export function revise(
  project: Project,
  revision: number,
  changes: Choices,
): Project {
  assertRevision(project, revision);
  const parsed = choicesSchema.parse(changes);
  const p = structuredClone(project);
  p.choices = { ...p.choices, ...parsed };
  p.revision++;
  p.approvedRevision = null;
  p.artifact = null;
  p.checks = [];
  p.stage = "preview";
  p.name =
    p.choices.style === "jade"
      ? "Jade Circuit"
      : p.choices.style === "violet"
        ? "Dusk Arena"
        : "Cinder Arena";
  return log(p, "brief.revised");
}
export function approve(project: Project, revision: number): Project {
  assertRevision(project, revision);
  if (
    !project.choices.style ||
    !project.choices.device ||
    !project.choices.pace
  )
    throw Error("Choose a visual direction, devices and combat pace first.");
  if (project.approvedRevision === project.revision) return project;
  const p = structuredClone(project);
  p.approvedRevision = p.revision;
  p.stage = "approved";
  return log(p, "brief.approved");
}
export function build(project: Project): Project {
  if (project.approvedRevision !== project.revision)
    throw Error("Approve the current brief before building.");
  if (project.artifact) return project;
  const p = structuredClone(project);
  p.artifact = generateArtifact(p.choices);
  p.stage = "built";
  p.checks = [
    {
      id: "contract",
      name: "Brief completeness",
      status: "passed",
      detail: "Required design choices are present and approved.",
    },
    {
      id: "recipe",
      name: "Recipe assembly",
      status: "passed",
      detail:
        "Versioned combat modules and configuration assembled. Runtime behavior is not checked by this build.",
    },
    {
      id: "studio",
      name: "Studio playtest",
      status: "pending",
      detail:
        "Open the exported place in Studio and exercise the acceptance scenarios.",
    },
    {
      id: "assets",
      name: "Animation & sound",
      status: "pending",
      detail:
        "No marketplace assets selected. This slice uses procedural visual feedback.",
    },
  ];
  return log(p, "build.completed");
}
