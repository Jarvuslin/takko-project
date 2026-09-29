import { randomUUID } from "node:crypto";
import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  type Phase,
  type Profile,
  type Project,
} from "./schema";
import type { GenerationStore } from "./store";
import { validateProviderEndpoint } from "./settings";
import { isDecisionModel } from "./decisions";

export function assertOpenCodeProfile(profile: Profile) {
  if (!["openrouter", "compatible"].includes(profile.provider))
    throw Error(
      "OpenCode currently requires an OpenRouter or compatible chat-completions route.",
    );
  if (isDecisionModel(profile.model))
    throw Error("Jev cannot run the OpenCode coding agent.");
  validateProviderEndpoint(profile);
}

type Usage = {
  input?: number;
  output?: number;
  cached?: number;
  cost?: number;
};
const finite = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;

/** One host-owned gateway per coding session. Every runtime request uses this ledger. */
export class OpenCodeGateway {
  private closedReason?: string;
  private attempts = 0;
  private readonly identity: {
    job: string | null;
    revision: number;
    hash?: string;
  };
  constructor(
    private readonly options: {
      project: Project;
      store: GenerationStore;
      profile: Profile;
      key: string;
      phase: Phase;
      signal: AbortSignal;
      transport?: typeof fetch;
      reservationBudgetMicros?: number;
      maxRequests?: number;
      runId?: string;
      beforeDispatch?: (request: {
        phase: Phase;
        profile: Profile;
        attempt: number;
        reservedMicros: number;
      }) => void | Promise<void>;
    },
  ) {
    assertOpenCodeProfile(options.profile);
    this.identity = {
      job: options.project.jobId,
      revision: options.project.revision,
      hash: options.project.proposal?.hash,
    };
  }
  private current() {
    const p = this.options.store.get(this.options.project.id);
    return (
      p.jobId === this.identity.job &&
      p.revision === this.identity.revision &&
      p.proposal?.hash === this.identity.hash
    );
  }
  private deny(reason: string): never {
    this.closedReason ??= reason;
    throw Error(this.closedReason);
  }
  assertCurrent() {
    if (this.closedReason) throw Error(this.closedReason);
    if (this.options.signal.aborted)
      this.deny("OpenCode generation cancelled.");
    if (!this.current())
      this.deny("OpenCode generation is stale or interrupted.");
  }
  async dispatch(
    raw: Record<string, unknown>,
    deliver: (part: {
      status: number;
      contentType: string;
      chunk?: Uint8Array;
    }) => Promise<void>,
  ) {
    this.assertCurrent();
    const { project: p, profile, store, phase, signal } = this.options;
    if (!Array.isArray(raw.messages) || !raw.messages.length)
      this.deny("Missing OpenCode messages.");
    if (this.attempts >= (this.options.maxRequests ?? 48))
      this.deny("OpenCode request limit reached.");
    // Whitelist transport fields. Provider routing, auth and output caps belong to the host.
    const body: Record<string, unknown> = {};
    for (const key of [
      "messages",
      "tools",
      "tool_choice",
      "temperature",
      "top_p",
      "parallel_tool_calls",
    ])
      if (raw[key] !== undefined) body[key] = raw[key];
    body.model = profile.model;
    body.max_tokens = profile.maxOutputTokens;
    body.stream = raw.stream === true;
    if (body.stream) body.stream_options = { include_usage: true };
    if (profile.reasoningEffort)
      body.reasoning = { effort: profile.reasoningEffort };
    const encoded = JSON.stringify(body);
    if (Buffer.byteLength(encoded) > 2 * 1024 * 1024)
      this.deny("OpenCode request exceeds the context byte limit.");
    const reserve = Math.ceil(
      (Buffer.byteLength(encoded) + 1024) * profile.inputRate +
        profile.maxOutputTokens * profile.outputRate,
    );
    const total = p.charges.reduce((sum, c) => sum + c.chargedMicros, 0);
    if (
      p.charges.some(
        (c) => c.estimated && c.inputTokens === null && c.outputTokens === null,
      )
    )
      this.deny(
        "Unknown provider billing must be reconciled before another OpenCode request.",
      );
    if (
      p.generation &&
      p.charges
        .slice(p.generation.chargeStart)
        .reduce((sum, c) => sum + c.chargedMicros, 0) +
        p.reservedMicros +
        reserve >
        p.generation.budgetMicros
    )
      this.deny("Generation budget would be exceeded.");
    if (total + p.reservedMicros + reserve > p.budgetMicros)
      this.deny("Project budget would be exceeded.");
    if (
      this.options.reservationBudgetMicros !== undefined &&
      p.charges.reduce((sum, c) => sum + c.reservedMicros, 0) +
        p.reservedMicros +
        reserve >
        this.options.reservationBudgetMicros
    )
      this.deny("Cumulative reservation budget would be exceeded.");
    // Persist before the first await. Concurrent title/compaction calls see this hold.
    const requestId = randomUUID();
    p.reservedMicros += reserve;
    (p.opencodePending ??= []).push({
      requestId,
      runId: this.options.runId,
      profileId: profile.id,
      model: profile.model,
      phase,
      reservedMicros: reserve,
      at: new Date().toISOString(),
    });
    store.save(p);
    let dispatched = false;
    let ok = false;
    let complete = false;
    let usage: Usage = {};
    const observe = (value: unknown) => {
      const u = (value as { usage?: Record<string, unknown> })?.usage;
      if (!u) return;
      if (finite(u.prompt_tokens)) usage.input = u.prompt_tokens;
      if (finite(u.completion_tokens)) usage.output = u.completion_tokens;
      if (finite(u.cost)) usage.cost = Math.ceil(u.cost * 1e6);
      const cached = (u.prompt_tokens_details as { cached_tokens?: unknown })
        ?.cached_tokens;
      if (finite(cached)) usage.cached = cached;
    };
    try {
      await this.options.beforeDispatch?.({
        phase,
        profile,
        attempt: this.attempts + 1,
        reservedMicros: reserve,
      });
      this.assertCurrent();
      this.attempts++;
      dispatched = true;
      const response = await (this.options.transport ?? fetch)(
        profile.baseUrl.replace(/\/$/, "") + "/chat/completions",
        {
          method: "POST",
          redirect: "error",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + this.options.key,
          },
          body: encoded,
          signal: AbortSignal.any([
            signal,
            AbortSignal.timeout(
              profile.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
            ),
          ]),
        },
      );
      const contentType =
        response.headers.get("content-type") ?? "application/json";
      let connected = true;
      const send = async (chunk?: Uint8Array) => {
        if (connected)
          try {
            await deliver({ status: response.status, contentType, chunk });
          } catch {
            connected = false;
          }
      };
      await send();
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let pending = "";
      let bytes = 0;
      const streaming = contentType.includes("text/event-stream");
      if (!reader) throw Error("Provider returned no response body.");
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.byteLength;
        if (bytes > 16 * 1024 * 1024) {
          await reader.cancel();
          throw Error("Provider response exceeds byte limit.");
        }
        pending += decoder.decode(part.value, { stream: true });
        if (streaming) {
          let newline: number;
          while ((newline = pending.indexOf("\n")) !== -1) {
            const line = pending.slice(0, newline).trim();
            pending = pending.slice(newline + 1);
            if (line.startsWith("data:") && line.slice(5).trim() !== "[DONE]") {
              try {
                observe(JSON.parse(line.slice(5)));
              } catch {
                /* Keep liability when no valid receipt follows. */
              }
            }
          }
        }
        await send(part.value);
      }
      pending += decoder.decode();
      if (!streaming) {
        try {
          observe(JSON.parse(pending));
        } catch {
          /* Unknown billing remains charged. */
        }
      }
      ok = response.ok;
      complete = true;
      if (response.status === 404) usage = { input: 0, output: 0, cost: 0 };
      if (!ok)
        this.closedReason = `Provider returned HTTP ${response.status}. Automatic upstream retries are disabled for this session.`;
    } catch (error) {
      this.closedReason ??=
        "OpenCode dispatch failed. Review the retained billing before resuming.";
      throw error;
    } finally {
      // Recovery may already have converted this reservation into a conservative charge.
      // Never overwrite the recovered project with an old in-memory object.
      if (this.current()) {
        p.reservedMicros -= reserve;
        p.opencodePending = p.opencodePending?.filter(
          (request) => request.requestId !== requestId,
        );
        if (dispatched) {
          if (!complete) usage = {};
          const known = usage.input !== undefined && usage.output !== undefined;
          const charged =
            usage.cost ??
            (known
              ? Math.ceil(
                  usage.input! * profile.inputRate +
                    usage.output! * profile.outputRate,
                )
              : reserve);
          p.charges.push({
            requestId,
            opencodeRunId: this.options.runId,
            phase,
            profileId: profile.id,
            model: profile.model,
            reservedMicros: reserve,
            chargedMicros: charged,
            estimated: usage.cost === undefined && !known,
            billingSource:
              usage.cost !== undefined
                ? "provider"
                : known
                  ? "configured-rate"
                  : "reservation",
            inputTokens: usage.input ?? null,
            outputTokens: usage.output ?? null,
            ...(usage.cached !== undefined
              ? { cachedInputTokens: usage.cached }
              : {}),
            status: ok && (known || usage.cost !== undefined) ? "ok" : "error",
            at: new Date().toISOString(),
          });
          if (!known && usage.cost === undefined)
            this.closedReason =
              "Unknown provider billing must be reconciled before another OpenCode request.";
          if (charged > reserve)
            this.closedReason =
              "Provider cost exceeded its reservation. Review model rates before resuming.";
        }
        store.save(p);
      }
    }
  }
}
