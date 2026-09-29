import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
function files(dir, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isSymbolicLink()) continue;
    if (e.isDirectory()) files(p, result);
    else result.push(p);
  }
  return result;
}
const src = files('src').filter(f => /\.tsx?$/.test(f));
const all = [...src, ...['tests', 'scripts', 'desktop'].flatMap(d => files(d))].filter(f => /\.(?:[cm]?[jt]sx?)$/.test(f));
const normalize = p => path.resolve(p).replaceAll('\\', '/');
const seen = new Set(), imports = new Map();
for (const file of all) {
  const text = fs.readFileSync(file, 'utf8');
  const refs = [];
  const pattern = /\b(?:import|export)\s+(?:[^;]*?\s+from\s*)?["'](\.[^"']+)["']|\b(?:import|require)\s*\(\s*["'](\.[^"']+)["']/g;
  for (const m of text.matchAll(pattern)) {
    const candidate = path.resolve(path.dirname(file), m[1] ?? m[2]);
    const resolved = [candidate, ...['.ts', '.tsx', '.mjs', '.js', '/index.ts', '/index.tsx'].map(ext => candidate + ext)].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    if (resolved) refs.push(normalize(resolved));
  }
  imports.set(normalize(file), refs);
}
function reach(p) { if (seen.has(p)) return; seen.add(p); for (const ref of imports.get(p) ?? []) reach(ref); }
for (const f of ['src/server/app.ts', 'src/server/start.ts', 'src/web/main.tsx', ...all.filter(f => !f.startsWith('src'))]) reach(normalize(f));
const report = {
  ranAt: new Date().toISOString(),
  sourceFiles: src.length,
  markers: src.flatMap(file => fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap((line, index) => /\b(?:TODO|FIXME|HACK|XXX)\b|@ts-ignore|@ts-expect-error|eslint-disable/.test(line) ? [{ file, line: index + 1 }] : [])),
  consoleLog: src.flatMap(file => fs.readFileSync(file, 'utf8').split(/\r?\n/).flatMap((line, index) => /console\.log/.test(line) ? [{ file, line: index + 1 }] : [])),
  unreachable: src.filter(f => !seen.has(normalize(f))),
  importsOfLegacyProvider: [...imports].filter(([f, refs]) => refs.some(p => /\/core\/(budget|provider)\.ts$/.test(p))).map(([f]) => path.relative(root, f)),
  exposure: { roots: 0, files: 0, legacy: 0, bootBlocking: 0, malformedV2Envelope: 0, unreadableDirectories: 0 },
  compilerLocations: ['.forge/tools/luau', 'research/tools/luau'].map(directory => ({ directory, exists: fs.existsSync(path.join(directory, 'luau-compile.exe')) })),
};
const excluded = new Set(['traces', 'history', 'node_modules', '.git', 'asset-evidence', 'asset-library', 'configuration']);
function scan(directory) {
  if (!fs.existsSync(directory)) return;
  let entries;
  try { entries = fs.readdirSync(directory, { withFileTypes: true }); } catch { report.exposure.unreadableDirectories++; return; }
  const records = entries.filter(e => e.isFile() && /^[0-9a-f-]{36}\.json$/i.test(e.name));
  if (records.length) report.exposure.roots++;
  for (const e of records) {
    report.exposure.files++;
    try {
      const p = JSON.parse(fs.readFileSync(path.join(directory, e.name), 'utf8'));
      if (p?.schemaVersion !== 2) {
        report.exposure.legacy++;
        if (!p || typeof p.request !== 'string' || p.request.trim().length < 5 || p.request.trim().length > 12000) report.exposure.bootBlocking++;
      } else if (typeof p.createdAt !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.charges) || !Array.isArray(p.events) || (p.jobId !== null && typeof p.jobId !== 'string') || !Number.isInteger(p.reservedMicros)) report.exposure.malformedV2Envelope++;
    } catch { report.exposure.bootBlocking++; }
  }
  for (const e of entries) if (e.isDirectory() && !e.isSymbolicLink() && !excluded.has(e.name)) scan(path.join(directory, e.name));
}
for (const directory of ['.forge', path.join(process.env.LOCALAPPDATA, 'Forge Desktop'), path.join(process.env.APPDATA, 'Forge Desktop')]) scan(directory);
fs.writeFileSync('docs/results/todo-audit.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
