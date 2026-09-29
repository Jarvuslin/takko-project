import type { Page } from "@playwright/test";
import { newProject } from "../../src/generation/store";
import { assetSearches } from "../../src/marketplace/discovery";
import { specification } from "../generation-fixtures";
export const assetChoiceBrief =
  "I want a combat game with basic fighting and a target dummy to practice with. I want animation for fighting, sprinting walking as well as sfx and vfx";
export const studioId = "392fce6b-fea7-4de3-bb2e-49a95231c3f5";
export async function assetChoiceFixture(page: Page, origin = "") {
  let p = newProject(assetChoiceBrief, 2e6);
  const calls: string[] = [];
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/marketplace/studios", (r) =>
    r.fulfill({
      json: { studios: [{ id: studioId, name: "Offline Studio fixture" }] },
    }),
  );
  await page.route("**/api/marketplace/thumbnails?*", (r) =>
    r.fulfill({ json: {} }),
  );
  await page.route("**/api/projects", (r) =>
    r.fulfill({ json: [{ id: p.id, name: p.name, stage: p.stage }] }),
  );
  await page.route(
    (url) =>
      url.pathname === `/api/projects/${p.id}` ||
      url.pathname.startsWith(`/api/projects/${p.id}/`),
    async (r) => {
      const action = new URL(r.request().url()).pathname.split("/")[4];
      if (action === "studio-operations") return r.fulfill({ json: [] });
      if (r.request().method() !== "GET") {
        calls.push(action ?? "PATCH");
        const b = r.request().postDataJSON();
        if (action === "asset-options") {
          const option = (g: any, index: number, i: number) => ({
            assetId: String(1000 + index * 1000 + i),
            name: `${g.label} option ${i}`,
            kind: g.kind,
            creatorName: "Offline fixture",
            updated: "v1",
            votes: { up: 92, down: 8 },
          });
          if (b.groupId && p.assetDiscovery) {
            const index = p.assetDiscovery.groups.findIndex(
                (g) => g.id === b.groupId,
              ),
              g = p.assetDiscovery.groups[index];
            const offset = b.cursor ? g.options.length : 0;
            g.options = [
              ...(b.cursor ? g.options : []),
              ...Array.from({ length: 30 }, (_, i) =>
                option(g, index, offset + i + 1),
              ),
            ];
            g.query = b.query ?? g.query;
            g.nextCursor =
              g.options.length < 90 ? "page-" + g.options.length : undefined;
            p.assetDiscovery.id = crypto.randomUUID();
          } else
            p.assetDiscovery = {
              id: crypto.randomUUID(),
              revision: p.revision,
              studioId,
              groups: assetSearches(p).map((g, index) => ({
                ...g,
                total: 90,
                nextCursor: "page-30",
                options: Array.from({ length: 30 }, (_, i) =>
                  option(g, index, i + 1),
                ),
              })),
            };
        }
        if (action === "approve-brief") p.briefApprovedRevision = p.revision;
        if (action === "asset-preview") {
          const g = p.assetDiscovery!.groups.find((g) => g.id === b.groupId)!;
          const a = g.options.find((a) => a.assetId === b.assetId)!;
          if (g.preview === "animation")
            a.previewData = {
              pack: {
                assetId: a.assetId,
                name: a.name,
                revisionKey: "updated:v1",
                entries: ["Punch", "Kick"].map((name, i) => ({
                  key: name,
                  name,
                  animationId: String(501 + i),
                  clip: {
                    version: 1,
                    name,
                    rig: "R6",
                    duration: 1,
                    tracks: [
                      {
                        joint: "Right Arm",
                        keys: [
                          { time: 0, rotation: [0, 0, 0] },
                          { time: 1, rotation: [2, 0, 0] },
                        ],
                      },
                    ],
                  },
                })),
              },
            };
          else
            a.previewData = {
              model: {
                parts: [
                  {
                    name: "Body",
                    shape: "Block",
                    size: [2, 3, 1],
                    frame: [0, 2, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
                    color: [0.4, 0.5, 0.3],
                    transparency: 0,
                  },
                ],
                omitted: 0,
                effects: 0,
              },
            };
        }
        if (action === "approve-assets") {
          p.revision++;
          p.briefApprovedRevision = p.revision;
          p.assetDiscovery = {
            ...p.assetDiscovery!,
            revision: p.revision,
            approved: true,
            choices: b.choices,
          };
        }
        if (action === "plan") {
          p.spec = specification(p.request, p.scope);
          p.stage = "review";
        }
        if (!action) {
          p = {
            ...p,
            request: b.request,
            answers: b.answers,
            revision: p.revision + 1,
            briefApprovedRevision: undefined,
            assetDiscovery: undefined,
          };
        }
      }
      await r.fulfill({ json: p });
    },
  );
  await page.goto(origin + "/?project=" + p.id);
  return { calls, errors, project: () => p };
}
