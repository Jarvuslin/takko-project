// Keep the owning endpoint reachable until this particular worker exits.
// Electron parentPort itself has no disconnect event.
export function attachParentChannel(child, nonce, { port1, port2 }) {
  child.once("spawn", () => child.postMessage({ type: "owner", nonce }, [port2]));
  child.once("exit", () => port1.close());
  port1.start();
  return port1;
}
