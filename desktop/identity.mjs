import path from "node:path";

export const desktopIdentity = Object.freeze({
  name: "Takko",
  // Storage and the single-instance lock retain their pre-rebrand location.
  // Changing this would hide saved projects, model profiles and pairing state.
  dataDirectoryName: "Forge Desktop",
});

export function desktopDataDirectory(appDataDirectory) {
  return path.join(appDataDirectory, desktopIdentity.dataDirectoryName);
}
