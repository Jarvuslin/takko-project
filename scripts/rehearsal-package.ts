import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { _electron, type ElectronApplication } from "@playwright/test";

/** Only the inference boundary is substituted. All API calls target the owned
 * packaged app's real ephemeral service, without Playwright routing. */
export async function withRehearsalPackage<T>(
  label: string,
  responder: (
    request: { url: string; method: string; body: string },
    directory: string,
  ) => Promise<Response>,
  run: (context: {
    app: ElectronApplication;
    origin: string;
    directory: string;
    request: (url: string, body?: unknown, method?: string) => Promise<any>;
  }) => Promise<T>,
  seed?: (directory: string) => void,
  reuseDirectory?: string,
) {
  assert.match(label, /^[a-z0-9-]+$/);
  const root = path.resolve(".forge/trial-rehearsal");
  fs.mkdirSync(root, { recursive: true });
  const directory = reuseDirectory
    ? fs.realpathSync(reuseDirectory)
    : fs.mkdtempSync(path.join(root, label + "-"));
  assert.equal(
    path.dirname(directory).toLowerCase(),
    fs.realpathSync(root).toLowerCase(),
    "Rehearsal workspace must be an immediate child of the owned root",
  );
  const artifact = (name: string) =>
    path.join(directory, reuseDirectory ? label + "-" + name : name);
  const manifestPath = path.join(directory, "rehearsal.json"),
    token = randomUUID();
  const records: unknown[] = [];
  let app: ElectronApplication | undefined;
  const server = http.createServer(async (req, res) => {
    try {
      assert.equal(req.url, "/replay");
      assert.equal(req.headers["x-takko-replay-token"], token);
      const chunks: Buffer[] = [];
      let length = 0;
      for await (const chunk of req) {
        length += chunk.length;
        assert.ok(length <= 16 * 1024 * 1024, "Replay request too large");
        chunks.push(chunk);
      }
      const input = JSON.parse(Buffer.concat(chunks).toString());
      records.push({
        at: new Date().toISOString(),
        bytes: Buffer.byteLength(input.body),
        input,
      });
      fs.writeFileSync(
        artifact("requests.json"),
        JSON.stringify(records, null, 2),
      );
      const reply = await responder(input, directory);
      res.writeHead(reply.status, Object.fromEntries(reply.headers));
      res.end(Buffer.from(await reply.arrayBuffer()));
    } catch (error) {
      const failureFile = artifact("first-transport-failure.txt");
      if (!fs.existsSync(failureFile))
        fs.writeFileSync(failureFile, String(error), { flag: "wx" });
      res.writeHead(500);
      res.end("Offline replay failed. See owned workspace evidence.");
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({
      version: 1,
      mode: "offline-model-transport",
      workspace: directory,
      endpoint: `http://127.0.0.1:${address.port}/replay`,
      token,
    }),
  );
  try {
    seed?.(directory);
    assert.ok(!fs.existsSync(path.join(directory, "provider-keys.dpapi")));
    const executable = path.resolve(
      ".forge/update-stage/app/Takko-win32-x64/Takko.exe",
    );
    const env = Object.fromEntries(
      Object.entries(process.env).filter(
        ([key, value]) =>
          value !== undefined &&
          !/KEY|TOKEN|SECRET|ELECTRON_RUN_AS_NODE/i.test(key),
      ),
    ) as Record<string, string>;
    env.FORGE_REHEARSAL_FILE = manifestPath;
    app = await _electron.launch({
      executablePath: executable,
      args: ["--user-data-dir=" + directory],
      env,
      timeout: 30000,
    });
    const identity = await app.evaluate(({ app }) => ({
      executable: process.execPath,
      appPath: app.getAppPath(),
      dataDirectory: app.getPath("userData"),
      pid: process.pid,
      packaged: app.isPackaged,
    }));
    assert.equal(
      path.resolve(identity.executable).toLowerCase(),
      executable.toLowerCase(),
    );
    assert.equal(identity.dataDirectory, directory);
    assert.equal(
      identity.appPath,
      path.join(path.dirname(executable), "resources", "app"),
    );
    assert.equal(identity.packaged, true);
    assert.notEqual(identity.pid, 33012);
    const page = await app.firstWindow();
    await page.waitForURL(/http:\/\/127\.0\.0\.1:\d+/);
    const origin = new URL(page.url()).origin;
    assert.notEqual(new URL(origin).port, "56794");
    fs.writeFileSync(
      artifact("identity.json"),
      JSON.stringify(
        { ...identity, origin, at: new Date().toISOString() },
        null,
        2,
      ),
    );
    const request = async (
      url: string,
      body?: unknown,
      method = body === undefined ? "GET" : "POST",
    ) => {
      assert.ok(url.startsWith("/api/"));
      const result = await fetch(origin + url, {
        method,
        headers: { "Content-Type": "application/json", Origin: origin },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const text = await result.text();
      assert.ok(
        result.ok,
        `${method} ${url}: ${result.status} ${text.slice(0, 2000)}`,
      );
      return result.headers.get("content-type")?.includes("json")
        ? JSON.parse(text)
        : text;
    };
    const result = await run({ app, origin, directory, request });
    fs.writeFileSync(artifact("result.json"), JSON.stringify(result, null, 2));
    return { directory, result };
  } catch (error) {
    fs.writeFileSync(artifact("failure.txt"), String(error), {
      flag: "wx",
    });
    throw Error(
      `Rehearsal failed. Evidence preserved at ${directory}: ${error}`,
    );
  } finally {
    try {
      await app?.close();
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      assert.ok(
        !fs.existsSync(path.join(directory, "provider-keys.dpapi")),
        "Offline rehearsal wrote a vault",
      );
    }
  }
}
