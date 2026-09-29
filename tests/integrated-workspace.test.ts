import { expect, it, vi } from "vitest";
import * as THREE from "three";
import { createRigScene, disposeScene } from "../src/web/preview/scenes";
import {
  layoutGraph,
  projectGraph,
  systemEvidence,
} from "../src/web/workspace-graph";
import { newProject } from "../src/generation/store";
import { recordConversation } from "../src/generation/conversation";
import type { AnimationClip } from "../src/generation/animation";
import type { GameArchitecture } from "../src/generation/architecture";
import { specification, fixtureBundle } from "./generation-fixtures";
const graph: GameArchitecture = {
  nodes: ["combat", "energy", "hud"].map((id) => ({
    id,
    name: id,
    purpose: "A game system",
    authority: "server",
    x: 0,
    y: 0,
  })),
  edges: [
    {
      id: "hit",
      from: "combat",
      to: "energy",
      kind: "event",
      event: "Hit",
      effect: "Add energy",
    },
    {
      id: "display",
      from: "energy",
      to: "hud",
      kind: "state",
      event: "Energy changes",
      effect: "Display the new value",
    },
  ],
};
it.each(["R6", "R15"] as const)(
  "articulates a real %s hierarchy and frames its entire sampled motion",
  (rig) => {
    const clip: AnimationClip = {
      version: 1,
      name: "Punch",
      rig,
      duration: 1,
      tracks: [
        {
          joint: rig === "R6" ? "Right Arm" : "RightUpperArm",
          keys: [
            { time: 0, rotation: [0, 0, 0] },
            { time: 0.5, rotation: [-1.5, 0, 0.8] },
            { time: 1, rotation: [0, 0, 0] },
          ],
        },
      ],
    };
    const scene = createRigScene(clip);
    const joint = scene.root.getObjectByName(clip.tracks[0].joint)!;
    expect(joint.parent?.name).toBe(rig === "R6" ? "Torso" : "UpperTorso");
    const mesh = joint.children[0] as THREE.Mesh;
    expect(mesh.isMesh).toBe(true);
    const before = mesh.getWorldPosition(new THREE.Vector3());
    scene.update!(0.5);
    expect(
      mesh.getWorldPosition(new THREE.Vector3()).distanceTo(before),
    ).toBeGreaterThan(0.1);
    for (let i = 0; i <= 100; i++) {
      scene.update!(i / 100);
      const box = new THREE.Box3().setFromObject(scene.root);
      expect(scene.bounds!.clone().expandByScalar(0.02).containsBox(box)).toBe(
        true,
      );
    }
    const spy = vi.spyOn(mesh.geometry, "dispose");
    disposeScene(scene.root);
    expect(spy).toHaveBeenCalledOnce();
  },
);
it("lays out cyclic graphs deterministically without changing contracts", () => {
  const cycle = {
    ...graph,
    edges: [
      ...graph.edges,
      {
        id: "again",
        from: "hud",
        to: "combat",
        kind: "event" as const,
        event: "Retry",
        effect: "Start again",
      },
    ],
  };
  const a = layoutGraph(cycle);
  expect(a).toEqual(layoutGraph(cycle));
  expect(new Set(a.nodes.map((n) => `${n.x},${n.y}`)).size).toBe(3);
  expect(a.edges).toEqual(cycle.edges);
});
it("shows new proposed systems while preserving saved system meaning", () => {
  const p = newProject("Combat", 500000);
  p.architecture = {
    nodes: graph.nodes.slice(0, 2),
    edges: graph.edges.slice(0, 1),
  };
  p.spec = {
    ...specification(p.request, p.scope),
    architectureProposal: {
      ...graph,
      nodes: graph.nodes.map((n) => ({
        ...n,
        purpose: "Proposed replacement",
      })),
    },
  };
  const view = projectGraph(p);
  expect(view.nodes).toHaveLength(3);
  expect(view.nodes[0].purpose).toBe("A game system");
  expect(view.edges).toHaveLength(2);
});
it("does not invent nodes or runtime edges from a build task DAG", () => {
  const p = newProject("Combat", 500000);
  p.spec = specification(p.request, p.scope);
  delete p.spec.architectureProposal;
  expect(projectGraph(p)).toEqual({ nodes: [], edges: [] });
  expect(systemEvidence(p, "unknown").status).toBe("Design");
});
it("keeps asset and effect receipts at their actual run revision", () => {
  const p = newProject("Combat", 500000);
  recordConversation(p);
  p.jobId = "run";
  const previous = structuredClone(p);
  recordConversation(p);
  p.jobId = null;
  p.artifact = fixtureBundle(p.request, p.scope);
  p.artifact.assets = [
    {
      id: "sound",
      requirementId: "r1",
      kind: "audio",
      assetId: null,
      sourceUrl: null,
      status: "needed",
      description: "Attack sound",
    },
  ];
  p.artifact.scene.push({
    path: "Workspace/Effect",
    className: "ParticleEmitter",
    properties: {},
  });
  recordConversation(p, previous);
  const turn = p.conversation!.find((t) => t.runId === "run")!;
  expect(turn.assets?.[0].status).toBe("needed");
  expect(turn.effects).toContain("ParticleEmitter: Workspace/Effect");
  p.artifact.assets[0].status = "provided";
  expect(turn.assets?.[0].status).toBe("needed");
});
it("does not misattribute an unchanged older build to a new planning run", () => {
  const p = newProject("Combat", 500000);
  p.artifact = fixtureBundle(p.request, p.scope);
  recordConversation(p);
  const previous = structuredClone(p);
  p.jobId = "new-plan";
  recordConversation(p, previous);
  expect(
    p.conversation!.find((t) => t.runId === "new-plan")?.files,
  ).toBeUndefined();
});
