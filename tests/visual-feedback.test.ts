import { it, expect } from "vitest";
import { attachVisual, currentVisualFeedback, markVisualFeedbackForInspection } from "../src/generation/visual";
import { newProject } from "../src/generation/store";
import { fixtureBundle, profile } from "./generation-fixtures";
import { complete } from "../src/generation/providers";
const png =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2ioAAAAASUVORK5CYII=";
it("attaches bounded PNG evidence to the exact artifact and rejects stale revisions and other content", () => {
  const p = newProject("Build a farming game", 1e6);
  p.artifact = fixtureBundle(p.request, p.scope);
  const result = attachVisual(p, {
    revision: 1,
    dataUrl: png,
    notes: "Improve the HUD readability",
  });
  expect(result.visualEvidence?.source).toBe("user-upload");
  expect(result.visualEvidence?.artifactHash).toHaveLength(64);
  expect(result.visualEvidence?.reviewStatus).toBe("unaddressed");
  expect(() =>
    attachVisual(p, { revision: 2, dataUrl: png, notes: "Improve the HUD" }),
  ).toThrow("Revision");
  expect(() =>
    attachVisual(p, {
      revision: 1,
      dataUrl:
        "data:image/png;base64," +
        Buffer.from("not an image").toString("base64"),
      notes: "Improve the HUD",
    }),
  ).toThrow("PNG");
});
it("requires fresh artifact-bound evidence after a patch and supports legacy evidence", () => {
  const p = newProject("Build a farming game", 1e6);
  p.artifact = fixtureBundle(p.request, p.scope);
  attachVisual(p, { revision: 1, dataUrl: png, notes: "Improve the HUD readability" });
  delete p.visualEvidence!.reviewStatus;
  expect(currentVisualFeedback(p)).toBe(p.visualEvidence);
  const original = structuredClone(p.visualEvidence!);
  p.artifact.files[0].source += "\n-- changed artifact";
  expect(currentVisualFeedback(p)).toBeNull();
  markVisualFeedbackForInspection(p);
  expect(p.visualEvidence).toEqual({ ...original, reviewStatus: "awaiting_inspection" });
  // Even if an artifact is later restored, a repair attempt is not a visual pass.
  p.artifact.files[0].source = p.artifact.files[0].source.replace("\n-- changed artifact", "");
  expect(currentVisualFeedback(p)).toBeNull();
  attachVisual(p, { revision: 1, dataUrl: png, notes: "The updated HUD is still too small" });
  expect(currentVisualFeedback(p)?.notes).toBe("The updated HUD is still too small");
  expect(p.visualEvidence?.reviewStatus).toBe("unaddressed");
});
for (const provider of [
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
  "compatible",
] as const)
  it(
    "sends screenshot content using the " + provider + " image contract",
    async () => {
      let body: any;
      try {
        await complete(
          profile(provider),
          "secret",
          "JSON",
          "Review screenshot",
          new AbortController().signal,
          (async (_url, init) => {
            body = JSON.parse(String(init?.body));
            return new Response("", { status: 400 });
          }) as typeof fetch,
          png,
        );
      } catch {}
      if (provider === "openai")
        expect(body.input[0].content[0]).toMatchObject({
          type: "input_image",
          image_url: png,
        });
      else if (provider === "anthropic")
        expect(body.messages[0].content[0].source).toMatchObject({
          type: "base64",
          media_type: "image/png",
          data: png.split(",")[1],
        });
      else if (provider === "gemini")
        expect(body.contents[0].parts[0].inlineData.mimeType).toBe("image/png");
      else expect(body.messages[1].content[0].image_url.url).toBe(png);
    },
  );
