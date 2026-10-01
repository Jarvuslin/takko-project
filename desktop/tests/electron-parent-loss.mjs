// Isolated real utility IPC closure, including the production transferred port.
import { app, utilityProcess, MessageChannelMain } from "electron";
import { attachParentChannel } from "../parent-channel.mjs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
const directory = await fs.mkdtemp(path.join(os.tmpdir(), "takko-parent-loss-"));
app.setPath("userData", directory);
app.disableHardwareAcceleration();
let child;
const deadline = setTimeout(() => { child?.kill(); app.exit(1); }, 20000);
app.whenReady().then(async () => {
  try {
    const resources = path.resolve("dist-desktop");
    const nonce = randomUUID();
    child = utilityProcess.fork(path.join(resources, "service.cjs"), [], {
      cwd: directory, stdio: "ignore",
      env: { ...process.env, FORGE_DESKTOP_NONCE: nonce,
        FORGE_DESKTOP_DATA: directory, FORGE_DESKTOP_RESOURCES: resources },
    });
    const endpoint = attachParentChannel(child, nonce, new MessageChannelMain());
    const exited = once(child, "exit");
    const [ready] = await once(child, "message");
    assert.equal(ready.type, "ready");
    assert.equal((await fetch(`http://127.0.0.1:${ready.port}/api/projects`)).status, 200);
    endpoint.close();
    const [code] = await exited;
    assert.equal(code, 0);
    const record = JSON.parse(await fs.readFile(path.join(directory, "service-exit.json"), "utf8"));
    assert.equal(record.reason, "parent-disconnect");
    assert.ok(record.heartbeatAgeMs < 10000, "IPC must exit before backup lease");
    console.log("PASS real Electron transferred parent port loss exits before lease");
    app.exit(0);
  } catch (error) { console.error(error); child?.kill(); app.exit(1); }
  finally { clearTimeout(deadline); console.log("Disposable parent-loss directory:", directory); }
});
