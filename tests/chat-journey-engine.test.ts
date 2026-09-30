import { it, expect } from "vitest";
import { chatJourneyFixture, chooseJourneyAssets } from "./chat-journey-fixture";
import { buildEstimate } from "../src/web/chat-state";
it("runs the real builder from resolved proposal picks using external doubles", async () => {
  const f = await chatJourneyFixture();
  try {
    const p = await chooseJourneyAssets(f);
    const r = await f.command("approve-proposal", { hash: p.proposal!.hash });
    expect(r.status, JSON.stringify(r.data)).toBe(202);
    const result = await f.app.locals.engine.wait(p.id);
    expect(result.stage, result.error ?? JSON.stringify(result.checks)).toBe("ready_to_test");
    expect(f.control.buildCalls).toBeGreaterThan(0);
    expect(result.charges.filter((c: any) => c.status === "error"), JSON.stringify(f.control.contexts.map((c: any) => ({task:c.task,kind:c.kind})))).toEqual([]);
    const another = f.app.locals.engine.create("A new empty game");
    const history = result.charges.filter((c: any) => c.phase === "builder" && c.status === "ok").reduce((sum: number, c: any) => sum + c.chargedMicros, 0);
    expect(buildEstimate(f.app.locals.engine.store.get(another.id))).toBe(history);
  } finally { await f.close(); }
}, 30000);
