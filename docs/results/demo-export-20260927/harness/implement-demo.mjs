import fs from 'node:fs';
function edit(p,from,to){let s=fs.readFileSync(p,'utf8');if(!s.includes(from))throw Error(p+' missing '+from.slice(0,50));fs.writeFileSync(p,s.replace(from,to));}
edit('tests/demo-export-blockers.test.ts',"{...real.proposal,revision:undefined,hash:undefined,changed:undefined,approval:undefined,summary:undefined,assetNeeds:real.spec.assetNeeds}","{title:real.proposal.title,mechanics:real.proposal.mechanics,theme:real.proposal.theme,environment:real.proposal.environment,assetNeeds:real.spec.assetNeeds}");
edit('src/marketplace/types.ts','export const snapshotSchema = z','export const INSPECTION_BYTE_LIMIT = 4 * 1024 * 1024;\nexport const snapshotSchema = z');
edit('src/marketplace/types.ts','      .max(3000),',',');
edit('src/marketplace/types.ts','.refine((s) => s.scripts.reduce((n, x) => n + x.source.length, 0) <= 262144);','.refine((s) => s.scripts.reduce((n, x) => n + x.source.length, 0) <= 262144)\n  .refine((s) => new TextEncoder().encode(JSON.stringify(s)).length <= INSPECTION_BYTE_LIMIT, "Inspection exceeds the transfer byte budget");');
edit('src/marketplace/types.ts','status: "no_issues_found" | "review_required" | "blocked";','status: "no_issues_found" | "limited" | "review_required" | "blocked";\n  limitations?: string[];');
edit('src/marketplace/types.ts','  usage: string;','  usage: string;\n  inspectionLimitations?: string[];');
edit('src/marketplace/types.ts','        usage: z.string().trim().max(500).default(""),','        usage: z.string().trim().max(500).default(""),\n        acknowledgeInspectionLimitations: z.boolean().optional(),');
edit('src/marketplace/inspection.ts','SCANNER_VERSION = 1','SCANNER_VERSION = 2');
edit('src/marketplace/inspection.ts','    findings: Finding[] = [];','    findings: Finding[] = [],\n    limitations: string[] = [];');
edit('src/marketplace/inspection.ts',`    findings.push({
      rule: "coverage",
      severity: "review",
      message:
        "Inspection is incomplete: " + snapshot.issues.join("; ").slice(0, 900),
    });`,`    limitations.push("Inspection coverage is incomplete. Uninspected content remains unknown. " + snapshot.issues.join("; ").slice(0, 900));`);
edit('src/marketplace/inspection.ts','        : "no_issues_found",','        : limitations.length ? "limited" : "no_issues_found",\n    ...(limitations.length ? { limitations } : {}),');
edit('src/marketplace/library.ts','        inspection.status !== "no_issues_found"','        (inspection.status !== "no_issues_found" && !(inspection.status === "limited" && ref.acknowledgeInspectionLimitations))');
edit('src/marketplace/library.ts','      if (inspectSnapshot(record.snapshot).status !== "no_issues_found")','      const verdict = inspectSnapshot(record.snapshot);\n      if (verdict.status !== "no_issues_found" && !(verdict.status === "limited" && ref.acknowledgeInspectionLimitations))');
edit('src/marketplace/library.ts','        usage: ref.usage,','        usage: ref.usage,\n        ...(verdict.limitations?.length ? { inspectionLimitations: verdict.limitations } : {}),');
edit('src/marketplace/studio.ts','  assetIdSchema,','  INSPECTION_BYTE_LIMIT,\n  assetIdSchema,');
edit('src/marketplace/studio.ts','  local bytes=0','  local bytes=0\n  local transferBytes=4096\n  local function reserve(value)\n    transferBytes+=#game:GetService("HttpService"):JSONEncode(value)+1\n    assert(transferBytes<=${INSPECTION_BYTE_LIMIT},"Inspection coverage reached the transfer byte budget")\n  end');
edit('src/marketplace/studio.ts',`      assert(#result.nodes<3000,"Asset exceeds 3000 inspected instances")
      table.insert(result.nodes,{name=string.sub(item:GetFullName(),1,1024),className=item.ClassName})`,`      local node={name=string.sub(item:GetFullName(),1,1024),className=item.ClassName}\n      reserve(node)\n      table.insert(result.nodes,node)`);
