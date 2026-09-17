import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { ServiceSupervisor } from "../supervisor.mjs";
import path from "node:path";
import { desktopIdentity, desktopDataDirectory } from "../identity.mjs";
import { isServiceUrl, readyOrigin, rendererPreferences } from "../policy.mjs";

function fixture(options = {}) {
  const child = new EventEmitter();
  child.sent = [];
  child.postMessage = (message) => child.sent.push(message);
  child.kills = 0;
  child.kill = () => {
    child.kills++;
    queueMicrotask(() => child.emit("exit", 1));
  };
  let nonce;
  const supervisor = new ServiceSupervisor(
    (value) => {
      nonce = value;
      return child;
    },
    { startupMs: 50, shutdownMs: 20, heartbeatMs: 1000, ...options },
  );
  return {
    child,
    supervisor,
    ready: () => child.emit("message", { type: "ready", nonce, port: 45678 }),
  };
}

test("Takko keeps the existing desktop storage and lock location after rebranding", () => {
  const appData = path.resolve("user-app-data");
  assert.equal(desktopIdentity.name, "Takko");
  assert.equal(
    desktopDataDirectory(appData),
    path.join(appData, "Forge Desktop"),
  );
  assert.notEqual(desktopDataDirectory(appData), path.join(appData, "Takko"));
});

test("accepts only nonce-bound readiness from its own child", async () => {
  const f = fixture();
  const started = f.supervisor.start();
  f.child.emit("message", { type: "ready", nonce: "other", port: 4318 });
  assert.equal(f.supervisor.state, "starting");
  assert.throws(() => f.supervisor.start(), /already/);
  f.ready();
  assert.equal(await started, "http://127.0.0.1:45678");
  const stopping = f.supervisor.stop();
  assert.equal(f.child.sent.at(-1).type, "shutdown");
  f.child.emit("exit", 0);
  await stopping;
  assert.equal(f.child.kills, 0);
  assert.equal(f.supervisor.state, "stopped");
});

test("startup deadline fails and kills only owned worker", async () => {
  const f = fixture({ startupMs: 10 });
  await assert.rejects(f.supervisor.start(), /ready in time/);
  assert.equal(f.child.kills, 1);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.supervisor.child, null);
});

test("crash after readiness fails visibly without automatic restart", async () => {
  const f = fixture();
  const pending = f.supervisor.start();
  f.ready();
  await pending;
  let failure;
  f.supervisor.on("failure", (message) => {
    failure = message;
  });
  f.child.emit("exit", 1);
  assert.match(failure, /unexpectedly/);
  assert.equal(f.supervisor.state, "failed");
  assert.equal(f.supervisor.child, null);
});

test("unresponsive shutdown escalates, repeated stop shares completion", async () => {
  const f = fixture();
  const pending = f.supervisor.start();
  f.ready();
  await pending;
  const first = f.supervisor.stop();
  assert.equal(f.supervisor.stop(), first);
  await first;
  assert.equal(f.child.kills, 1);
});

test("lost IPC during heartbeat reports failure and cleans up the worker", async () => {
  const f = fixture({ heartbeatMs: 5 });
  const pending = f.supervisor.start();
  f.ready();
  await pending;
  const failure = new Promise((resolve) =>
    f.supervisor.once("failure", resolve),
  );
  f.child.postMessage = () => {
    throw Error("IPC closed");
  };
  assert.match(await failure, /connection was lost/);
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(f.supervisor.child, null);
  assert.equal(f.child.kills, 1);
});

test("lost shutdown IPC still terminates owned worker and settles stop", async () => {
  const f = fixture();
  const pending = f.supervisor.start();
  f.ready();
  await pending;
  f.child.postMessage = () => {
    throw Error("IPC closed");
  };
  await f.supervisor.stop();
  assert.equal(f.child.kills, 1);
});

test("stop during startup rejects pending start and prevents late readiness", async () => {
  const f = fixture();
  const starting = f.supervisor.start();
  const rejected = assert.rejects(starting, /before it was ready/);
  const stopping = f.supervisor.stop();
  f.ready();
  assert.equal(f.supervisor.state, "stopping");
  f.child.emit("exit", 0);
  await Promise.all([rejected, stopping]);
});

test("navigation rejects other origins, credentials and non-HTTP schemes", () => {
  const origin = "http://127.0.0.1:4319";
  assert.equal(isServiceUrl(origin + "/api/projects", origin), true);
  for (const url of [
    "http://localhost:4319",
    "http://127.0.0.1:4318",
    "http://user@127.0.0.1:4319",
    "https://example.com",
    "file:///C:/secret",
    "javascript:alert(1)",
  ])
    assert.equal(isServiceUrl(url, origin), false, url);
  assert.equal(readyOrigin({ type: "ready", nonce: "x", port: 80 }, "x"), null);
  assert.equal(rendererPreferences.nodeIntegration, false);
  assert.equal(rendererPreferences.sandbox, true);
  assert.equal(rendererPreferences.contextIsolation, true);
});
