import fs from 'node:fs';
import assert from 'node:assert/strict';
import { StdioStudioClient } from '../src/generation/studio-mcp-client';
import { isVerifiedEditState } from '../src/generation/studio-state';

const directory = 'benchmarks/runs/marketplace-diversity-v15-20260916';
const result = JSON.parse(fs.readFileSync(directory + '/bubble-wrap/results.json', 'utf8'));
assert.equal(result.noFurtherCallsPending, true);
assert.equal(result.requiresReconciliation, false);
assert.equal(result.routesRestored, true);
const isolation = JSON.parse(fs.readFileSync(directory + '/isolation-bubble/context.json', 'utf8'));
assert(fs.existsSync(directory + '/isolation-bubble/restore-receipt.json'), 'Wrapper restoration not recorded');
const project = JSON.parse(fs.readFileSync(directory + '/bubble-wrap/final-project.json', 'utf8'));
assert.equal(project.jobId, null);
assert.equal(project.reservedMicros, 0);
const snapshots = [];
for (const port of [4324, 4335]) {
  const response = await fetch(`http://127.0.0.1:${port}/api/projects`, { signal: AbortSignal.timeout(10000) });
  assert(response.ok);
  const summaries = await response.json() as any[];
  const projects = [];
  for (const summary of summaries) {
    const detail = await fetch(`http://127.0.0.1:${port}/api/projects/${summary.id}`, { signal: AbortSignal.timeout(10000) });
    assert(detail.ok);
    const p = await detail.json() as any;
    assert(!p.jobId && p.reservedMicros === 0, 'Pending app work prevents native closure inspection');
    projects.push({ id: p.id, stage: p.stage, jobId: p.jobId, reservedMicros: p.reservedMicros });
  }
  snapshots.push({ port, projects });
}
fs.writeFileSync(directory + '/terminal-api.json', JSON.stringify({ checkedAt: new Date().toISOString(), snapshots }, null, 2), { flag: 'wx' });
const parse = (r: any) => {
  assert(!r.isError);
  return r.structuredContent ?? JSON.parse(r.content.find((c: any) => c.type === 'text').text);
};
const client = new StdioStudioClient();
try {
  const studios = await client.callTool('list_roblox_studios', {}, AbortSignal.timeout(30000));
  assert(parse(studios).studios.some((s: any) => s.id === isolation.studioId && s.name === 'Place1'));
  const state = await client.callTool('get_studio_state', { studio_id: isolation.studioId }, AbortSignal.timeout(30000));
  assert(isVerifiedEditState(state.structuredContent ?? state.content.find((c: any) => c.type === 'text')?.text));
  const code = `local scripts = {}
local paths = {
 {"Workspace", "Butter", "Script"},
 {"StarterPlayer", "StarterPlayerScripts", "Forge_98c63e12b73c", "CrunchClient"},
 {"ServerScriptService", "Forge_98c63e12b73c", "CrunchServer"}
}
for _, parts in ipairs(paths) do
 local node = game
 for _, name in ipairs(parts) do node = node and node:FindFirstChild(name) end
 table.insert(scripts, {path=table.concat(parts,"."), exists=node~=nil, disabled=node and node.Disabled})
end
local leftovers = {}
for _, node in ipairs(game:GetDescendants()) do
 if string.sub(node.Name, 1, #${JSON.stringify(project.scope)}) == ${JSON.stringify(project.scope)} or node.Name == ${JSON.stringify(isolation.recordScope)} then
  table.insert(leftovers, node:GetFullName())
 end
end
return game:GetService("HttpService"):JSONEncode({scripts=scripts,leftovers=leftovers})`;
  const native = await client.callTool('execute_luau', { studio_id: isolation.studioId, datamodel_type: 'Edit', code }, AbortSignal.timeout(30000));
  fs.writeFileSync(directory + '/native-closure.json', JSON.stringify({ checkedAt: new Date().toISOString(), studioId: isolation.studioId, mode: 'Edit', studios, state, code, result: native }, null, 2), { flag: 'wx' });
  const observation = parse(native);
  assert.equal(observation.scripts.length, 3);
  assert(observation.scripts.every((s: any) => s.exists === true && s.disabled === false));
  assert.equal(observation.leftovers.length, 0);
  console.log(JSON.stringify({ portsIdle: snapshots.map(s => s.port), originalScriptsRestored: 3, studioEdit: true, ownedLeftovers: 0 }));
} finally { await client.close(); }
