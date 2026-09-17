import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import {
  componentArchiveLuau,
  decodeComponentTransfer,
} from "../src/generation/component-archive";
import { readComponentOriginal } from "../src/generation/component-derivative";
import { loadComponentReviewEvidence } from "../src/generation/component-review";
import {
  componentAdaptationLuau,
  validateComponentAdaptation,
  persistComponentAdaptation,
  expandedSourceEdits,
} from "../src/generation/component-adaptation";

const [studioId, nativeDirectory, decisionsDirectory, outputDirectory] =
  process.argv.slice(2);
if (
  !/^[a-f0-9-]{36}$/.test(studioId ?? "") ||
  !nativeDirectory ||
  !decisionsDirectory ||
  !outputDirectory
)
  throw Error("Usage: STUDIO_UUID NATIVE_INPUT RAW_WORKER_OUTPUT FRESH_OUTPUT");
const output = path.resolve(outputDirectory);
fs.mkdirSync(output, { recursive: false });
const native = JSON.parse(
  fs.readFileSync(path.join(nativeDirectory, "result.json"), "utf8"),
);
const cases = JSON.parse(
  fs.readFileSync(path.join(decisionsDirectory, "protocol.json"), "utf8"),
).inputs.map((input: any) => input.case);
if (
  !cases.length ||
  new Set(cases).size !== cases.length ||
  cases.some(
    (name: string) => !native.results.some((row: any) => row.case === name),
  )
)
  throw Error("Invalid recorded worker case selection");
const client = new StdioStudioClient();
const results: unknown[] = [];
const save = (name: string, value: unknown) =>
  fs.writeFileSync(
    path.join(output, name),
    JSON.stringify(value, null, 2) + "\n",
    { flag: "wx" },
  );
