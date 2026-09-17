import { describe, it, expect } from "vitest";
import {
  createProject,
  revise,
  approve,
  build,
  requirements,
} from "../src/core/project";
import { Budget } from "../src/core/budget";

describe("discovery and protected build contract", () => {
  it("recognizes combat dependencies without inventing asset IDs", () => {
    const p = createProject("Make a fighting game with magic");
    expect(p.stage).toBe("discovery");
    expect(requirements.map((x) => x.id)).toEqual(
      expect.arrayContaining([
        "damage",
        "cooldown",
        "hud",
        "lifecycle",
        "feedback",
      ]),
    );
    expect(p.choices).toEqual({});
    expect(p.assets).toEqual([]);
  });
  it("does not pretend an unsupported genre is implemented", () => {
    expect(() => createProject("Build a farming tycoon")).toThrow(/combat/i);
  });
  it("requires choices and explicit approval before building", () => {
    expect(() => build(createProject("fighting game"))).toThrow(/approve/i);
    expect(() => approve(createProject("fighting game"), 1)).toThrow(/choose/i);
  });
  it("invalidates approval and artifacts after a choice changes", () => {
    let p = revise(createProject("fighting game"), 1, {
      style: "cinder",
      device: "both",
      pace: "deliberate",
    });
    p = build(approve(p, p.revision));
    expect(p.stage).toBe("built");
    p = revise(p, p.revision, { pace: "quick" });
    expect(p.approvedRevision).toBeNull();
    expect(p.artifact).toBeNull();
    expect(p.stage).toBe("preview");
  });
  it("rejects stale updates and extra model fields", () => {
    const p = createProject("arena combat");
    expect(() => revise(p, 0, { style: "cinder" })).toThrow(/revision/i);
    expect(() =>
      revise(p, 1, { style: "cinder", damage: 999 } as never),
    ).toThrow();
  });
  it("reopening an approved build is idempotent and preserves its completed state", () => {
    let p = revise(createProject("fighting game"), 1, {
      style: "cinder",
      device: "both",
      pace: "quick",
    });
    p = build(approve(p, p.revision));
    expect(build(approve(p, p.revision))).toEqual(p);
  });
  it("exports parameterized code but does not claim Studio verification", () => {
    let p = revise(createProject("arena brawler"), 1, {
      style: "jade",
      device: "desktop",
      pace: "quick",
    });
    p = build(approve(p, p.revision));
    expect(p.artifact?.files.map((f) => f.path)).toContain(
      "ServerScriptService/Combat.server.luau",
    );
    expect(
      p.checks.some((c) => c.id === "studio" && c.status === "pending"),
    ).toBe(true);
    expect(
      p.artifact?.files.find((f) => f.path.endsWith("Config.luau"))?.source,
    ).toContain("0.45");
    expect(p.journal.map((x) => x.event)).toContain("build.completed");
  });
});
describe("budget reservations", () => {
  it("prevents concurrent calls from overspending", () => {
    const b = new Budget(100);
    const ticket = b.reserve(75);
    expect(() => b.reserve(30)).toThrow(/budget/i);
    b.settle(ticket, 20);
    expect(b.available).toBe(80);
  });
  it("holds reservation when usage is unknown and prevents double accounting", () => {
    const b = new Budget(100);
    const ticket = b.reserve(60);
    b.settle(ticket, null);
    expect(b.available).toBe(40);
    expect(() => b.settle(ticket, 0)).toThrow();
  });
  it("records real usage above estimate and blocks further spend", () => {
    const b = new Budget(100);
    b.settle(b.reserve(50), 120);
    expect(b.spent).toBe(120);
    expect(b.available).toBe(0);
    expect(() => b.reserve(1)).toThrow();
  });
  it.each([-1, NaN, Infinity])("rejects invalid amounts %s", (n) => {
    expect(() => new Budget(n)).toThrow();
  });
});
