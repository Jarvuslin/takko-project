import path from "node:path";
import { stageWorkspace, verifyStagedWorkspace } from "../src/generation/workspace-migration";
import { windowsCredentialVault } from "../src/generation/credential-vault";

const target = path.resolve(".forge/update-stage/workspace");
if (process.argv.includes("--verify")) {
  verifyStagedWorkspace(target);
  console.log("Staged workspace and source inputs are unchanged.");
} else {
  const receipt = stageWorkspace([
    { name: "active", directory: path.resolve(".forge/chat-clean-20260929") },
    { name: "original", directory: path.join(process.env.APPDATA!, "Forge Desktop") },
    { name: "fresh", directory: path.resolve(".forge/fresh-desktop-20260929") },
  ], target, windowsCredentialVault);
  console.log(JSON.stringify({ target, projects: receipt.projectIds.length, cachedOrPreferenceConflicts: receipt.conflicts.length, encryptedConnections: receipt.keyCount, activeKeyConflictsRetained: receipt.keyConflicts, vaultReopened: receipt.vaultReopened }));
}
