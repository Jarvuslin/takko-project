import { it, expect } from "vitest";
import fs from "node:fs";
import { inspectSnapshot } from "../src/marketplace/inspection";
import { snapshotSchema } from "../src/marketplace/types";
import { assetNeedForGroup } from "../src/marketplace/asset-binding";
import { proposalDraftSchema } from "../src/generation/proposal";
import { assessEvidenceOptions } from "../src/marketplace/relevance";
const previous = JSON.parse(
  fs.readFileSync(
    "tests/fixtures/regression/motion-inspection/inspection-evidence/14056318312.json",
    "utf8",
  ),
);
const full = JSON.parse(
  fs.readFileSync(
    "tests/fixtures/regression/planner-recovery/full-real-inspection.json",
    "utf8",
  ),
);
it("accepts the complete real 5334-instance pack under the transfer byte budget", () => {
  expect(full.nodes.length).toBeGreaterThan(3000);
  expect(Buffer.byteLength(JSON.stringify(full))).toBeLessThan(4 * 1024 * 1024);
  expect(snapshotSchema.safeParse(full).success).toBe(true);
  expect(inspectSnapshot(full).status).toBe("no_issues_found");
});
it("keeps the original run-11 coverage failure as a limitation, not a source finding", () => {
  const scan = inspectSnapshot(previous.snapshot) as any;
  expect(scan.status).toBe("limited");
  expect(scan.findings).toEqual([]);
  expect(scan.limitations.join(" ")).toContain("3000");
});
it("still blocks a real source finding when coverage is incomplete", () => {
  const input = structuredClone(previous.snapshot);
  const source = JSON.parse(
    fs.readFileSync(
      "tests/fixtures/regression/animation-selection/terminal-project.json",
      "utf8",
    ),
  );
  expect(source.assetPipeline).toBeDefined();
  input.nodes.push({ name: "Unsafe", className: "Script" });
  input.scripts.push({ name: "Unsafe", source: "loadstring('untrusted')()" });
  expect(inspectSnapshot(input).status).toBe("blocked");
});
it("uses planner-owned proposal asset needs before the implementation plan exists", async () => {
  const real = JSON.parse(
    fs.readFileSync(
      "tests/fixtures/regression/animation-selection/terminal-project.json",
      "utf8",
    ),
  );
  const need = real.spec.assetNeeds.find((n: any) => /animation/i.test(n.role));
  const draft = proposalDraftSchema.parse({
    title: real.proposal.title,
    mechanics: real.proposal.mechanics,
    theme: real.proposal.theme,
    environment: real.proposal.environment,
    assetNeeds: real.spec.assetNeeds,
  });
  const p = { ...real, spec: null, proposal: draft };
  const group = {
    id: need.id,
    assetNeedId: need.id,
    label: need.role,
    query: need.query,
    kind: "Model",
    preview: "animation",
    options: JSON.parse(
      fs.readFileSync(
        "tests/fixtures/regression/motion-inspection/automatic-before-proposal.json",
        "utf8",
      ),
    )
      .assetDiscovery.groups.find((g: any) => g.preview === "animation")
      .options.slice(0, 1),
  } as any;
  expect(assetNeedForGroup(p, group)).toEqual(need);
  const requests: any[] = [];
  await assessEvidenceOptions(p, group, async (r) => {
    requests.push(r);
    return null;
  });
  expect(requests.length).toBeGreaterThan(0);
  expect(requests[0].state.need.role).toBe(need.role);
  expect(requests[0].state.need.constraints).toBe(need.constraints);
});
