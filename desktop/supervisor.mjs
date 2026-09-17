import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { readyOrigin } from "./policy.mjs";

/** One owned worker; no discovery, attachment, automatic retry or PID-based kills. */
export class ServiceSupervisor extends EventEmitter {
  constructor(
    spawnWorker,
    { startupMs = 20000, shutdownMs = 5000, heartbeatMs = 2000 } = {},
  ) {
    super();
    this.spawnWorker = spawnWorker;
    this.options = { startupMs, shutdownMs, heartbeatMs };
    this.state = "stopped";
  }

  start() {
    if (this.child || this.state === "stopping")
      throw Error("Service is already running or stopping");
    this.state = "starting";
    const nonce = randomUUID();
    return new Promise((resolve, reject) => {
      let settled = false;
      const fail = (reason) => {
        clearTimeout(this.startTimer);
        clearInterval(this.heartbeat);
        this.state = "failed";
        if (!settled) {
          settled = true;
          reject(Error(reason));
        }
        this.emit("failure", reason);
        // Only terminate the child returned by our own spawn operation.
        this.child?.kill();
      };
      try {
        this.child = this.spawnWorker(nonce);
      } catch {
        fail("Could not start the local service.");
        return;
      }
      const child = this.child;
      this.startTimer = setTimeout(
        () => fail("The local service did not become ready in time."),
        this.options.startupMs,
      );
      this.heartbeat = setInterval(() => {
        try {
          child.postMessage({ type: "heartbeat", nonce });
        } catch {
          if (this.state !== "stopping")
            fail("The local service connection was lost.");
        }
      }, this.options.heartbeatMs);
      child.on("message", (message) => {
        if (this.state !== "starting") return;
        const origin = readyOrigin(message, nonce);
        if (!origin) return;
        clearTimeout(this.startTimer);
        this.state = "ready";
        settled = true;
        resolve(origin);
      });
      child.on("error", () => {
        if (this.state !== "stopping") fail("The local service could not run.");
      });
      child.on("exit", () => {
        clearTimeout(this.startTimer);
        clearInterval(this.heartbeat);
        this.child = null;
        const expected = this.state === "stopping";
        if (expected) this.state = "stopped";
        else if (this.state !== "failed")
          fail(
            "The local service stopped unexpectedly. Your saved projects remain on disk.",
          );
        if (!settled) {
          settled = true;
          reject(Error("The local service stopped before it was ready."));
        }
        this.emit("stopped");
      });
      this.nonce = nonce;
    });
  }

  stop() {
    if (this.stopPromise) return this.stopPromise;
    if (!this.child) {
      this.state = "stopped";
      return Promise.resolve();
    }
    this.state = "stopping";
    clearTimeout(this.startTimer);
    clearInterval(this.heartbeat);
    const child = this.child;
    this.stopPromise = new Promise((resolve) => {
      const timer = setTimeout(() => child.kill(), this.options.shutdownMs);
      child.once("exit", () => {
        clearTimeout(timer);
        resolve();
      });
      try {
        child.postMessage({ type: "shutdown", nonce: this.nonce });
      } catch {
        child.kill();
      }
    }).finally(() => {
      this.stopPromise = null;
    });
    return this.stopPromise;
  }
}
