import { test } from "node:test";
import assert from "node:assert/strict";
import { fork } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { once } from "node:events";

for (const ending of ["shutdown", "disconnect"]) test(
  `bundled service uses isolated data, private readiness, and ${ending}`,
  { timeout: 20000 },
  async () => {
    const directory = await fs.mkdtemp(
      path.join(os.tmpdir(), "forge-desktop-test-"),
    );
    const resources = path.resolve("dist-desktop");
    const nonce = randomUUID();
    const child = fork(path.join(resources, "service.cjs"), [], {
      cwd: directory,
      env: {
        ...process.env,
        FORGE_DESKTOP_NONCE: nonce,
        FORGE_DESKTOP_DATA: directory,
        FORGE_DESKTOP_RESOURCES: resources,
      },
      stdio: ["ignore", "ignore", "pipe", "ipc"],
      windowsHide: true,
    });
    let stderr = "";
    child.stderr.on("data", (data) => {
      stderr += data.toString().slice(0, 2000);
    });
    const exited = once(child, "exit");
    let readyTimer;
    try {
      const ready = await Promise.race([
        once(child, "message").then(([message]) => message),
        exited.then(() => {
          throw Error("Service exited: " + stderr);
        }),
        new Promise((_, reject) => {
          readyTimer = setTimeout(
            () => reject(Error("Readiness timeout")),
            10000,
          );
        }),
      ]);
      clearTimeout(readyTimer);
      assert.equal(ready.nonce, nonce);
      assert.equal(ready.type, "ready");
      const origin = `http://127.0.0.1:${ready.port}`;
      const response = await fetch(origin + "/api/projects");
      assert.equal(response.status, 200);
      assert.deepEqual(await response.json(), []);
      const html = await fetch(origin).then((r) => r.text());
      assert.match(html, /<html/);
      const plugin = await fetch(origin + "/api/studio/plugin").then((r) =>
        r.text(),
      );
      assert.match(plugin, /Takko/);
      await fs.access(path.join(directory, "projects"));
      child.send({ type: "shutdown", nonce: "wrong" });
      assert.equal((await fetch(origin + "/api/status")).status, 200);
      if (ending === "disconnect") child.disconnect();
      else child.send({ type: "shutdown", nonce });
      const [code] = await exited;
      assert.equal(code, 0, stderr);
      const recordText = await fs.readFile(path.join(directory, "service-exit.json"), "utf8");
      const record = JSON.parse(recordText);
      assert.deepEqual(Object.keys(record).sort(), ["at", "code", "heartbeatAgeMs", "pid", "reason", "version"]);
      assert.equal(record.reason, ending === "disconnect" ? "parent-disconnect" : "parent-shutdown");
      assert.equal(record.code, 0);
      assert.ok(recordText.length < 512);
      assert.ok(!recordText.includes(nonce));
      await assert.rejects(fetch(origin + "/api/status"));
    } finally {
      clearTimeout(readyTimer);
      if (child.exitCode === null) {
        child.kill();
        await exited;
      }
      const resolved = path.resolve(directory);
      assert.equal(path.dirname(resolved), path.resolve(os.tmpdir()));
      assert.ok(path.basename(resolved).startsWith("forge-desktop-test-"));
      await fs.rm(resolved, { recursive: true, force: true });
    }
  },
);