async function execute(code: string) {
  const result: any = await client.callTool(
    "execute_luau",
    { studio_id: studioId, datamodel_type: "Edit", code },
    AbortSignal.timeout(90000),
  );
  if (result.isError) throw Error(JSON.stringify(result));
  return JSON.parse(result.content.find((x: any) => x.type === "text").text);
}
try {
  for (const row of native.results.filter((row: any) =>
    cases.includes(row.case),
  )) {
    const folder = path.join(nativeDirectory, row.case);
    const evidence = loadComponentReviewEvidence(
      folder,
      row.result.sha256,
      row.inputHash,
    );
    const plan = validateComponentAdaptation(
      JSON.parse(
        fs.readFileSync(
          path.join(decisionsDirectory, row.case + "-decision.json"),
          "utf8",
        ),
      ),
      evidence,
    );
    const packet = JSON.parse(
      fs.readFileSync(
        path.join(folder, row.result.sha256 + ".review.json"),
        "utf8",
      ),
    );
    const original = readComponentOriginal(
      folder,
      packet.derivative.archiveHash,
      packet.derivative.manifestHash,
    );
    const retained = path.join(output, row.case);
    fs.mkdirSync(retained);
    for (const name of [
      packet.derivative.archiveHash + ".rbxm",
      packet.derivative.manifestHash + ".component.json",
    ])
      fs.copyFileSync(
        path.join(folder, name),
        path.join(retained, name),
        fs.constants.COPYFILE_EXCL,
      );
    for (const edit of [
      ...expandedSourceEdits(plan),
      ...(plan.addSources ?? []).map((source, index) => ({
        ...source,
        index: "added-" + index,
      })),
    ]) {
      const file = path.join(retained, "worker-source-" + edit.index + ".luau");
      fs.writeFileSync(file, edit.source, { flag: "wx" });
      execFileSync(
        path.resolve(".forge/tools/luau/luau-compile.exe"),
        ["--null", file],
        { windowsHide: true, timeout: 15000 },
      );
    }
    const token = randomUUID(),
      scope = "AdaptationTransfer_" + token.replaceAll("-", "");
    const payload = Buffer.from(
      JSON.stringify({
        before: original.snapshot,
        securityProfiles: evidence.securityProfiles,
        plan: { ...plan, replaceSources: expandedSourceEdits(plan) },
      }),
    ).toString("base64");
    const code = `
assert(not game:GetService("RunService"):IsRunning(),"Requires Edit")
local store=game:GetService("ServerStorage");local name=${JSON.stringify(scope)};local token=${JSON.stringify(token)}
assert(not store:FindFirstChild(name),"Transfer scope exists")
local encoding=game:GetService("EncodingService");local http=game:GetService("HttpService")
local data=http:JSONDecode(buffer.tostring(encoding:Base64Decode(buffer.fromstring(${JSON.stringify(payload)}))))
${componentArchiveLuau}
${componentAdaptationLuau}
local roots={}
local ok,result=pcall(function()
 roots=game:GetService("SerializationService"):DeserializeInstancesAsync(encoding:Base64Decode(buffer.fromstring(data.before.base64)))
 assert(#roots==1 and roots[1].Parent==nil,"Unparented original required")
 return adaptComponent(roots[1],data.before,data.plan,data.securityProfiles)
end)
for _,root in roots do root:Destroy() end
if not ok then return http:JSONEncode({ok=false,error=tostring(result),rootsDestroyed=true}) end
local json=http:JSONEncode(result);assert(#json<=8*1024*1024,"Result exceeds transfer limit")
local encoded=buffer.tostring(encoding:Base64Encode(buffer.fromstring(json)))
local hash=encoding:ComputeStringHash(encoded,Enum.HashAlgorithm.Sha256):gsub(".",function(c) return string.format("%02x",string.byte(c)) end)
local retained=Instance.new("Folder");retained.Name=name;retained:SetAttribute("TakkoTransfer",token)
for offset=0,#encoded-1,32768 do local chunk=Instance.new("StringValue");chunk.Name="Chunk_"..tostring(offset/32768+1);chunk.Value=string.sub(encoded,offset+1,math.min(offset+32768,#encoded));chunk.Parent=retained end
retained.Parent=store
return http:JSONEncode({ok=true,rootsDestroyed=true,transfer={encodedBytes=#encoded,jsonBytes=#json,sha256=hash,chunkSize=32768}})
`;
    fs.writeFileSync(path.join(retained, "apply.luau"), code, { flag: "wx" });
    let cleanup: unknown;
    try {
      const receipt = await execute(code);
      save(row.case + "-native-receipt.json", receipt);
      if (!receipt.ok) throw Error(receipt.error);
      const chunks: string[] = [];
      for (
        let index = 1;
        index <= Math.ceil(receipt.transfer.encodedBytes / 32768);
        index++
      ) {
        const value = await execute(
          `local folder=assert(game:GetService("ServerStorage"):FindFirstChild(${JSON.stringify(scope)}));assert(folder:GetAttribute("TakkoTransfer")==${JSON.stringify(token)});local chunk=assert(folder:FindFirstChild("Chunk_${index}"));assert(chunk:IsA("StringValue"));return game:GetService("HttpService"):JSONEncode({chunk=chunk.Value})`,
        );
        chunks.push(value.chunk);
      }
      const snapshot = decodeComponentTransfer(receipt.transfer, chunks);
      const result = persistComponentAdaptation(
        retained,
        packet.derivative,
        evidence,
        plan,
        snapshot,
      );
      const record = {
        case: row.case,
        result,
        nativeReceipt: receipt,
        paidCalls: 0,
        importedCodeExecuted: false,
        rawGameBenchmark: false,
      };
      save(row.case + "-result.json", record);
      results.push(record);
      console.log(
        JSON.stringify({
          case: row.case,
          remainingInstances: result.archive.instanceCount,
          remainingSources: result.archive.scriptCount,
          sourceReview: result.sourceReview,
          roundTrip: result.archive.roundTrip.passed,
        }),
      );
    } finally {
      cleanup = await execute(
        `local store=game:GetService("ServerStorage");local folder=store:FindFirstChild(${JSON.stringify(scope)});if folder then assert(folder:IsA("Folder") and folder:GetAttribute("TakkoTransfer")==${JSON.stringify(token)});folder:Destroy() end;return game:GetService("HttpService"):JSONEncode({removed=store:FindFirstChild(${JSON.stringify(scope)})==nil})`,
      );
      save(row.case + "-cleanup.json", cleanup);
    }
  }
} finally {
  save("result.json", {
    kind: "raw-worker-component-adaptation-native-replay",
    studioId,
    results,
    importedCodeExecuted: false,
    rawGameBenchmark: false,
  });
  await client.close();
}
