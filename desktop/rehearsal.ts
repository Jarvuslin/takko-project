import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DispatchDenied } from "../src/generation/providers";

export const rehearsalKey = "offline-rehearsal-key";
const manifestSchema = z
  .object({
    version: z.literal(1),
    mode: z.literal("offline-model-transport"),
    workspace: z.string(),
    endpoint: z.string().url(),
    token: z.uuid(),
  })
  .strict();

/** Explicit isolated desktop replay. No vault and no external inference path.
 * Studio/Marketplace, compiler, Engine and OpenCode remain the shipped ones.
 */
export function rehearsalTransport(
  directory: string,
  env: NodeJS.ProcessEnv,
  localFetch: typeof fetch = fetch,
): typeof fetch | undefined {
  const file = env.FORGE_REHEARSAL_FILE;
  if (!file) return;
  const canonical = (value: string) =>
    (fs.existsSync(value)
      ? fs.realpathSync.native(value)
      : path.resolve(value)
    ).toLowerCase();
  const same = (a: string, b: string) => canonical(a) === canonical(b);
  if (
    !path.isAbsolute(file) ||
    !path.isAbsolute(directory) ||
    !same(path.dirname(file), directory) ||
    path.basename(file) !== "rehearsal.json"
  )
    throw Error(
      "Rehearsal manifest must be inside its explicit absolute workspace",
    );
  if (env.APPDATA && same(directory, path.join(env.APPDATA, "Forge Desktop")))
    throw Error("Rehearsal cannot use the canonical desktop workspace");
  if (fs.existsSync(path.join(directory, "provider-keys.dpapi")))
    throw Error("Rehearsal workspace must not contain a credential vault");
  const manifest = manifestSchema.parse(
    JSON.parse(fs.readFileSync(file, "utf8")),
  );
  if (
    !path.isAbsolute(manifest.workspace) ||
    !same(manifest.workspace, directory)
  )
    throw Error("Rehearsal manifest workspace mismatch");
  const endpoint = new URL(manifest.endpoint);
  if (
    endpoint.protocol !== "http:" ||
    endpoint.hostname !== "127.0.0.1" ||
    !endpoint.port ||
    endpoint.username ||
    endpoint.password ||
    endpoint.search ||
    endpoint.hash ||
    endpoint.pathname !== "/replay"
  )
    throw Error(
      "Rehearsal transport must be the exact loopback replay endpoint",
    );
  return async (input, init) => {
    const request = new Request(input, init),
      url = new URL(request.url);
    if (
      request.headers.get("authorization") !== "Bearer " + rehearsalKey ||
      url.origin !== "https://openrouter.ai" ||
      ![
        "/api/v1/chat/completions",
        "/api/v1/key",
        "/api/v1/generation",
        "/api/v1/models",
        "/api/alpha/decisions",
      ].includes(url.pathname)
    )
      throw new DispatchDenied(
        "Offline rehearsal denied an unexpected provider or credential. No external request was dispatched.",
      );
    // Forward data to the test-owned responder, never the original URL or key.
    return localFetch(endpoint, {
      method: "POST",
      redirect: "error",
      signal: request.signal,
      headers: {
        "Content-Type": "application/json",
        "x-takko-replay-token": manifest.token,
      },
      body: JSON.stringify({
        url: request.url,
        method: request.method,
        body: await request.text(),
      }),
    });
  };
}
