import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { StudioAssetAdapter } from "../src/generation/studio-asset-adapter";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import { componentArchiveLuau } from "../src/generation/component-archive";

// Opt-in product diagnostic, not a worker benchmark or permission to run asset code.
// Preserves the original archive, then ONLY REMOVES unavailable permissions from
// this owned inert import. It never changes Sandboxed, Source, or Disabled.
const [studioId, directory] = process.argv.slice(2);
if (!/^[a-f0-9-]{36}$/.test(studioId ?? "") || !directory)
  throw Error("Usage: STUDIO_UUID FRESH_OUTPUT_DIRECTORY");
const output = path.resolve(directory);
fs.mkdirSync(output, { recursive: false });
const client = new StdioStudioClient();
function unpack(raw: any): any {
  if (raw?.isError)
    throw Error(
      "Native restriction diagnostic rejected: " + JSON.stringify(raw),
    );
  if (raw?.structuredContent) return unpack(raw.structuredContent);
  if (raw?.content?.length === 1 && raw.content[0].type === "text")
    return unpack(raw.content[0].text);
  if (typeof raw === "string") return unpack(JSON.parse(raw));
  if (raw && Object.keys(raw).length === 1 && "result" in raw)
    return unpack(raw.result);
  return raw;
}
const results: unknown[] = [];
let active: unknown;
try {
  for (const name of ["combat-training", "bubble-wrap", "checkpoint-parkour"]) {
    const project = JSON.parse(
      fs.readFileSync(
        `benchmarks/runs/marketplace-diversity-v2-20260916/${name}/final-project.json`,
        "utf8",
      ),
    );
    const selected = project.assetPipeline.events.find(
      (e: any) => e.step === "candidate_selected",
    );
    const need = project.assetPipeline.needs.find(
      (n: any) => n.id === selected.needId,
    );
    const scope =
      "RestrictionRegression_" + randomUUID().replaceAll("-", "").slice(0, 12);
    active = { name, scope };
    const adapter = new StudioAssetAdapter(client, {
      studioId,
      scope,
      evidenceDirectory: path.join(output, name),
    });
    const search = await adapter.search(
      need,
      need.query,
      AbortSignal.timeout(30000),
    );
    const candidate = search.candidates.find(
      (c) => c.id === selected.data.candidate.id,
    );
    if (!candidate)
      throw Error("Frozen worker candidate no longer offered; no substitution");
    const inspection = await adapter.inspect(
      need,
      candidate,
      name + "-restriction",
      AbortSignal.timeout(60000),
    );
    const original = inspection.receipts.find(
      (r) => r.operation === "component_archive",
    )?.data as any;
    if (original?.status !== "captured" || !original.persisted) {
      await adapter.discard(inspection, AbortSignal.timeout(15000));
      throw Error(
        "Original complete archive must be preserved before a restricted diagnostic",
      );
    }
    const intent = inspection.receipts.find(
      (r) => r.operation === "ownership_intent",
    )!.data as any;
    const attempt = intent.stagingPath.split("/").at(-1);
    // Names here come only from our generated identifiers, never Marketplace text.
    if (!/^[A-Za-z0-9_-]+$/.test(attempt)) throw Error("Invalid owned attempt");
    const code = `${componentArchiveLuau}
assert(not game:GetService("RunService"):IsRunning(),"Edit required")
local folder=assert(game:GetService("ServerStorage"):FindFirstChild(${JSON.stringify(scope)}),"Missing owned scope")
local staging=assert(folder:FindFirstChild("AssetStaging"),"Missing staging")
assert(staging:GetAttribute("TakkoAssetScope")==${JSON.stringify(scope)},"Staging ownership mismatch")
local stage=assert(staging:FindFirstChild(${JSON.stringify(attempt)}),"Missing owned attempt")
assert(stage:GetAttribute("TakkoAssetToken")==${JSON.stringify(inspection.token)},"Token mismatch")
local root=assert(stage:FindFirstChild("Imported"),"Missing original import")
local changes,items,sources,sandboxed={},{},{},{}
local function walk(item)
  table.insert(items,item);sandboxed[item]=item.Sandboxed
  if item:IsA("LuaSourceContainer") then
    sources[item]={source=item.Source}
    if item:IsA("BaseScript") then sources[item].disabled=item.Disabled end
  end
  for _,child in item:GetChildren() do walk(child) end
end
walk(root)
local beforeCount=#items
local current=SecurityCapabilities.fromCurrent()
local ok,result=pcall(function()
  for index,item in items do
    local before=item.Capabilities
    local removed=before:Remove(current)
    local after=before:Remove(removed)
    assert(before:Contains(after) and current:Contains(after),"Restriction would add permissions")
    local removedNames={}
    for _,cap in Enum.SecurityCapability:GetEnumItems() do if removed:Contains(cap) then table.insert(removedNames,cap.Name) end end
    if #removedNames>0 then
      item.Capabilities=after
      assert(item.Capabilities==after,"Permission reduction did not apply")
      table.insert(changes,{index=index,className=item.ClassName,removed=removedNames,sandboxedBefore=sandboxed[item],sandboxedAfter=item.Sandboxed})
    end
  end
  local captured=captureComponentArchive(root)
  assert(not game:GetService("RunService"):IsRunning(),"Studio entered Play")
  assert(root.Parent==stage and #root:GetDescendants()+1==beforeCount,"Hierarchy changed")
  local sourceHashes={}
  for index,item in items do
    assert(item.Sandboxed==sandboxed[item],"Sandbox setting changed")
    local original=sources[item]
    if original then
      assert(item.Source==original.source,"Source changed")
      if item:IsA("BaseScript") then assert(item.Disabled==original.disabled,"Disabled changed") end
      local digest=game:GetService("EncodingService"):ComputeStringHash(item.Source,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
      table.insert(sourceHashes,{index=index,sha256=digest})
    end
  end
  -- No game code is executed. Only report compact native preservation evidence;
  -- the original full archive remains the adapter's immutable sidecar.
  local archiveSha256=nil
  if captured.status=="captured" then
    local bytes=game:GetService("EncodingService"):Base64Decode(buffer.fromstring(captured.base64))
    archiveSha256=buffer.tostring(game:GetService("EncodingService"):ComputeBufferHash(bytes,Enum.HashAlgorithm.Sha256)):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
  end
  return {status=captured.status,reason=captured.reason,roundTrip=captured.roundTrip,bytes=captured.bytes,
    archiveSha256=archiveSha256,sourceHashes=sourceHashes,sourceBytes=captured.sourceBytes,instanceCount=beforeCount,
    sandboxingUnchanged=true,sourceUnchanged=true,executed=false,runtimeVerification="not_performed"}
end)
return game:GetService("HttpService"):JSONEncode({ok=ok,result=ok and result or nil,error=not ok and tostring(result) or nil,
  changes=changes,policy="remove_only_capabilities_unavailable_to_current_thread",running=game:GetService("RunService"):IsRunning()})`;
    // If transport observation fails, stop and retain ownership evidence; do not
    // guess that an in-flight mutation is terminal or immediately clean/retry it.
    active = {
      name,
      scope,
      token: inspection.token,
      original,
      inspectionReceipts: inspection.receipts,
    };
    const raw = await client.callTool(
      "execute_luau",
      { studio_id: studioId, datamodel_type: "Edit", code },
      AbortSignal.timeout(60000),
    );
    let probe: any;
    let cleanup: unknown;
    try {
      probe = unpack(raw);
    } finally {
      cleanup = await adapter.discard(inspection, AbortSignal.timeout(15000));
    }
    const originalManifest = JSON.parse(
      fs.readFileSync(original.manifestFile, "utf8"),
    );
    if (probe.ok) {
      const expected = originalManifest.sources.map((s: any) => ({
        index: s.index,
        sha256: s.sha256,
      }));
      if (
        JSON.stringify(expected) !== JSON.stringify(probe.result.sourceHashes)
      )
        throw Error("Native source identity differs from saved original");
    }
    const record = {
      case: name,
      sourceProject: project.id,
      candidate,
      scope,
      original,
      probe,
      cleanup,
      paidCalls: 0,
      benchmark: false,
      importedCodeExecuted: false,
    };
    fs.writeFileSync(
      path.join(output, name + ".json"),
      JSON.stringify(record, null, 2),
      { flag: "wx" },
    );
    results.push(record);
    active = undefined;
    console.log(
      JSON.stringify({
        case: name,
        ok: probe.ok,
        roundTrip: probe.result?.roundTrip,
        changedInstances: probe.changes?.length,
        error: probe.error,
      }),
    );
    if (!probe.ok)
      throw Error(
        "Restriction diagnostic failed after terminal native response and owned cleanup",
      );
    if (
      probe.result?.roundTrip?.passed !== true ||
      probe.result.sourceUnchanged !== true ||
      probe.result.sandboxingUnchanged !== true ||
      probe.result.executed !== false ||
      probe.running !== false ||
      !probe.changes.length ||
      probe.changes.some((c: any) => !c.sandboxedBefore || !c.sandboxedAfter)
    )
      throw Error("Restricted restoration evidence failed native acceptance");
  }
  fs.writeFileSync(
    path.join(output, "result.json"),
    JSON.stringify(
      {
        kind: "native-permission-restriction-regression-not-worker-benchmark",
        studioId,
        results,
      },
      null,
      2,
    ),
    { flag: "wx" },
  );
} catch (error) {
  const failure = {
    active,
    error: error instanceof Error ? error.message : String(error),
    receipts: (error as any)?.receipts ?? [],
    completedCases: results,
    paidCalls: 0,
  };
  fs.writeFileSync(
    path.join(output, "failure.json"),
    JSON.stringify(failure, null, 2),
    { flag: "wx" },
  );
  console.error(
    JSON.stringify({
      error: failure.error,
      evidenceFile: path.join(output, "failure.json"),
    }),
  );
  process.exitCode = 1;
} finally {
  client.close();
}
