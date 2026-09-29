import type { Project } from "../../generation/schema";
import {
  animationClipSchema,
  type SavedAnimation,
} from "../../generation/animation";
import walk from "./walk.json";

export const importedWalk: SavedAnimation = {
  id: "design-lab-walk",
  source: "user-import",
  revision: 1,
  at: "2026-09-21T00:00:00Z",
  clip: animationClipSchema.parse(walk),
};

/** Separate namespace and in-memory project. Never passed to a server API. */
export function createLabProject(): Project {
  return {
    schemaVersion: 2,
    id: `design-lab-${crypto.randomUUID()}`,
    name: "Arena / First playable",
    request: "Build a small arena where confirmed hits charge an ability.",
    revision: 1,
    scope: "Design sandbox",
    spec: null,
    answers: {},
    approvedRevision: null,
    stage: "draft",
    artifact: null,
    review: null,
    checks: [],
    charges: [],
    budgetMicros: 5_000_000,
    reservedMicros: 0,
    events: [],
    jobId: null,
    error: null,
    createdAt: "2026-09-21T00:00:00Z",
    studioEvidence: null,
    architecture: {
      nodes: [
        {
          id: "combat",
          name: "Combat",
          authority: "server",
          purpose: "Validate attacks on the server and report confirmed hits.",
          x: 40,
          y: 55,
        },
        {
          id: "energy",
          name: "Energy",
          authority: "server",
          purpose: "Add ten energy to the attacker after a confirmed hit.",
          x: 300,
          y: 205,
        },
        {
          id: "abilities",
          name: "Abilities",
          authority: "client",
          purpose:
            "Show the player's energy meter and unlock the ability at full charge.",
          x: 560,
          y: 55,
        },
      ],
      edges: [
        {
          id: "hit",
          from: "combat",
          to: "energy",
          event: "Hit confirmed",
          effect: "Add ten energy after server validation.",
          kind: "event",
        },
        {
          id: "charge",
          from: "energy",
          to: "abilities",
          event: "Energy changed",
          effect: "Update the meter and show Ready at full charge.",
          kind: "state",
        },
      ],
    },
  };
}

export const directions = {
  A: {
    name: "Refined Takko",
    idea: "Familiar, with room to focus.",
    description:
      "Clear panels, considered spacing and a calmer version of the workspace you know.",
    tradeoff: "More visible structure. Less change to your existing workflow.",
  },
  B: {
    name: "AI Native",
    idea: "A conversation that builds.",
    description:
      "A quieter canvas and a spacious agent feed, with the work and its results in focus.",
    tradeoff: "Fewer controls on the surface. Details take one more click.",
  },
  C: {
    name: "Game Dev",
    idea: "See how your game works.",
    description:
      "Precise nodes, connected systems and contextual tools, with the canvas leading the experience.",
    tradeoff:
      "More information at a glance. A slightly denser creative workspace.",
  },
} as const;
export type Direction = keyof typeof directions;
export type RunState = "queued" | "working" | "finished" | "failed";
