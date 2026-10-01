import fs from "node:fs";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { StudioMarketplace, unpackMarketplace } from "../src/marketplace/studio";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { isVerifiedEditState } from "../src/generation/studio-state";
import { inspectSnapshot } from "../src/marketplace/inspection";
import { revisionKey } from "../src/marketplace/library";
import { newProject } from "../src/generation/store";
import { assetNeedSchema } from "../src/generation/asset-contract";
import { assetRoleEvidence, mediaAssetId } from "../src/marketplace/role-evidence";
import { animationSegments } from "../src/marketplace/animation-segments";
const manifestFile = "docs/results/generalization/stratified-manifest.json";
const manifest = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
execFileSync("git", ["ls-files", "--error-unmatch", manifestFile]);
assert.equal(execFileSync("git", ["diff", "HEAD", "--", "src", manifestFile], { encoding: "utf8" }).trim(), "", "Freeze production and commit manifest before search");
assert.equal(execFileSync("git", ["diff", manifest.productionCommit, "HEAD", "--", "src"], { encoding: "utf8" }).trim(), "", "Production changed since freeze");
const root = "docs/results/generalization/stratified";
assert.ok(!fs.existsSync(root), "Never overwrite or retry a sweep");
fs.mkdirSync(root, { recursive: true });
const studioId = "216e6aaa-19c8-44d9-94f2-7341c2e69973";
const native = new StudioMarketplace(), client = new StdioStudioClient({ timeoutMs: 90000 });
const call = async (name: string, args: object) => unpackMarketplace(await client.callTool(name, { studio_id: studioId, ...args }));
const seen = new Set<string>();
fs.writeFileSync(root + "/run.json", JSON.stringify({ at: new Date().toISOString(), commit: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(), studioId, cost: 0, seed: manifest.seed }, null, 2));
function oracle(id: string, key?: string) { return `
assert(not game:GetService("RunService"):IsRunning())
local roots=game:GetObjects("rbxassetid://${id}") local owned
local ok,result=pcall(function()
 local r={instances=0,parts=0,characters=0,tools=0,invalidTools=0,effects=0,meshes=0,images=0,sounds=0,sequences=0,animations=0,oversizedSequences=0}
 for _,root in roots do local all=root:GetDescendants() table.insert(all,root)
 for _,n in all do
 r.instances+=1
 if n:IsA("BaseScript") then n.Enabled=false end if n:IsA("Sound") then n.PlayOnRemove=false end
 if n:IsA("BasePart") and n.Size.X>0 and n.Size.Y>0 and n.Size.Z>0 then r.parts+=1 end
 if n:IsA("Humanoid") then local root=n.Parent:FindFirstChild("HumanoidRootPart") if root and root:IsA("BasePart") then r.characters+=1 end end
 if n:IsA("Tool") then r.tools+=1 local h=n:FindFirstChild("Handle") if n.RequiresHandle and not(h and h:IsA("BasePart")) then r.invalidTools+=1 end end
 if n:IsA("ParticleEmitter") or n:IsA("Beam") or n:IsA("Trail") or n:IsA("Fire") or n:IsA("Smoke") or n:IsA("Sparkles") then r.effects+=1 end
 if (n:IsA("MeshPart") or n:IsA("SpecialMesh")) and #n.MeshId>0 then r.meshes+=1 end
 if (n:IsA("Decal") or n:IsA("Texture")) and #n.Texture>0 then r.images+=1 end
 if (n:IsA("ImageLabel") or n:IsA("ImageButton")) and #n.Image>0 then r.images+=1 end
 if n:IsA("Sound") and #n.SoundId>0 then r.sounds+=1 end
 if n:IsA("KeyframeSequence") then r.sequences+=1 if #n:GetKeyframes()>300 then r.oversizedSequences+=1 end end
 if n:IsA("Animation") then r.animations+=1 end
 end end
 ${key ? `
 local indices=game:GetService("HttpService"):JSONDecode(${JSON.stringify(JSON.stringify(key.split("/").map(Number)))})
 local sequence=roots[indices[1]] for i=2,#indices do sequence=sequence:GetChildren()[indices[i]] end
 if sequence:IsA("Animation") then owned=game:GetService("KeyframeSequenceProvider"):GetKeyframeSequenceAsync(sequence.AnimationId):Clone() sequence=owned end
 if sequence:IsA("KeyframeSequence") then
 local frames=sequence:GetKeyframes() table.sort(frames,function(a,b)return a.Time<b.Time end)
 local c={name=sequence.Name,loop=sequence.Loop,frameCount=#frames,frames={},rig="R6",truncated=#frames>300}
 for i,f in frames do if i<=300 then local row={time=f.Time,name=f.Name,markers={}} for _,m in f:GetMarkers() do if #row.markers<100 then table.insert(row.markers,{name=m.Name,value=m.Value}) else c.truncated=true end end table.insert(c.frames,row) end end
 for _,pose in sequence:GetDescendants() do if pose:IsA("Pose") and (pose.Name:find("Upper") or pose.Name:find("Lower") or pose.Name:find("Hand$") or pose.Name:find("Foot$")) then c.rig="R15" end end
 r.clip=c
 end` : ""}
 return r
end)
if owned then owned:Destroy() end for _,r in roots do r:Destroy() end
assert(ok,result) return game:GetService("HttpService"):JSONEncode(result)
`; }
function stratumMatch(row: any) {
 const r = row.oracle, c = r?.clip;
 if (!r) return false;
 if (row.stratum === "large") return r.instances > 10000 || r.sequences + r.animations > 100 || r.oversizedSequences > 0;
 if (row.role !== "animation") return row.nativeRolePresent;
 if (!c || c.truncated || !row.entry?.clip) return false;
 const labels = c.frames.some((f: any) => f.markers.length || !/^Keyframe\d*$/i.test(f.name));
 const times = new Set<number>();
 for (const f of c.frames) if ([f.name, ...f.markers.map((m: any) => m.name)].some((name: string) => /^(hit|damage|dmg|heavy|strike|impact|punch)(?:\b|[_\d])/i.test(name))) times.add(f.time);
 row.authoredHitEvents = times.size; row.authoredLabels = labels;
 if (row.stratum === "labeled") return labels;
 if (row.stratum === "unlabeled") return !labels;
 if (row.stratum === "nonattack") return c.loop || /idle|run|dance/i.test(c.name);
 const rig = row.stratum.startsWith("r6_") ? "R6" : "R15";
 return c.rig === rig && !c.loop && (row.stratum.endsWith("single") ? times.size === 1 : times.size > 1);
}
try {
 const listing = unpackMarketplace(await client.callTool("list_roblox_studios", {}));
 assert.ok(listing.studios.some((s: any) => s.id === studioId && s.name === "TrialReviewInspection.rbxlx"));
 assert.ok(isVerifiedEditState(await call("get_studio_state", {})));
 for (const slot of manifest.slots) {
  const row: any = { ...slot, at: new Date().toISOString(), cost: 0 };
  try {
   row.search = await native.searchPage(studioId, slot.query, slot.kind);
   const eligible = row.search.assets.filter((a: any) => !manifest.excludedIds.includes(a.assetId));
   assert.ok(eligible.length, "No unseen eligible results in the preregistered page");
   row.selected = eligible[Math.floor(slot.rankDraw * eligible.length)];
   if (seen.has(row.selected.assetId)) { row.duplicate = true; throw Error("Duplicate draw retained without replacement"); }
   seen.add(row.selected.assetId);
   row.metadata = await native.metadata(studioId, row.selected.assetId);
   if (slot.role === "animation") {
    row.manifest = await native.animations(studioId, row.metadata, 0);
    assert.ok(row.manifest.entries.length, "No clips in drawn asset");
    row.selectedKey = row.manifest.entries[Math.floor(slot.clipDraw * row.manifest.entries.length)].key;
    row.pack = await native.animations(studioId, row.metadata, 100, row.selectedKey);
    row.entry = row.pack.entries.find((e: any) => e.key === row.selectedKey);
   }
   try { row.oracle = await call("execute_luau", { datamodel_type: "Edit", code: oracle(row.selected.assetId, row.selectedKey) }); }
   catch (error) { row.oracleError = String(error); }
   row.snapshot = await native.snapshot(studioId, row.metadata);
   const r = row.oracle;
   row.nativeRolePresent = r ? ({ character: r.characters > 0, static_target: r.parts > 0, tool: r.tools > 0 && !r.invalidTools, prop: r.parts > 0, vfx: r.effects > 0, sound: r.sounds > 0, mesh: r.meshes > 0, image: r.images > 0, animation: !!r.clip })[slot.role as string] : undefined;
   const p = newProject("Preregistered structural sample", 7500000);
   const need = assetNeedSchema.parse({ id: "sample", requirementId: "sample", assetRole: slot.role, role: slot.role === "animation" ? slot.stratum === "nonattack" ? "Noncombat animation" : "Player punch attack" : slot.role, kind: row.metadata.kind, query: slot.query, constraints: "Native evidence only", position: [0, 0, 0] });
   const inspection = inspectSnapshot(row.snapshot); inspection.nativeRevisionKey = revisionKey(row.metadata);
   if (row.entry?.clip) p.rig = { selected: row.entry.clip.rig, source: "user" } as any;
   const sound = inspection.nativeRoles?.sounds.find(s => mediaAssetId(s.soundId));
   if (sound) need.pick = { assetId: row.selected.assetId, sound: { path: sound.path, assetId: mediaAssetId(sound.soundId)! } };
   p.proposal = { title: "Sample", revision: 1, hash: "", changed: [], assetNeeds: [need], mechanics: { text: "Requested role", assumptions: [], unresolved: [] }, theme: { text: "Plain", assumptions: [], unresolved: [] }, environment: { text: "Baseplate", assumptions: [], unresolved: [] } };
   p.assetDiscovery = { id: p.id, revision: p.revision, studioId, choices: { sample: { assetId: row.selected.assetId, ...(row.selectedKey ? { clipKey: row.selectedKey } : {}) } }, groups: [{ id: "sample", kind: row.metadata.kind, label: need.role, query: slot.query, preview: "model", options: [{ ...row.metadata, inspection, ...(row.pack ? { previewData: { pack: row.pack, revisionKey: revisionKey(row.metadata) } } : {}) }] }] };
   row.verdict = assetRoleEvidence(p, p.assetDiscovery.groups[0]);
   if (row.entry?.clip) row.analysis = animationSegments(row.entry.clip, inspection.nativeRoles?.sequences.find(s => s.key === row.selectedKey), need.role);
   row.matchesStratum = stratumMatch(row);
   row.wrongRole = r ? !row.nativeRolePresent : null;
   row.falsePass = r && row.verdict.status === "ready" && !row.nativeRolePresent;
   row.falseBlock = r && row.verdict.status === "blocked" && row.nativeRolePresent && inspection.status !== "blocked";
  } catch (error) { row.error = String(error); row.matchesStratum = false; }
  row.finishedAt = new Date().toISOString();
  fs.writeFileSync(`${root}/${String(slot.slot).padStart(2, "0")}.json`, JSON.stringify(row, null, 2));
  console.log(JSON.stringify({ slot: row.slot, stratum: row.stratum, id: row.selected?.assetId, match: row.matchesStratum, status: row.verdict?.status, error: row.error }));
 }
} finally {
 try {
  const state = await call("get_studio_state", {}); assert.ok(isVerifiedEditState(state));
  const census = await call("execute_luau", { datamodel_type: "Edit", code: `local r={scripts=0,scopes={},workspaceChildren=#workspace:GetChildren()} for _,n in game:GetDescendants() do if n:IsA("LuaSourceContainer") then r.scripts+=1 end if string.match(n.Name,"^Takko_") or string.match(n.Name,"^Forge_") then table.insert(r.scopes,n:GetFullName()) end end return game:GetService("HttpService"):JSONEncode(r)` });
  fs.writeFileSync(root + "/cleanup.json", JSON.stringify({ at: new Date().toISOString(), state, census }, null, 2));
 } finally { await client.close(); }
}
