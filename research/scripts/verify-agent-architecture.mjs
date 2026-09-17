// Research integrity checks only; never imports or executes collected source.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root = path.resolve('research/evidence/agent-architecture-20260916');
const reportPath = 'research/23-agent-architecture-comparison.md';
const selections = JSON.parse(fs.readFileSync('research/agent-architecture-selection.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'files-manifest.json'), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const seen = new Set();
for (const item of manifest.files) {
  const identity = `${item.requestedRepo}:${item.file}`;
  assert(!seen.has(identity), `Duplicate ${identity}`);
  seen.add(identity);
  const folder = path.join(root, item.requestedRepo.replace('/', '--'));
  const metadata = JSON.parse(fs.readFileSync(path.join(folder, 'metadata.json'), 'utf8'));
  const tree = JSON.parse(fs.readFileSync(path.join(folder, 'tree.json'), 'utf8'));
  assert.equal(tree.truncated, false);
  assert.equal(item.commit, metadata.commit);
  assert.equal(item.repo, metadata.repo);
  assert(tree.tree.some(entry => entry.type === 'blob' && entry.path === item.file));
  const bytes = fs.readFileSync(path.join(root, item.localPath));
  assert.equal(bytes.length, item.bytes);
  assert.equal(sha256(bytes), item.sha256);
}
assert.equal(selections.length, 12);
for (const selection of selections) for (const file of selection.files) {
  assert(seen.has(`${selection.repo}:${file}`), `Missing ${selection.repo}:${file}`);
}
assert.equal(seen.size, selections.reduce((n, entry) => n + entry.files.length, 0));

const references = {
  OC: ['anomalyco/opencode', ['packages/opencode/src/session/processor.ts', 'packages/opencode/src/session/compaction.ts', 'packages/opencode/src/agent/agent.ts', 'packages/opencode/src/permission/index.ts']],
  SB: ['spacedriveapp/spacebot', ['docs/content/docs/(core)/architecture.mdx', 'docs/content/docs/(features)/workers.mdx', 'src/agent/worker.rs', 'src/memory/search.rs', 'LICENSE']],
  CL: ['cline/cline', ['README.md', 'sdk/packages/core/src/extensions/context/basic-compaction.ts', 'sdk/packages/core/src/extensions/tools/executors/output-limits.ts', 'sdk/packages/core/src/extensions/tools/model-tool-routing.ts', 'sdk/packages/core/src/extensions/tools/executors/apply-patch.ts', 'sdk/packages/core/src/runtime/safety/loop-detection.ts']],
  GO: ['block/goose', ['crates/goose/src/agents/large_response_handler.rs', 'documentation/docs/guides/recipes/recipe-reference.md', 'crates/goose/src/agents/state_machine/mod.rs', 'crates/goose/src/agents/state_machine/ops_tool_pair_compaction.rs']],
  AI: ['Aider-AI/aider', ['aider/repomap.py', 'aider/coders/architect_coder.py', 'aider/coders/editblock_coder.py']],
  SW: ['SWE-agent/SWE-agent', ['sweagent/agent/agents.py', 'sweagent/agent/history_processors.py', 'README.md']],
  MI: ['SWE-agent/mini-swe-agent', ['src/minisweagent/agents/default.py', 'src/minisweagent/environments/local.py', 'tests/agents/test_default.py']],
  RX: ['SWE-agent/SWE-ReX', ['src/swerex/runtime/abstract.py', 'src/swerex/runtime/remote.py', 'src/swerex/deployment/abstract.py']],
  CO: ['continuedev/continue', ['core/context/retrieval/pipelines/BaseRetrievalPipeline.ts', 'core/context/retrieval/pipelines/RerankerRetrievalPipeline.ts', 'README.md']],
  RO: ['RooCodeInc/Roo-Code', ['src/core/task/build-tools.ts', 'src/core/tools/NewTaskTool.ts', 'src/core/tools/ToolRepetitionDetector.ts', 'README.md']],
};
const links = new Map();
const github = item => `https://github.com/${item.repo}/blob/${item.commit}/${item.file.split('/').map(encodeURIComponent).join('/')}`;
for (const [prefix, [repo, files]] of Object.entries(references)) {
  files.forEach((file, i) => {
    const entry = manifest.files.find(item => item.requestedRepo === repo && item.file === file);
    assert(entry, `${repo}:${file}`);
    links.set(`${prefix}${i + 1}`, github(entry));
  });
}
[
  ['All-Hands-AI/OpenHands', 'README.md'],
  ['OpenHands/software-agent-sdk', 'openhands-sdk/openhands/sdk/conversation/event_store.py'],
  ['OpenHands/software-agent-sdk', 'openhands-sdk/openhands/sdk/context/condenser/llm_summarizing_condenser.py'],
  ['OpenHands/software-agent-sdk', 'openhands-sdk/openhands/sdk/agent/parallel_executor.py'],
  ['OpenHands/software-agent-sdk', 'openhands-sdk/openhands/sdk/conversation/stuck_detector.py'],
].forEach(([repo, file], i) => {
  const entry = manifest.files.find(item => item.requestedRepo === repo && item.file === file);
  assert(entry);
  links.set(`OH${i + 1}`, github(entry));
});
const marker = '<!-- Generated pinned source references -->';
const original = fs.readFileSync(reportPath, 'utf8').split(marker)[0].trimEnd();
for (const match of original.matchAll(/\]\[([A-Z]{2}\d+)\]/g)) assert(links.has(match[1]), `Undefined ${match[1]}`);
fs.writeFileSync(reportPath, `${original}\n\n${marker}\n\n${[...links].map(([id, url]) => `[${id}]: <${url}>`).join('\n')}\n`);

const index = [
  '# Agent architecture source index', '',
  'Collected September 16, 2026. Public repository metadata and pinned raw files; downloaded code was not executed. The report uses focused implementation inspection, not a full repository audit.', '',
  'The user-supplied Spacebot URL returned 404. The official https://spacebot.sh/ Self-host link resolved to `spacedriveapp/spacebot`; its metadata is preserved separately from the original failed lookup. Goose resolves to `aaif-goose/goose`; OpenHands resolves to `OpenHands/OpenHands`. The linked OpenHands SDK is a companion source, not an extra replacement recommendation.', '',
  'The manifest records each full SHA-256 and byte count. Root licenses and maintenance notices are discussed in [the report](../23-agent-architecture-comparison.md).', '',
];
const repositories = [];
for (const selection of selections) {
  const folder = path.join(root, selection.repo.replace('/', '--'));
  const metadata = JSON.parse(fs.readFileSync(path.join(folder, 'metadata.json'), 'utf8'));
  repositories.push(metadata);
  index.push(`## ${metadata.repo}`, '', `Commit: [${metadata.commit}](https://github.com/${metadata.repo}/commit/${metadata.commit}); committed ${metadata.commitDate}; default branch ${metadata.defaultBranch}; GitHub archived flag ${metadata.archived}.`, '');
  for (const file of selection.files) {
    const item = manifest.files.find(entry => entry.requestedRepo === selection.repo && entry.file === file);
    index.push(`- [${file}](<${github(item)}>) — [local snapshot](<../evidence/agent-architecture-20260916/${item.localPath}>), ${item.bytes} bytes.`);
  }
  index.push('');
}
fs.writeFileSync('research/notes/agent-architecture-source-index.md', index.join('\n'));

const localPaths = [
  'src/generation/engine.ts', 'src/generation/game-context.ts',
  'src/generation/asset-pipeline.ts', 'src/generation/studio-asset-adapter.ts',
  'src/generation/component-archive.ts', 'src/generation/bridge.ts',
  'src/generation/component-derivative.ts', 'src/generation/component-review.ts',
  'src/generation/asset-contract.ts', 'docs/takko-component-derivative.md',
  'src/generation/store.ts', 'src/generation/providers.ts',
  'docs/takko-component-archive.md', 'docs/takko-restricted-component-restoration.md',
  'docs/takko-game-context-handoff.md',
  'benchmarks/runs/marketplace-diversity-v2-20260916/RESULTS.md',
];
const result = {
  verifiedAt: new Date().toISOString(), scope: 'Research integrity, not app or native testing',
  repositories: repositories.map(({ repo, commit }) => ({ repo, commit })),
  pinnedFilesVerified: manifest.files.length, pinnedBytesVerified: manifest.files.reduce((n, item) => n + item.bytes, 0),
  sourceReferencesVerified: links.size,
  takkoComparisonFiles: localPaths.map(file => ({ file, sha256: sha256(fs.readFileSync(file)) })),
  reportSha256: sha256(fs.readFileSync(reportPath)),
  downloadedCodeExecuted: false, upstreamTestsRun: false, paidModelCalls: 0, studioOperations: 0,
};
fs.writeFileSync('research/notes/agent-architecture-verification.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: 'passed', files: result.pinnedFilesVerified, bytes: result.pinnedBytesVerified, references: links.size, repositories: repositories.length }));
