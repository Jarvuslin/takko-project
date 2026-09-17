// Read-only public research collection. Never executes downloaded code.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '../evidence/open-source');
fs.mkdirSync(root, { recursive: true });
const repos = [
 'Aider-AI/aider', 'SWE-agent/mini-swe-agent', 'OpenHands/software-agent-sdk',
 'gepa-ai/gepa', 'rojo-rbx/rojo', 'JohnnyMorganz/luau-lsp', 'lune-org/lune',
 'PepeElToro41/ui-labs', 'Sleitnick/RbxUtil', 'MineDojo/Voyager',
 'allenai/Holodeck', 'Codium-ai/AlphaCodium', 'flipbook-labs/flipbook'
];
async function get(url) {
 const r = await fetch(url, { headers: { 'User-Agent': 'Roblox-Generation-Research', Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(30000) });
 if (!r.ok) throw Error(`${r.status} ${url}`);
 return r.json();
}
async function collect(repo) {
 const dir = path.join(root, repo.replace('/', '--'));
 fs.mkdirSync(dir, { recursive: true });
 const existing = path.join(dir, 'metadata.json');
 if (fs.existsSync(existing) && fs.existsSync(path.join(dir, 'tree.json'))) return JSON.parse(fs.readFileSync(existing, 'utf8'));
 const meta = await get(`https://api.github.com/repos/${repo}`);
 const commit = await get(`https://api.github.com/repos/${meta.full_name}/commits/${encodeURIComponent(meta.default_branch)}`);
 const tree = await get(`https://api.github.com/repos/${meta.full_name}/git/trees/${commit.sha}?recursive=1`);
 const record = { requestedRepo: repo, repo: meta.full_name, htmlUrl: meta.html_url, defaultBranch: meta.default_branch,
  archived: meta.archived, disabled: meta.disabled, pushedAt: meta.pushed_at, commit: commit.sha,
  commitDate: commit.commit.committer.date, licenseMetadata: meta.license, collectedAt: new Date().toISOString(), treeTruncated: tree.truncated };
 fs.writeFileSync(existing, JSON.stringify(record, null, 2));
 fs.writeFileSync(path.join(dir, 'tree.json'), JSON.stringify(tree, null, 2));
 return record;
}
async function main() {
 if (process.argv[2] === 'files') {
  const selections = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  const records = [];
  for (const selection of selections) {
   const dir = path.join(root, selection.repo.replace('/', '--'));
   const meta = JSON.parse(fs.readFileSync(path.join(dir, 'metadata.json'), 'utf8'));
   const tree = JSON.parse(fs.readFileSync(path.join(dir, 'tree.json'), 'utf8'));
   for (const file of selection.files) {
    if (!tree.tree.some(x => x.path === file && x.type === 'blob')) throw Error(`File absent at pinned commit: ${file}`);
    const dest = path.resolve(dir, 'files', file);
    const allowed = path.resolve(dir, 'files') + path.sep;
    if (!dest.startsWith(allowed)) throw Error('Invalid snapshot path');
    const url = `https://raw.githubusercontent.com/${meta.repo}/${meta.commit}/${file}`;
    let b;
    if (fs.existsSync(dest)) b = fs.readFileSync(dest);
    else {
     const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
     if (!r.ok) throw Error(`${r.status}: ${url}`);
     b = Buffer.from(await r.arrayBuffer());
     fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, b);
    }
    records.push({ repo: meta.repo, commit: meta.commit, file, url, localPath: path.relative(root, dest).replaceAll('\\', '/'), bytes: b.length, sha256: crypto.createHash('sha256').update(b).digest('hex') });
   }
  }
  fs.writeFileSync(path.join(root, 'files-manifest.json'), JSON.stringify({ collectedAt: new Date().toISOString(), files: records }, null, 2));
  console.log(JSON.stringify({ pinnedFiles: records.length, totalBytes: records.reduce((n, r) => n+r.bytes, 0) }));
  return;
 }
 const records = [];
 // Small bounded batches; retain failures rather than silently skipping them.
 for (let i=0; i<repos.length; i+=3) {
  const batch = await Promise.allSettled(repos.slice(i,i+3).map(collect));
  for(let j=0;j<batch.length;j++) {
   const r=batch[j]; const result=r.status==='fulfilled'?r.value:{repo:repos[i+j],error:String(r.reason)};
   records.push(result); console.log(JSON.stringify(result));
  }
 }
 fs.writeFileSync(path.join(root, 'repositories.json'), JSON.stringify(records, null, 2));
 if(records.some(x=>x.error)) process.exitCode=1;
}
main().catch(e => { console.error(e); process.exitCode=1; });
