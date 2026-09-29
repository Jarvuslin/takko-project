import fs from "node:fs";
import { expect, it } from "vitest";
import { checkWorldScene } from "../src/generation/world-scene-check";
import type { Project } from "../src/generation/schema";
import { newProject } from "../src/generation/store";
const read = (file: string): Project => JSON.parse(fs.readFileSync(file, "utf8"));
const combat = read("docs/results/approved-reference-finish-20260927/terminal-project.json");
const other = read("benchmarks/runs/butter-crunch-marketplace-v6-20260916/grok/final-project.json");
combat.world = newProject(combat.request,8000000).world;
other.world = newProject(other.request,8000000).world;
it("rejects the real invented slab and enclosure and reports overlapping lighting evidence", () => {
  const checks = checkWorldScene(combat.artifact!, combat);
  expect(checks.find(c=>c.id==="world:ui-visibility")?.status).toBe("pending");
  expect(checks.some(c => c.id.includes("ground") && c.status === "failed")).toBe(true);
  expect(checks.some(c => c.id.includes("enclosure") && c.status === "failed")).toBe(true);
  expect(checks.some(c => c.id.includes("lights") && c.status === "failed")).toBe(true);
});
it("checks the other real request's geometry and permits its explicitly requested stage", () => {
  const checks = checkWorldScene(other.artifact!, other);
  expect(checks.find(c=>c.id==="world:ui-visibility")?.status).toBe("pending");
  expect(checks.some(c => c.id.includes("lights") && c.status === "failed")).toBe(true);
  const withoutStageRequest = {...other, request: "Click an object and show the total", answers: {}, briefChanges: []};
  expect(checkWorldScene(other.artifact!, withoutStageRequest).some(c => c.id.includes("ground") && c.status === "failed")).toBe(true);
});
