// Free detached native capture only. No model provider, game apply, or play session.
import fs from "node:fs";
import { StdioStudioClient } from "../src/generation/studio-mcp-client";
import {
  StudioMarketplace,
  unpackMarketplace,
} from "../src/marketplace/studio";
import {
  modelPreviewLuau,
  modelPreviewSchema,
} from "../src/marketplace/preview";
const directory = "docs/results/asset-evidence-selection-20260926";
const studioId = "ca13ff86-472b-4f75-82a8-b2300a2d1b76";
const client = new StdioStudioClient({ timeoutMs: 90000 });
const save = (name: string, value: unknown) => {
  const file = `${directory}/${name}.json`;
  if (fs.existsSync(file))
    throw Error("Refusing to overwrite evidence: " + file);
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
};
try {
  const capture = async (code: string) =>
    unpackMarketplace(
      await client.callTool("execute_luau", {
        studio_id: studioId,
        datamodel_type: "Edit",
        code,
      }),
    );
  // Native stress fixture: unmodified copies of the captured punch pack and sword model,
  // plus a detached native UnionOperation. This is a producer-contract fixture, not a claimed catalog asset.
  const source = modelPreviewLuau("12061946559").replace(
    'roots=game:GetObjects("rbxassetid://12061946559")',
    `
  roots=game:GetObjects("rbxassetid://12061946559")
  local originals=table.clone(roots)
  for i=1,4 do for _,r in originals do table.insert(roots,r:Clone()) end end
  for _,r in game:GetObjects("rbxassetid://11831407851") do table.insert(roots,r) end
  local union=Instance.new("UnionOperation");union.Name="Native union contract fixture";table.insert(roots,union)
  `,
  );
  fs.writeFileSync(`${directory}/model-preview-capture.luau`, source, {
    flag: "wx",
  });
  const model = modelPreviewSchema.parse(await capture(source));
  save("model-preview-capture", model);
  save("model-preview-provenance", {
    catalogAssets: ["12061946559", "11831407851"],
    copiesOfPunchPack: 5,
    nativeConstructedClasses: ["UnionOperation"],
    parts: model.parts.length,
    bytes: Buffer.byteLength(JSON.stringify(model)),
    free: true,
  });
  const provider = new StudioMarketplace();
  for (const id of ["12061946559", "34251680"]) {
    const metadata = await provider.metadata(studioId, id);
    save(
      "captured-pack-" + id,
      await provider.animations(studioId, metadata, 100),
    );
  }
} finally {
  save(
    "native-cleanup",
    unpackMarketplace(
      await client.callTool("execute_luau", {
        studio_id: studioId,
        datamodel_type: "Edit",
        code: `local scripts={} for _,x in game:GetDescendants() do if x:IsA("LuaSourceContainer") then table.insert(scripts,x:GetFullName()) end end return game:GetService("HttpService"):JSONEncode({isRunning=game:GetService("RunService"):IsRunning(),scripts=scripts})`,
      }),
    ),
  );
  await client.close();
}
