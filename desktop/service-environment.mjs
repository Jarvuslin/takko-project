// Only OS paths needed by local tools. Provider secrets are loaded from the vault.
export function serviceEnvironment(source) {
  const allowed = [
    "SystemRoot",
    "SYSTEMROOT",
    "WINDIR",
    "PATH",
    "TEMP",
    "TMP",
    "HOME",
    "USERPROFILE",
    "LOCALAPPDATA",
    "APPDATA",
    "FORGE_OPENCODE_BINARY",
  ];
  return Object.fromEntries(
    allowed.filter((key) => source[key]).map((key) => [key, source[key]]),
  );
}
