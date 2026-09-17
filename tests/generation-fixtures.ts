import { randomUUID } from "node:crypto";
import type { Bundle, Profile, Review, Spec } from "../src/generation/schema";
export const profile = (
  provider: Profile["provider"] = "compatible",
): Profile => ({
  id: randomUUID(),
  name: "Fixture",
  provider,
  baseUrl: "http://127.0.0.1:1234/v1",
  model: "fixture",
  inputRate: 1,
  outputRate: 2,
  maxOutputTokens: 2048,
  jsonMode: true,
});
export function specification(request: string, scope: string): Spec {
  return {
    title: request.includes("farm")
      ? "Orchard"
      : request.includes("racing")
        ? "Velocity"
        : "Windfall",
    summary: request,
    visualDirection: "Readable silhouettes and warm lighting",
    requirements: [
      {
        id: "core",
        description: request,
        sourceQuote: request,
        origin: "user",
        category: "mechanic",
        priority: "required",
        acceptance: "The core gameplay state is observable.",
      },
    ],
    questions: [],
    tasks: [
      {
        id: "coreTask",
        title: "Implement core loop",
        requirements: ["core"],
        dependsOn: [],
        files: ["ServerScriptService/" + scope + "/Game.server.luau"],
      },
    ],
  };
}
export function fixtureBundle(request: string, scope: string): Bundle {
  const mechanic = request.includes("farm")
    ? "Harvest"
    : request.includes("racing")
      ? "Lap"
      : "Glide";
  const file = "ServerScriptService/" + scope + "/Game.server.luau";
  return {
    files: [
      {
        path: file,
        kind: "Script",
        source: `local state = Instance.new("IntValue")\nstate.Name = "${mechanic}"\nstate.Value = 1\nstate.Parent = script.Parent\n`,
      },
    ],
    scene: [
      {
        path: "Workspace/" + scope + "/Ground",
        className: "Part",
        properties: {
          Anchored: true,
          Size: { type: "Vector3", value: [40, 1, 40] },
          Color: { type: "Color3", value: [0.2, 0.4, 0.3] },
        },
      },
    ],
    coverage: [
      {
        requirementId: "core",
        status: "implemented",
        detail: "Fixture state installed",
        files: [file],
      },
    ],
    assets: [],
  };
}
export const fixtureReview: Review = {
  issues: [],
  tests: [
    {
      id: "coreTest",
      requirementId: "core",
      mode: "server",
      source:
        'return function(ctx) assert(game:GetService("ServerScriptService"):FindFirstChild(ctx.scope), "Missing generated scope") end',
    },
  ],
};
export function fakeTransport(
  options: {
    question?: boolean;
    broken?: boolean;
    repairWorks?: boolean;
    delay?: number;
    inspect?: (phase: string, context: any) => void;
  } = {},
): typeof fetch {
  return (async (_url, init) => {
    if (options.delay) await new Promise((r) => setTimeout(r, options.delay));
    if (init?.signal?.aborted) throw Error("aborted");
    const body = JSON.parse(String(init?.body));
    const system = body.messages[0].content;
    const context = JSON.parse(
      body.messages[1].content.split(
        "\nYour last response failed validation.",
      )[0],
    );
    const phase = /PHASE: (\w+)/.exec(system)![1];
    options.inspect?.(phase, context);
    let output: unknown;
    if (phase === "planner") {
      const spec = specification(context.request, context.namespace);
      if (options.question && !context.answers.device)
        spec.questions = [
          {
            id: "device",
            prompt: "Which devices?",
            options: ["Desktop", "Mobile"],
          },
        ];
      if (options.question && context.answers.device) {
        spec.requirements[0].sourceQuote = "device: " + context.answers.device;
      }
      output = spec;
    } else if (phase === "reviewer") output = fixtureReview;
    else {
      const b = fixtureBundle(context.request, context.namespace);
      if (options.broken && (phase !== "repair" || !options.repairWorks))
        b.files[0].source = "local = broken";
      output = b;
    }
    return Response.json({
      choices: [
        { finish_reason: "stop", message: { content: JSON.stringify(output) } },
      ],
      usage: { prompt_tokens: 100, completion_tokens: 200 },
    });
  }) as typeof fetch;
}
