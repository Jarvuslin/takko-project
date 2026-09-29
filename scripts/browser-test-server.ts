// Browser regression server. Never discovers a native Studio or imports credentials.
import express from "express";
import path from "node:path";
import { createApp } from "../src/server/app";
const unavailable = async (): Promise<never> => {
  throw Error("Offline browser test: mock the Marketplace response.");
};
const app = createApp(
  path.resolve(process.env.FORGE_DATA_DIR ?? ".forge/e2e-projects"),
  {
    env: {},
    marketplaceProvider: {
      studios: async () => [],
      search: unavailable,
      metadata: unavailable,
      snapshot: unavailable,
    },
  },
);
app.use(express.static("dist"));
app.get("/{*path}", (_req, res) =>
  res.sendFile(path.resolve("dist/index.html")),
);
app.listen(4319, "127.0.0.1");
