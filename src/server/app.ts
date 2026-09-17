import express from "express";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import { GenerationStore } from "../generation/store";
import { Configuration } from "../generation/settings";
import { Engine } from "../generation/engine";
import { Bridge } from "../generation/bridge";
import { modelCatalog } from "../generation/providers";
import { exportBundle, xml } from "../generation/export";
import { projectComponents } from "../generation/component-integration";
import { attachVisual } from "../generation/visual";
import { StdioStudioClient } from "../generation/studio-mcp-client";
import { StudioAssetAdapter } from "../generation/studio-asset-adapter";
import { createStudioAudioCapture } from "../generation/audio-capture";
import type { AssetAdapter } from "../generation/asset-contract";
import type { Project } from "../generation/schema";
export function createApp(
  directory: string,
  options: {
    transport?: typeof fetch;
    env?: NodeJS.ProcessEnv;
    pluginPath?: string;
    audioHelperPath?: string;
    assetAdapterFactory?: (
      project: Project,
    ) => Promise<{ adapter: AssetAdapter; close: () => Promise<void> }>;
  } = {},
) {
  const app = express(),
    store = new GenerationStore(directory),
    config = new Configuration(path.join(directory, "configuration"));
  config.importEnvironment(options.env ?? {});
  const assetAdapterFactory =
    options.assetAdapterFactory ??
    (async (p: Project) => {
      if (!p.assetStudioId) throw Error("Select a Studio for asset execution");
      const client = new StdioStudioClient();
      const evidenceDirectory = path.join(directory, "asset-evidence", p.id);
      const adapter = new StudioAssetAdapter(client, {
        studioId: p.assetStudioId,
        scope: p.scope,
        evidenceDirectory,
        audioCapture: createStudioAudioCapture(client, {
          helperPath:
            options.audioHelperPath ??
            path.resolve(".forge/tools/audio-capture/TakkoAudioCapture.exe"),
          evidenceDirectory,
        }),
      });
      return { adapter, close: () => client.close() };
    });
  const engine = new Engine(
      store,
      config,
      options.transport,
      undefined,
      assetAdapterFactory,
    ),
    bridge = new Bridge(store);
  app.locals.engine = engine;
  app.locals.config = config;
  app.locals.bridge = bridge;
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    if (!/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.get("host") ?? ""))
      return res.status(403).json({ error: "Local connections only" });
    const origin = req.get("origin");
    if (origin && origin !== `http://${req.get("host")}`)
      return res.status(403).json({ error: "Untrusted origin" });
    if (req.get("sec-fetch-site") === "cross-site")
      return res
        .status(403)
        .json({ error: "Cross-site requests are not accepted" });
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "2mb" }));
  app.get("/api/status", (_req, res) =>
    res.json({
      mode: "multi-model",
      configured: config.read().profiles.length > 0,
      studios: bridge.list(),
    }),
  );
  app.get("/api/models", (_req, res) => res.json(config.public()));
  app.get("/api/asset-studios", async (_req, res) => {
    const client = new StdioStudioClient();
    try {
      res.json(await client.callTool("list_roblox_studios", {}));
    } catch (error) {
      res.status(503).json({
        error:
          error instanceof Error ? error.message : "Studio MCP unavailable",
      });
    } finally {
      await client.close();
    }
  });
  app.put("/api/models", (req, res) => res.json(config.save(req.body)));
  app.put("/api/models/:id/key", (req, res) => {
    config.setKey(
      req.params.id,
      z
        .object({ key: z.string().max(1000) })
        .strict()
        .parse(req.body).key,
    );
    res.json({ saved: true });
  });
  app.get("/api/models/:id/catalog", async (req, res) => {
    try {
      res.json(
        await modelCatalog(
          config.profile(req.params.id),
          config.key(req.params.id),
          options.transport,
        ),
      );
    } catch {
      res.status(400).json({
        error:
          "Could not fetch the model catalog. Check the endpoint and API key.",
      });
    }
  });
  app.get("/api/projects", (_req, res) =>
    res.json(
      store.list().map((p) => ({
        id: p.id,
        name: p.name,
        stage: p.stage,
        createdAt: p.createdAt,
      })),
    ),
  );
  app.post("/api/projects", (req, res) =>
    res
      .status(201)
      .json(
        engine.create(
          z.object({ request: z.string() }).strict().parse(req.body).request,
        ),
      ),
  );
  app.use("/api/projects/:id", (req, _res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD")
      bridge.assertProjectWritable(String(req.params.id));
    next();
  });
  app.get("/api/projects/:id", (req, res) =>
    res.json(store.get(req.params.id)),
  );
  app.post("/api/projects/:id/asset-studio", (req, res) => {
    const body = z
      .object({ revision: z.number().int(), studioId: z.uuid() })
      .strict()
      .parse(req.body);
    res.json(
      engine.bindAssetStudio(req.params.id, body.revision, body.studioId),
    );
  });
  app.get("/api/projects/:id/asset-evidence/:file", (req, res) => {
    const id = z.uuid().parse(req.params.id);
    store.get(id);
    const file = z
      .string()
      .regex(/^[a-f0-9]{64}\.(png|jpg|jpeg|webp|wav)$/)
      .parse(req.params.file);
    const target = path.resolve(directory, "asset-evidence", id, file);
    if (!fs.existsSync(target))
      return res.status(404).json({ error: "Capture not found" });
    res.sendFile(target);
  });
  app.post("/api/projects/:id/visual", (req, res) =>
    res.json(store.save(attachVisual(store.get(req.params.id), req.body))),
  );
  app.patch("/api/projects/:id", (req, res) => {
    const b = z
      .object({
        revision: z.number().int(),
        request: z.string(),
        answers: z.record(z.string(), z.string()),
      })
      .strict()
      .parse(req.body);
    res.json(engine.revise(req.params.id, b.revision, b.request, b.answers));
  });
  app.post("/api/projects/:id/approve", (req, res) =>
    res.json(
      engine.approve(
        req.params.id,
        z.object({ revision: z.number().int() }).strict().parse(req.body)
          .revision,
      ),
    ),
  );
  for (const action of ["plan", "build", "repair"] as const)
    app.post("/api/projects/:id/" + action, (req, res) =>
      res
        .status(202)
        .json(
          engine.start(
            String(req.params.id),
            z.object({ revision: z.number().int() }).strict().parse(req.body)
              .revision,
            action,
          ),
        ),
    );
  app.post("/api/projects/:id/cancel", (req, res) =>
    res.json(engine.cancel(req.params.id)),
  );
  app.get("/api/projects/:id/export", (req, res) => {
    const p = store.get(req.params.id);
    if (
      p.jobId ||
      !["ready_to_test", "verified"].includes(p.stage) ||
      !p.artifact ||
      p.approvedRevision !== p.revision ||
      p.checks.some((c) => c.status === "failed")
    )
      throw Error("Build and resolve checks before export");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="Takko-' + p.id.slice(0, 8) + '.rbxlx"',
    );
    res.type("application/xml").send(
      exportBundle(
        p.artifact,
        p.scope,
        projectComponents(p, path.join(directory, "asset-evidence", p.id)).map(
          (c) => c.xml,
        ),
      ),
    );
  });
  app.get("/api/studio/pairing", (_req, res) =>
    res.json({ token: bridge.pairing() }),
  );
  app.get("/api/studio/plugin", (req, res) => {
    const source = fs
      .readFileSync(
        options.pluginPath ?? path.resolve("plugin/Forge.plugin.luau"),
        "utf8",
      )
      .replace("http://127.0.0.1:4318", `http://${req.get("host")}`);
    res.setHeader("Content-Disposition", 'attachment; filename="Takko.rbxmx"');
    res
      .type("application/xml")
      .send(
        `<roblox version="4"><External>null</External><External>nil</External><Item class="Script" referent="RBX0"><Properties><string name="Name">Takko</string><ProtectedString name="Source">${xml(source)}</ProtectedString></Properties></Item></roblox>`,
      );
  });
  app.post("/api/projects/:id/studio", (req, res) => {
    const b = z
      .object({ studioId: z.uuid(), kind: z.enum(["apply", "test"]) })
      .strict()
      .parse(req.body);
    res.status(202).json(bridge.enqueue(req.params.id, b.studioId, b.kind));
  });
  app.use("/api/bridge", (req, res, next) => {
    if (
      !bridge.authorized(
        (req.get("authorization") ?? "").replace(/^Bearer /, ""),
      )
    )
      return res.status(401).json({ error: "Pair the Studio plugin first" });
    next();
  });
  app.post("/api/bridge/connect", (req, res) => {
    const b = z
      .object({
        name: z.string().min(1).max(160),
        protocolVersion: z.number().int().min(1).max(2).optional(),
        capabilities: z
          .array(z.enum(["apply", "test"]))
          .max(2)
          .optional(),
      })
      .strict()
      .parse(req.body);
    res.json(
      bridge.connect(b.name, {
        protocolVersion: b.protocolVersion ?? 1,
        capabilities: b.capabilities ?? [],
      }),
    );
  });
  app.get("/api/bridge/:id/operations/:operationId", (req, res) =>
    res.json(bridge.status(req.params.id, req.params.operationId)),
  );
  app.get("/api/bridge/:id/poll", (req, res) =>
    res.json({ operation: bridge.poll(req.params.id) }),
  );
  app.post("/api/bridge/:id/result", (req, res) =>
    res.json(bridge.result(req.params.id, req.body)),
  );
  app.post("/api/studio/:id/operations/:operationId/cancel", (req, res) =>
    res.json(bridge.cancel(req.params.id, req.params.operationId)),
  );
  app.use("/api", (_req, res) =>
    res.status(404).json({ error: "Endpoint not found" }),
  );
  app.use(
    (
      error: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res
        .status(
          error instanceof z.ZodError
            ? 400
            : /revision|approve|budget|configure|build|already|plan the|unresolved Studio operation/i.test(
                  error.message,
                )
              ? 409
              : /not found/i.test(error.message)
                ? 404
                : 400,
        )
        .json({
          error:
            error instanceof z.ZodError
              ? "Invalid request. Check the supplied fields."
              : error.message,
        });
    },
  );
  return app;
}
