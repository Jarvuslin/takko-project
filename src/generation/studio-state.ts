/** Accept the observed official MCP text response or its structured equivalent.
 * Unknown, contradictory, or partial text never authorizes an editor mutation.
 */
export function isVerifiedEditState(state: unknown): boolean {
  if (typeof state === "string") {
    return /^- Current Studio Mode: Edit\n- Available DataModels: Edit\n- Focused DataModel in the viewport: Edit$/.test(
      state.trim().replace(/\r\n/g, "\n"),
    );
  }
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  const value = state as Record<string, unknown>;
  const modes = [
    value.playState,
    value.state,
    value.mode,
    value.playMode,
  ].filter((mode) => mode !== undefined);
  if (modes.some((mode) => mode !== "Edit" && mode !== "Stopped")) return false;
  if (value.isPlaying !== undefined && value.isPlaying !== false) return false;
  const modelLists = [
    value.availableDatamodelTypes,
    value.availableDataModelTypes,
    value.datamodelTypes,
    value.dataModelTypes,
    value.availableDatamodels,
  ].filter((models) => models !== undefined);
  if (
    modelLists.some(
      (models) =>
        !Array.isArray(models) || models.length !== 1 || models[0] !== "Edit",
    )
  )
    return false;
  return modes.length > 0 || modelLists.length > 0;
}

/** Full Client + Server runtime availability is required; partial state fails closed. */
export function isVerifiedClientPlayState(state: unknown): boolean {
  if (typeof state === "string") {
    return /^- Current Studio Mode: Play\n- Available DataModels: (?:Client, Server|Server, Client)\n- Focused DataModel in the viewport: (?:Client|Server)$/.test(
      state.trim().replace(/\r\n/g, "\n"),
    );
  }
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  const value = state as Record<string, unknown>;
  const modes = [
    value.playState,
    value.state,
    value.mode,
    value.playMode,
  ].filter((v) => v !== undefined);
  if (
    !modes.length ||
    modes.some((v) => v !== "Play") ||
    (value.isPlaying !== undefined && value.isPlaying !== true)
  )
    return false;
  const lists = [
    value.availableDatamodelTypes,
    value.availableDataModelTypes,
    value.datamodelTypes,
    value.dataModelTypes,
    value.availableDatamodels,
  ].filter((v) => v !== undefined);
  return (
    lists.length > 0 &&
    lists.every(
      (v) =>
        Array.isArray(v) &&
        v.length === 2 &&
        v.includes("Client") &&
        v.includes("Server"),
    )
  );
}
