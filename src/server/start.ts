import { createApp } from "./app";
import path from "node:path";
import fs from "node:fs";
import express from "express";
if (fs.existsSync(".env")) process.loadEnvFile(".env");
const env = process.env;
const port = Number(env.FORGE_PORT ?? 4318);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw Error("Invalid FORGE_PORT");
const app = createApp(path.resolve(env.FORGE_DATA_DIR ?? ".forge/projects"), {
  env,
});
if (env.NODE_ENV === "production") {
  app.use(express.static("dist"));
  app.get("/{*path}", (_req, res) =>
    res.sendFile(path.resolve("dist/index.html")),
  );
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}
app.listen(port, "127.0.0.1", () =>
  console.log(`Takko is ready at http://127.0.0.1:${port}`),
);
