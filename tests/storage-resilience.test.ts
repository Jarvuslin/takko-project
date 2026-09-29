import { afterEach, expect, it, vi } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/server/app";
import { GenerationStore, newProject } from "../src/generation/store";
import { AssetLibrary } from "../src/marketplace/library";

const directories: string[] = [];
function directory() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-storage-test-"));
  directories.push(dir);
  return dir;
}
afterEach(() => {
  vi.restoreAllMocks();
  for (const dir of directories.splice(0))
    fs.rmSync(dir, { recursive: true, force: true });
});

it.each([
  '{"request":"',
  JSON.stringify({ request: "" }),
  JSON.stringify({ request: "abc" }),
  "{}",
  "null",
])(
  "boots and recovers healthy projects while preserving unreadable record %s",
  (bad) => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const dir = directory(),
      store = new GenerationStore(dir);
    const healthy = newProject("Healthy interrupted project", 2_000_000);
    healthy.jobId = randomUUID();
    healthy.reservedMicros = 120;
    store.save(healthy);
    const badFile = path.join(dir, randomUUID() + ".json");
    fs.writeFileSync(badFile, bad);
    const app = createApp(dir, { env: {} });
    const recovered = app.locals.engine.store.list();
    expect(recovered).toHaveLength(1);
    expect(recovered[0]).toMatchObject({
      id: healthy.id,
      jobId: null,
      reservedMicros: 0,
      stage: "interrupted",
    });
    expect(recovered[0].charges[0].chargedMicros).toBe(120);
    expect(fs.readFileSync(badFile, "utf8")).toBe(bad);
    expect(fs.existsSync(badFile + ".legacy")).toBe(false);
  },
);

it("migrates valid legacy requests and preserves the original", () => {
  const dir = directory(),
    id = randomUUID(),
    original = JSON.stringify({ request: "Keep my original game" });
  fs.writeFileSync(path.join(dir, id + ".json"), original);
  const p = new GenerationStore(dir).list()[0];
  expect(p).toMatchObject({
    id,
    request: "Keep my original game",
    legacyImport: true,
  });
  expect(fs.readFileSync(path.join(dir, id + ".json.legacy"), "utf8")).toBe(
    original,
  );
});

it("lists healthy assets beside malformed content, invalid IDs and a disappearing file", () => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const dir = directory();
  const library = new AssetLibrary(dir, {} as never);
  library.remember({
    assetId: "123",
    name: "Healthy",
    kind: "Model",
    creatorName: "Test",
    updated: "",
  });
  fs.writeFileSync(path.join(dir, "124.json"), "{ broken");
  fs.writeFileSync(path.join(dir, "125.json"), "null");
  fs.writeFileSync(path.join(dir, "12345678901234567890.json"), "{}");
  fs.writeFileSync(path.join(dir, "126.json"), "{}");
  const read = fs.readFileSync;
  vi.spyOn(fs, "readFileSync").mockImplementation(((
    file: any,
    ...args: any[]
  ) => {
    if (file === path.join(dir, "126.json")) {
      fs.unlinkSync(file);
      throw Object.assign(Error("disappeared"), { code: "ENOENT" });
    }
    return (read as any)(file, ...args);
  }) as typeof fs.readFileSync);
  expect(library.list().map((a) => a.assetId)).toEqual(["123"]);
  expect(fs.readFileSync(path.join(dir, "124.json"), "utf8")).toBe("{ broken");
  expect(() => library.get("124")).toThrow();
  expect(() =>
    library.attachments([
      { assetId: "124", contentHash: "0".repeat(64), usage: "" },
    ]),
  ).toThrow();
});
