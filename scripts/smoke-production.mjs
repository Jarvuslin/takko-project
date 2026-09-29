import { spawn } from "node:child_process";
import fs from "node:fs";
const child = spawn(
  process.execPath,
  ["--import", "tsx", "src/server/start.ts"],
  {
    env: {
      ...process.env,
      NODE_ENV: "production",
      FORGE_PORT: "4320",
      FORGE_DATA_DIR: ".forge/production-smoke",
      FORGE_API_KEY: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  },
);
try {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(Error("Production server startup timed out")),
      10000,
    );
    child.once("error", (e) => {
      clearTimeout(timer);
      reject(e);
    });
    child.once("exit", (code) => {
      clearTimeout(timer);
      reject(Error(`Production server exited (${code})`));
    });
    child.stdout.on("data", (b) => {
      if (b.toString().includes("Takko is ready")) {
        clearTimeout(timer);
        resolve();
      }
    });
  });
  const base = "http://127.0.0.1:4320";
  const page = await fetch(base);
  const html = await page.text();
  if (page.status !== 200 || !html.includes("Takko"))
    throw Error("Production HTML failed");
  const asset = html.match(/src="([^"]+\.js)"/);
  if (!asset) throw Error("Built asset reference missing");
  const bundle = await fetch(base + asset[1]);
  if (bundle.status !== 200 || !(await bundle.text()).includes("Approve"))
    throw Error("Production bundle failed");
  const status = await (await fetch(base + "/api/status")).json();
  if (status.mode !== "multi-model")
    throw Error("Unexpected smoke-test provider mode");
  const unknown = await fetch(base + "/api/not-real");
  if (unknown.status !== 404)
    throw Error("Unknown API route did not return 404");
  fs.mkdirSync("test-artifacts", { recursive: true });
  fs.writeFileSync(
    "test-artifacts/production-smoke.json",
    JSON.stringify(
      {
        ranAt: new Date().toISOString(),
        html: true,
        bundle: true,
        api: true,
        unknownRoute: true,
      },
      null,
      2,
    ),
  );
  console.log("Production smoke passed: HTML, bundle, API, unknown route");
} finally {
  child.kill();
}

