import type { Profile } from "./schema";
import { validateProviderEndpoint } from "./settings";

/** An authenticated read, never an inference request. Public OpenRouter /models is insufficient. */
export async function validateProviderKey(
  profile: Profile,
  key: string,
  transport: typeof fetch = fetch,
) {
  validateProviderEndpoint(profile);
  if (!key.trim()) throw Error("A provider API key is required");
  const headers: Record<string, string> = {};
  if (profile.provider === "anthropic") {
    headers["x-api-key"] = key;
    headers["anthropic-version"] = "2023-06-01";
  } else if (profile.provider === "gemini") headers["x-goog-api-key"] = key;
  else headers.Authorization = `Bearer ${key}`;
  const response = await transport(
    profile.baseUrl.replace(/\/$/, "") +
      (profile.provider === "openrouter" ? "/key" : "/models"),
    {
      headers,
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    },
  );
  if (!response.ok) throw Error("Provider rejected the connection");
  const data = await response.json();
  if (
    profile.provider === "openrouter"
      ? !data?.data || typeof data.data !== "object" || Array.isArray(data.data)
      : !Array.isArray(data?.data ?? data?.models)
  )
    throw Error("Unexpected provider authentication response");
}
