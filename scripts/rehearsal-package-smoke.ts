import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { withRehearsalPackage } from "./rehearsal-package";
import { rehearsalKey } from "../desktop/rehearsal";

let calls = 0;
const result = await withRehearsalPackage(
  "smoke",
  async (request) => {
    calls++;
    const pathname = new URL(request.url).pathname;
    if (pathname === "/api/v1/key")
      return Response.json({ data: { label: "offline", limit: 0, usage: 0 } });
    assert.equal(pathname, "/api/v1/models");
    return Response.json({ data: [] });
  },
  async ({ request, origin }) => {
    assert.deepEqual(await request("/api/projects"), []);
    const id = randomUUID();
    await request(
      "/api/models",
      {
        profiles: [
          {
            id,
            name: "Offline rehearsal",
            provider: "openrouter",
            baseUrl: "https://openrouter.ai/api/v1",
            model: "anthropic/claude-sonnet-5.5",
            inputRate: 2,
            outputRate: 10,
            maxOutputTokens: 8192,
          },
        ],
        routes: { planner: [id], builder: [id], reviewer: [id], repair: [id] },
        budgetMicros: 7500000,
        repairLimit: 0,
      },
      "PUT",
    );
    await request(`/api/models/${id}/key`, { key: rehearsalKey }, "PUT");
    await request(`/api/models/${id}/catalog`);
    assert.equal(calls, 2);
    await request(
      `/api/models/${id}/key`,
      { key: "unapproved-offline-sentinel" },
      "PUT",
    );
    const denied = await fetch(origin + `/api/models/${id}/catalog`);
    assert.equal(denied.status, 400);
    assert.equal(
      calls,
      2,
      "Rejected credentials must never reach any transport",
    );
    return {
      checks: [
        "staged packaged identity",
        "isolated real API",
        "fake-key catalog intercepted",
        "unexpected credentials denied",
        "no credential vault",
        "owned app closes normally",
      ],
      calls,
      actualCost: 0,
      realProviderCalls: 0,
    };
  },
);
console.log(JSON.stringify(result, null, 2));
