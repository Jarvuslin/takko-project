export const model = "anthropic/claude-haiku-4.5";
export const ceilingMicros = 150000;
export const stages = ["initial", "clarify", "plan", "clear"];
export function reservation(body) {
  if (
    body.model !== model ||
    !Number.isInteger(body.max_tokens) ||
    body.max_tokens < 1 ||
    body.max_tokens > 8000
  )
    throw Error("Unexpected model or output limit");
  if (
    body.messages?.length !== 2 ||
    body.messages.some((m) => typeof m.content !== "string")
  )
    throw Error("Unexpected message shape");
  return (
    Buffer.byteLength(body.messages.map((m) => m.content).join("")) +
    1024 +
    body.max_tokens * 5
  );
}
export function authorizeDispatch(stage, body, ledger) {
  if (!stages.includes(stage)) throw Error("Unknown stage");
  if (ledger.some((row) => row.stage === stage))
    throw Error("No retry permitted");
  if (ledger.length >= stages.length) throw Error("Call ceiling reached");
  if (ledger.some((row) => row.status !== "reconciled"))
    throw Error("Previous call is unreconciled");
  const reservedMicros = reservation(body);
  if (
    ledger.reduce((sum, row) => sum + row.reservedMicros, 0) + reservedMicros >
    ceilingMicros
  )
    throw Error("Cumulative reservation ceiling exceeded");
  return reservedMicros;
}
export function receipt(data, reservedMicros) {
  const usage = data.usage;
  if (
    !data.id ||
    !Number.isFinite(usage?.cost) ||
    usage.cost < 0 ||
    !Number.isInteger(usage.prompt_tokens) ||
    !Number.isInteger(usage.completion_tokens) ||
    usage.prompt_tokens < 0 ||
    usage.completion_tokens < 0
  )
    throw Error("Provider receipt is incomplete");
  if (usage.cost * 1e6 > reservedMicros)
    throw Error("Reported charge exceeded reservation");
  return {
    id: data.id,
    model: data.model,
    provider: data.provider,
    costUsd: usage.cost,
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
  };
}