edit('src/marketplace/studio.ts','          table.insert(result.scripts,{name=string.sub(item:GetFullName(),1,1024),source=source})','          local captured={name=string.sub(item:GetFullName(),1,1024),source=source}\n          reserve(captured)\n          table.insert(result.scripts,captured)');
edit('src/generation/proposal.ts','import { ConflictError }','import { assetNeedSchema } from "./asset-contract";\nimport { ConflictError }');
edit('src/generation/proposal.ts','    title: z.string().min(1).max(120),','    title: z.string().min(1).max(120),\n    assetNeeds: z.array(assetNeedSchema).max(16).optional(),');
edit('src/generation/proposal.ts','q && [q.title, q.mechanics, q.theme, q.environment]','q && [q.title, q.mechanics, q.theme, q.environment, ...(q.assetNeeds ? [q.assetNeeds] : [])]');
edit('src/marketplace/asset-binding.ts','p: Pick<Project, "spec">,','p: Pick<Project, "spec"> & Partial<Pick<Project, "proposal">>,');
edit('src/marketplace/asset-binding.ts','const needs = p.spec?.assetNeeds ?? [];','const needs = p.spec?.assetNeeds ?? p.proposal?.assetNeeds ?? [];');
edit('src/marketplace/discovery.ts','Partial<Pick<Project, "spec">>','Partial<Pick<Project, "spec" | "proposal">>');
edit('src/marketplace/discovery.ts','  if (p.spec?.assetNeeds?.length)\n    return p.spec.assetNeeds.map','  const needs = p.spec?.assetNeeds ?? p.proposal?.assetNeeds;\n  if (needs?.length)\n    return needs.map');
edit('src/marketplace/relevance.ts','            label: group.label,','            label: group.label,');
edit('src/generation/engine.ts','Marketplace asset suggestions are supplied by the host separately.','Include assetNeeds for every needed Marketplace dependency using the assetNeed contract: stable need and requirement IDs, precise role, query, rig/style/interaction constraints, position and maxSize. These are the authoritative needs used by selection before the implementation plan exists. Do not invent catalog IDs. Marketplace candidates are supplied by the host separately.');
edit('src/generation/engine.ts','      p.assetDiscovery.approved\n','      p.assetDiscovery.approved\n');
// Never spend on relevance before the planner has supplied needs. Legacy metadata search remains available.
edit('src/generation/engine.ts','    if (!settings.routes.decisions?.length) return p;','    if (!settings.routes.decisions?.length || !(p.spec?.assetNeeds?.length || p.proposal?.assetNeeds?.length)) return p;');
edit('src/web/AssetChoices.tsx','      connection.connected &&\n      !review &&','      connection.connected &&\n      !!(project.proposal || project.spec) &&\n      (!review || (!!project.proposal && !review.approved)) &&');
edit('src/web/AssetChoices.tsx','const key = `${connection.checked}:${studioId}`;','const key = `${connection.checked}:${studioId}:${project.proposal?.hash ?? ""}`;');
edit('src/web/AssetChoices.tsx','[disabled, studioId, !!review, connection.connected, connection.checked]','[disabled, studioId, !!review, project.proposal?.hash, !!project.spec, connection.connected, connection.checked]');
// Finish prior search against the now-saved proposal, reusing its captured options.
edit('src/marketplace/discovery-routes.ts','        if (prior && !b.groupId && !b.refresh) return p;','        const finishRecommendations = !!(prior && p.proposal && !prior.approved && !b.groupId && !b.refresh);\n        if (prior && !b.groupId && !b.refresh && !finishRecommendations) return p;');
edit('src/marketplace/discovery-routes.ts','        for (const group of discovery.groups) {\n          if (b.groupId','        for (const group of discovery.groups) {\n          if (finishRecommendations) continue;\n          if (b.groupId');
fs.writeFileSync('docs/results/demo-export-20260927/harness/implement.mjs',fs.readFileSync('.forge/implement-demo.mjs'));
