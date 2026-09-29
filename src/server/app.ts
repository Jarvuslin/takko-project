import { proposalQuestions } from "../generation/proposal-questions";
import { stepRetry } from "../generation/retry";
import express from "express";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import { GenerationStore } from "../generation/store";
import {
  Configuration,
  validateProviderEndpoint,
} from "../generation/settings";
import {
  settingsSchema,
  providerSchema,
  presetSchema,
} from "../generation/schema";
import { Engine, type ExecutionPolicy } from "../generation/engine";
import { createOpenCodeBackend } from "../generation/opencode-runtime";
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
import { AssetLibrary, type MarketplaceProvider } from "../marketplace/library";
import { StudioMarketplace } from "../marketplace/studio";
import { marketplaceRoutes } from "../marketplace/routes";
import { discoveryRoutes } from "../marketplace/discovery-routes";
import { pickingRoutes } from "../marketplace/picking-routes";
import { attachmentInputSchema } from "../marketplace/types";
import { RequestError, ConflictError } from "../errors";
import { architectureSchema } from "../generation/architecture";
import { animationClipSchema } from "../generation/animation";
import { appendTurn } from "../generation/conversation";
import { refreshProposal } from "../generation/proposal";
import { animationPackSchema } from "../marketplace/animations";
import { parseAssetReference } from "../marketplace/types";
import { randomUUID } from "node:crypto";
import type { CredentialVault } from "../generation/credential-vault";
import { validateProviderKey } from "../generation/provider-connection";
import { UiPreferences } from "../generation/ui-preferences";
export function createApp(
  directory: string,
  options: {
    transport?: typeof fetch;
    credentialVault?: CredentialVault;
    executionPolicy?: ExecutionPolicy;
    env?: NodeJS.ProcessEnv;
    pluginPath?: string;
    audioHelperPath?: string;
    marketplaceProvider?: MarketplaceProvider;
    assetAdapterFactory?: (
      project: Project,
    ) => Promise<{ adapter: AssetAdapter; close: () => Promise<void> }>;
  } = {},
) {
  const app = express(),
    store = new GenerationStore(directory),
    config = new Configuration(
      path.join(directory, "configuration"),
      options.credentialVault,
    );
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
      {
        coordinated: true,
        ...(options.env?.FORGE_OPENCODE_BINARY
          ? {
              opencode: createOpenCodeBackend(
                options.env.FORGE_OPENCODE_BINARY,
              ),
            }
          : {}),
        ...options.executionPolicy,
      },
    ),
    bridge = new Bridge(store);
  engine.mutationBlocker = (id) =>
    bridge
      .projectOperations(id)
      .some((op) => ["queued", "dispatched", "unknown"].includes(op.state))
      ? "A Studio operation is active or has an unknown outcome. Wait, cancel or reconcile it before editing or building. Your request remains a draft."
      : undefined;
  app.locals.engine = engine;
  app.locals.config = config;
  app.locals.bridge = bridge;
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    const json = res.json.bind(res);
    res.json = (body: any) => {
      if (body?.schemaVersion === 2 && body.proposal)
        body = { ...body, clarificationQuestions: proposalQuestions(body) };
      if (body?.schemaVersion === 2 && Array.isArray(body.conversation)) {
        const turns = body.conversation;
        return json({
          ...body,
          ...(body.implementationBackup
            ? { artifact: body.implementationBackup.artifact }
            : {}),
          implementationBackup: undefined,
          implementationCandidate: undefined,
          conversation: turns.slice(-30),
          conversationBefore:
            turns.length > 30 ? turns[turns.length - 30].id : null,
        });
      }
      return json(body);
    };
    next();
  });
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
  const assetLibrary = new AssetLibrary(
    path.join(directory, "asset-library"),
    options.marketplaceProvider ?? new StudioMarketplace(),
  );
  app.locals.assetLibrary = assetLibrary;
  marketplaceRoutes(app, assetLibrary);
  app.get("/api/status", (_req, res) =>
    res.json({
      mode: "multi-model",
      concepts: true,
      proposals: true,
      assetChoices: true,
      studioConnectionGate: true,
      configured: config.read().profiles.length > 0,
      studios: bridge.list(),
    }),
  );
  app.get("/api/models", (_req, res) => res.json(config.public()));
  const uiPreferences = new UiPreferences(
    path.join(directory, "configuration"),
  );
  app.get("/api/ui-preferences", (_req, res) => res.json(uiPreferences.read()));
  app.put("/api/ui-preferences", (req, res) =>
    res.json(uiPreferences.write(req.body)),
  );
  app.post("/api/provider-connections", async (req, res) => {
    const { profile, key } = z
      .object({
        profile: providerSchema,
        key: z.string().trim().min(1).max(1000).optional(),
      })
      .strict()
      .parse(req.body);
    validateProviderEndpoint(profile);
    const legacy = config
      .read()
      .profiles.find(
        (p) =>
          p.provider === profile.provider &&
          p.baseUrl.replace(/\/$/, "") === profile.baseUrl.replace(/\/$/, "") &&
          config.key(p.id),
      );
    const candidate =
      key ??
      (config.providerKey(profile) || (legacy ? config.key(legacy.id) : ""));
    try {
      await validateProviderKey(profile, candidate, options.transport);
    } catch {
      if (!key) config.invalidate(profile);
      return res.status(400).json({
        error:
          "Could not validate this provider. Check the key, endpoint and network connection. Your previous saved key has not been replaced.",
      });
    }
    config.connect(profile, candidate);
    res.json(config.public());
  });
  app.delete("/api/provider-connections", (req, res) => {
    const { profile } = z
      .object({ profile: providerSchema })
      .strict()
      .parse(req.body);
    config.disconnect(profile);
    res.json(config.public());
  });
  app.get("/api/asset-studios", async (_req, res) => {
    const client = new StdioStudioClient();
    try {
      res.json(await client.callTool("list_roblox_studios", {}));
    } catch (error) {
      res.status(503).json({
        error: "Studio MCP unavailable. Check the Studio connection.",
      });
    } finally {
      await client.close();
    }
  });
  app.put("/api/models", (req, res) => res.json(config.save(req.body)));
  app.put("/api/model-presets/:id", (req, res) => {
    const preset = presetSchema.parse(req.body);
    if (preset.id !== req.params.id)
      throw new RequestError("Preset identity does not match");
    const current = config.read();
    const { id, name: _name, icon: _icon, ...options } = preset;
    const exists = current.presets?.some((p) => p.id === id);
    res.json(
      config.save({
        ...current,
        ...(current.activePresetId === id ? options : {}),
        presets: exists
          ? current.presets!.map((p) => (p.id === id ? preset : p))
          : [...(current.presets ?? []), preset],
      }),
    );
  });
  app.post("/api/model-presets/:id/activate", (req, res) => {
    const current = config.read();
    const preset = current.presets?.find((p) => p.id === req.params.id);
    if (!preset) throw new RequestError("Preset not found");
    const { id, name: _name, icon: _icon, ...options } = preset;
    // Clear optional limits from the previous preset before copying the next.
    res.json(
      config.save({
        ...current,
        generationBudgetMicros: undefined,
        reservationBudgetMicros: undefined,
        researchEnabled: undefined,
        ...options,
        activePresetId: id,
      }),
    );
  });
  app.delete("/api/model-presets/:id", (req, res) => {
    const current = config.read();
    if (!current.presets?.some((p) => p.id === req.params.id))
      throw new RequestError("Preset not found");
    if (current.activePresetId === req.params.id)
      throw new RequestError(
        "Choose another preset before removing the active one",
      );
    res.json(
      config.save({
        ...current,
        presets: current.presets.filter((p) => p.id !== req.params.id),
      }),
    );
  });
  app.post("/api/model-catalog", async (req, res) => {
    const input = z
      .object({
        profile: providerSchema,
        key: z.string().max(1000).optional(),
        sourceId: z.uuid().optional(),
      })
      .strict()
      .parse(req.body);
    validateProviderEndpoint(input.profile);
    let key = input.key ?? config.providerKey(input.profile);
    if (input.sourceId && input.key === undefined) {
      const source = config.profile(input.sourceId);
      if (
        source.provider !== input.profile.provider ||
        source.baseUrl !== input.profile.baseUrl
      )
        throw new RequestError(
          "Catalog connection must match the provider and endpoint",
        );
      key = config.key(source.id);
    }
    try {
      await validateProviderKey(input.profile, key, options.transport);
      res.json(await modelCatalog(input.profile, key, options.transport));
    } catch {
      config.invalidate(input.profile);
      res.status(502).json({
        error:
          "Could not load the model catalog. Check the provider connection or enter a model ID manually.",
      });
    }
  });
  app.patch("/api/models", (req, res) => {
    const patch = settingsSchema
      .omit({ profiles: true, presets: true, activePresetId: true })
      .partial()
      .extend({
        routes: settingsSchema.shape.routes.partial().optional(),
      })
      .strict()
      .parse(req.body);
    const current = config.read();
    const nextRoutes = { ...current.routes, ...patch.routes };
    res.json(
      config.save({
        ...current,
        ...patch,
        routes: nextRoutes,
        presets: current.presets?.map((p) =>
          p.id === current.activePresetId
            ? { ...p, ...patch, routes: nextRoutes }
            : p,
        ),
      }),
    );
  });
  app.put("/api/model-profiles/:id", async (req, res) => {
    const input = z
      .object({
        profile: providerSchema,
        key: z.string().max(1000).optional(),
        copyKeyFrom: z.uuid().optional(),
      })
      .strict()
      .parse(req.body);
    if (input.profile.id !== req.params.id)
      throw new RequestError("Model profile identity does not match");
    if (input.key !== undefined && input.copyKeyFrom)
      throw new RequestError("Choose a key or an existing connection");
    if (input.copyKeyFrom) {
      const source = config.profile(input.copyKeyFrom);
      if (
        source.provider !== input.profile.provider ||
        source.baseUrl !== input.profile.baseUrl ||
        !config.key(source.id)
      )
        throw new RequestError(
          "Choose a connected profile with the same provider and endpoint",
        );
    }
    const current = config.read();
    const exists = current.profiles.some((p) => p.id === input.profile.id);
    const previous = current.profiles.find((p) => p.id === input.profile.id);
    if (
      !exists ||
      input.key !== undefined ||
      input.copyKeyFrom ||
      previous?.provider !== input.profile.provider ||
      previous?.baseUrl !== input.profile.baseUrl
    ) {
      validateProviderEndpoint(input.profile);
      const key =
        input.key ??
        (input.copyKeyFrom
          ? config.key(input.copyKeyFrom)
          : config.providerKey(input.profile));
      if (
        !config.isValidated(input.profile) ||
        input.key !== undefined ||
        input.copyKeyFrom
      ) {
        try {
          await validateProviderKey(input.profile, key, options.transport);
        } catch {
          throw new RequestError(
            "Validate your provider key before adding a model.",
          );
        }
        config.connect(input.profile, key);
      }
    }
    config.save({
      ...current,
      profiles: exists
        ? current.profiles.map((p) =>
            p.id === input.profile.id ? input.profile : p,
          )
        : [...current.profiles, input.profile],
    });
    if (input.key !== undefined) config.setKey(input.profile.id, input.key);
    if (input.copyKeyFrom) config.copyKey(input.copyKeyFrom, input.profile.id);
    res.json(config.public());
  });
  app.delete("/api/model-profiles/:id", (req, res) => {
    const current = config.read();
    config.profile(req.params.id);
    res.json(
      config.save({
        ...current,
        profiles: current.profiles.filter((p) => p.id !== req.params.id),
        presets: current.presets?.map((p) => ({
          ...p,
          routes: Object.fromEntries(
            Object.entries(p.routes).map(([phase, route]) => [
              phase,
              route?.filter((id) => id !== req.params.id),
            ]),
          ),
        })),
        routes: Object.fromEntries(
          Object.entries(current.routes).map(([phase, route]) => [
            phase,
            route?.filter((id) => id !== req.params.id),
          ]),
        ),
      }),
    );
  });
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
      await validateProviderKey(
        config.profile(req.params.id),
        config.key(req.params.id),
        options.transport,
      );
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
  app.post("/api/projects", (req, res) => {
    const b = z
      .object({
        request: z.string(),
        assetAttachments: attachmentInputSchema.optional(),
      })
      .strict()
      .parse(req.body);
    const attachments = b.assetAttachments
      ? assetLibrary.attachments(b.assetAttachments)
      : undefined;
    res.status(201).json(engine.create(b.request, attachments));
  });
  app.use("/api/projects/:id", (req, _res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD" && req.path !== "/messages")
      bridge.assertProjectWritable(String(req.params.id));
    next();
  });
  app.get("/api/projects/:id", (req, res) =>
    res.json(store.get(req.params.id)),
  );
  discoveryRoutes(app, store, engine, assetLibrary);
  app.post("/api/projects/:id/platform",(req,res)=>{
    const b=z.object({revision:z.number().int().positive(),answer:z.string().trim().min(1).max(1200)}).strict().parse(req.body);
    res.json(engine.answerPlatform(req.params.id,b.revision,b.answer));
  });
  pickingRoutes(app, store, engine, assetLibrary);
  app.get("/api/projects/:id/conversation", (req, res) => {
    const p = store.get(req.params.id);
    const turns = p.conversation ?? [];
    const limit = z.coerce
      .number()
      .int()
      .min(1)
      .max(50)
      .parse(req.query.limit ?? 30);
    const before =
      req.query.before === undefined
        ? turns.length
        : turns.findIndex((t) => t.id === req.query.before);
    if (before < 0)
      throw new RequestError("Conversation cursor not found", 400);
    const start = Math.max(0, before - limit);
    res.json({
      turns: turns.slice(start, before),
      before: start > 0 ? turns[start].id : null,
    });
  });
  app.get("/api/projects/:id/studio-operations", (req, res) =>
    res.json(bridge.projectOperations(req.params.id)),
  );
  app.post("/api/projects/:id/messages", (req, res) => {
    const b = z
      .object({
        revision: z.number().int(),
        id: z.uuid(),
        text: z.string().trim().min(1).max(6000),
        answers: z
          .record(z.string().max(80), z.string().trim().min(1).max(3000))
          .optional(),
        assetAttachments: attachmentInputSchema.optional(),
      })
      .strict()
      .parse(req.body);
    res.json(
      engine.submitChange(
        req.params.id,
        b.revision,
        b.id,
        { text: b.text, ...(b.answers ? { answers: b.answers } : {}) },
        b.assetAttachments
          ? assetLibrary.attachments(b.assetAttachments)
          : undefined,
      ),
    );
  });
  app.post("/api/projects/:id/architecture", (req, res) => {
    const b = z
      .object({
        revision: z.number().int(),
        id: z.uuid(),
        architecture: architectureSchema,
      })
      .strict()
      .parse(req.body);
    res.json(
      engine.submitChange(req.params.id, b.revision, b.id, {
        architecture: b.architecture,
      }),
    );
  });
  const animationImports = new Set<string>();
  app.post("/api/projects/:id/marketplace-animations", async (req, res) => {
    const b = z
      .object({
        revision: z.number().int(),
        studioId: z.uuid(),
        reference: z.string().min(1).max(1000),
      })
      .strict()
      .parse(req.body);
    const projectId = req.params.id;
    const assertAvailable = () => {
      const p = store.get(projectId);
      if (p.revision !== b.revision || p.jobId)
        throw new ConflictError(
          "The project changed. Wait for work to finish before previewing animations.",
        );
      return p;
    };
    assertAvailable();
    if (
      animationImports.has(projectId) ||
      engine.assetOperations.has(projectId) ||
      engine.mutationBlocker?.(projectId)
    )
      throw new ConflictError(
        "An animation pack is already loading for this project.",
      );
    if (!assetLibrary.provider.animations)
      throw new RequestError(
        "This Studio connection cannot load animation previews.",
      );
    animationImports.add(projectId);
    engine.assetOperations.add(projectId);
    try {
      const metadata = await assetLibrary.provider.metadata(
        b.studioId,
        parseAssetReference(b.reference),
      );
      const pack = animationPackSchema.parse(
        await assetLibrary.provider.animations(b.studioId, metadata),
      );
      if (pack.assetId !== metadata.assetId)
        throw new RequestError("Studio returned a different asset.");
      const p = assertAvailable();
      if (!pack.entries.length) return res.json(p);
      const existing = p.animationPacks?.find(
        (a) =>
          a.assetId === pack.assetId &&
          a.revisionKey === pack.revisionKey &&
          JSON.stringify(a.entries) === JSON.stringify(pack.entries),
      );
      if (existing) return res.json(p);
      if ((p.animationPacks?.length ?? 0) >= 16)
        throw new ConflictError("This project already has 16 animation packs.");
      if (
        Buffer.byteLength(JSON.stringify([...(p.animationPacks ?? []), pack])) >
        16 * 1024 * 1024
      )
        throw new ConflictError(
          "This project has reached its 16 MB animation preview limit.",
        );
      const saved = {
        ...pack,
        id: randomUUID(),
        at: new Date().toISOString(),
        revision: p.revision,
      };
      (p.animationPacks ??= []).push(saved);
      appendTurn(
        p,
        "media",
        `${pack.name} · ${pack.entries.length} animation${pack.entries.length === 1 ? "" : "s"}`,
        { animationPackId: saved.id },
      );
      res.json(store.save(p));
    } finally {
      animationImports.delete(projectId);
      engine.assetOperations.delete(projectId);
    }
  });
  app.post("/api/projects/:id/animations", (req, res) => {
    const b = z
      .object({
        revision: z.number().int(),
        id: z.uuid(),
        clip: animationClipSchema,
      })
      .strict()
      .parse(req.body);
    const p = store.get(req.params.id);
    const old = p.animationClips?.find((a) => a.id === b.id);
    if (old) {
      if (JSON.stringify(old.clip) !== JSON.stringify(b.clip))
        throw new ConflictError(
          "This animation ID belongs to a different clip.",
        );
      return res.json(p);
    }
    if (p.revision !== b.revision || p.jobId)
      throw new ConflictError(
        "The project changed. Wait for work to finish and refresh before importing.",
      );
    if ((p.animationClips?.length ?? 0) >= 16)
      throw new ConflictError(
        "This project already has 16 animation previews.",
      );
    (p.animationClips ??= []).push({
      id: b.id,
      clip: b.clip,
      at: new Date().toISOString(),
      revision: p.revision,
      source: "user-import",
    });
    appendTurn(
      p,
      "media",
      `Imported ${b.clip.name} for ${b.clip.rig}. Preview only, not applied to Studio.`,
      { animationId: b.id },
    );
    res.json(store.save(p));
  });
  app.post("/api/projects/:id/conversation/:turn/feedback", (req, res) => {
    const b = z
      .object({ feedback: z.enum(["helpful", "needs_work"]) })
      .strict()
      .parse(req.body);
    const p = store.get(req.params.id);
    if (p.jobId)
      throw new ConflictError("Wait for the run to finish before rating it.");
    const turn = p.conversation?.find(
      (t) => t.id === req.params.turn && t.kind === "run",
    );
    if (!turn) throw new RequestError("Run not found", 404);
    turn.feedback = b.feedback;
    res.json(store.save(p));
  });
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
        assetAttachments: attachmentInputSchema.optional(),
      })
      .strict()
      .parse(req.body);
    const attachments = b.assetAttachments
      ? assetLibrary.attachments(b.assetAttachments)
      : undefined;
    res.json(
      engine.revise(
        req.params.id,
        b.revision,
        b.request,
        b.answers,
        attachments,
      ),
    );
  });
  app.post("/api/projects/:id/queued-messages/:messageId/cancel", (req, res) => {
    const { revision } = z.object({ revision: z.number().int() }).strict().parse(req.body);
    res.json(engine.cancelQueuedMessage(req.params.id, revision, z.uuid().parse(req.params.messageId)));
  });
  app.post("/api/projects/:id/queued-messages/continue", async (req, res) => {
    const { revision } = z.object({ revision: z.number().int() }).strict().parse(req.body);
    if (store.get(req.params.id).revision !== revision) throw new ConflictError("The project changed. Review it first.");
    res.json(await engine.applyQueuedChanges(req.params.id));
  });
  app.get("/api/projects/:id/retry-quote", (req, res) => res.json(stepRetry(store.get(req.params.id)) ?? null));
  app.post("/api/projects/:id/retry-step", (req, res) => {
    const { revision } = z.object({ revision: z.number().int() }).strict().parse(req.body);
    const p = store.get(req.params.id);
    if (p.revision !== revision || !stepRetry(p)) throw new ConflictError("The failed step changed. Review the project before retrying.");
    res.status(202).json(engine.start(p.id, revision, stepRetry(p)!.kind));
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
  app.post("/api/projects/:id/approve-proposal", async (req, res) => {
    const b = z
      .object({
        revision: z.number().int(),
        hash: z.string(),
        generationBudgetMicros: settingsSchema.shape.generationBudgetMicros,
      })
      .strict()
      .parse(req.body);
    let p = store.get(req.params.id);
    if (
      !p.proposal ||
      p.revision !== b.revision ||
      p.proposal.hash !== b.hash ||
      p.jobId ||
      engine.assetOperations.has(p.id)
    )
      throw new ConflictError(
        "The proposal changed or work is running. Review the saved proposal before approving.",
      );
    res
      .status(202)
      .json(
        engine.approveProposal(
          p.id,
          p.revision,
          b.hash,
          b.generationBudgetMicros,
        ),
      );
  });
  app.post("/api/projects/:id/discard-proposal-edit", (req, res) => {
    const p = store.get(req.params.id);
    if (
      p.jobId ||
      p.revision !== req.body.revision ||
      engine.mutationBlocker?.(p.id)
    )
      throw new ConflictError(
        "Wait for current work to settle before discarding this draft.",
      );
    delete p.pendingProposalEdit;
    res.json(store.save(p));
  });
  app.post("/api/projects/:id/retry-message", (req, res) => {
    const b = z.object({ revision: z.number().int() }).strict().parse(req.body);
    res.status(202).json(engine.start(req.params.id, b.revision, "proposal-edit"));
  });
  for (const action of [
    "concept",
    "plan",
    "build",
    "repair",
    "proposal",
  ] as const)
    app.post("/api/projects/:id/" + action, (req, res) => {
      const input = z
        .object({
          revision: z.number().int(),
          generationBudgetMicros: settingsSchema.shape.generationBudgetMicros,
        })
        .strict()
        .parse(req.body);
      if (action === "plan" && store.get(String(req.params.id)).concept)
        engine.acceptConcept(String(req.params.id), input.revision);
      return res
        .status(202)
        .json(
          engine.start(
            String(req.params.id),
            input.revision,
            action,
            input.generationBudgetMicros,
          ),
        );
    });
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
      throw new ConflictError("Build and resolve checks before export");
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
        p.world,
        p.rig,
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
    if (engine.assetOperations.has(req.params.id))
      throw new ConflictError(
        "Wait for asset inspection to finish before applying to Studio.",
      );
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
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof RequestError)
        return res.status(error.status).json({ error: error.message });
      if (error instanceof z.ZodError)
        return res
          .status(400)
          .json({ error: "Invalid request. Check the supplied fields." });
      // express.json reports parse/size errors with stable types, not safe prose.
      const bodyError = error as { type?: string; status?: number } | null;
      if (bodyError?.type === "entity.parse.failed" && bodyError.status === 400)
        return res.status(400).json({ error: "Invalid JSON request body." });
      if (bodyError?.type === "entity.too.large" && bodyError.status === 413)
        return res.status(413).json({ error: "Request body is too large." });
      res
        .status(500)
        .json({ error: "Internal server error. Please try again." });
    },
  );
  return app;
}
