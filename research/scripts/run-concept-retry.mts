import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createApp } from '../../src/server/app';
import { receipt, model, ceilingMicros } from './concept-live-guard.mjs';
import { authorizeContinuation, stages } from './concept-retry-guard.mjs';

const priorDir = path.resolve('research/results/concept-live-v1');
const prior = JSON.parse(fs.readFileSync(path.join(priorDir, 'ledger.json'), 'utf8'));
const dir = path.resolve('research/results/concept-live-v2');
fs.mkdirSync(dir, { recursive: true });
const stage = process.argv[2];
const save = (name: string, data: unknown) => fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const hash = (data: string) => createHash('sha256').update(data).digest('hex');
let key = '';
let server: ReturnType<ReturnType<typeof createApp>['listen']> | undefined;
const ledger: any[] = fs.existsSync(path.join(dir, 'ledger.json')) ? read('ledger.json') : [];
const summary = () => {
  const before = fs.existsSync(path.join(dir, 'key-before.json')) ? read('key-before.json') : null;
  const after = fs.existsSync(path.join(dir, 'key-after.json')) ? read('key-after.json') : null;
  const total = ledger.reduce((sum, row) => sum + (row.receipt?.costUsd ?? 0), 0);
  const unknown = ledger.filter(row => row.status !== 'reconciled').reduce((sum, row) => sum + row.reservedMicros, 0);
  fs.writeFileSync(path.join(dir, 'RESULTS.md'), `# Live concept trial\n\nModel: ${model}. Authorized continuation with clarify, plan and clear stages. Original hard ceiling $0.15 includes v1. Prior actual $0.008137 and reservations $0.030003. One dispatch per new stage, stop on failure.\n\nCalls dispatched: ${ledger.length}. Provider-reported total: $${total.toFixed(9)}. Unreconciled reservation: $${(unknown / 1e6).toFixed(6)}.\n\nBefore: ${before ? '$' + before.remaining + ' at ' + before.at : 'not read'}. Latest after: ${after ? '$' + after.remaining + ' at ' + after.at : 'not read'}.\n\n` + ledger.map(row => `- ${row.stage}: reservation $${(row.reservedMicros / 1e6).toFixed(6)}, actual ${row.receipt ? '$' + row.receipt.costUsd.toFixed(9) : 'unknown'}, ${row.status}, ${row.at}.`).join('\n') + '\n\nSee stage project snapshots for contract outcomes and the final report for semantic review. This is not a Studio/gameplay test.\n');
};
try {
  if (!['prepare', 'balance', ...stages].includes(stage)) throw Error('Unknown command');
  try {
    key = execFileSync('pwsh.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "$taskSecure=ConvertTo-SecureString ([IO.File]::ReadAllText((Join-Path $env:LOCALAPPDATA 'Takko\\secrets\\openrouter-testing.dpapi'))); $taskPtr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecure); try {[Console]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPtr))} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPtr)}"],
      { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch { throw Error('Credential restoration failed. Details suppressed.'); }
  const balance = async () => {
    const response = await fetch('https://openrouter.ai/api/v1/key', { headers: { Authorization: 'Bearer ' + key }, redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Error('Key balance unavailable');
    const { data } = await response.json();
    if (!Number.isFinite(data.limit_remaining)) throw Error('Key allowance unavailable');
    return { at: new Date().toISOString(), remaining: data.limit_remaining, usage: data.usage, limit: data.limit };
  };
  if (stage === 'balance') {
    const after = await balance();
    save('key-after-' + Date.now() + '.json', after); save('key-after.json', after); summary();
    console.log(JSON.stringify(after));
  } else if (stage === 'prepare') {
    if (fs.existsSync(path.join(dir, 'protocol.json'))) throw Error('Trial already prepared');
    const before = await balance(); save('key-before.json', before);
    if (before.remaining < ceilingMicros / 1e6) throw Error('Insufficient allowance');
    const response = await fetch('https://openrouter.ai/api/v1/models/' + model + '/endpoints', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Error('Model metadata unavailable');
    const metadata = await response.json(); save('model-metadata.json', metadata);
    const endpoint = metadata.data.endpoints.find((e: any) => e.tag === 'anthropic');
    if (!endpoint || Number(endpoint.pricing.prompt) !== .000001 || Number(endpoint.pricing.completion) !== .000005) throw Error('Model price changed');
    const protocol = {
      at: new Date().toISOString(), authorization: 'User yes to restarting preview 4346 and retrying clarification plus remaining live checks within original $0.15 cap. Original failed trial preserved.',
      priorTrial: 'concept-live-v1', priorCalls: prior.length, priorActualUsd: prior.reduce((s: number, r: any) => s + r.receipt.costUsd, 0), priorReservationsMicros: prior.reduce((s: number, r: any) => s + r.reservedMicros, 0),
      model, ceilingUsd: .15, maxPaidCalls: 3, retryPolicy: 'One authorized clarification retry with already-fixed source, then plan and clear. Stop on failure. No additional retries or prompt retuning.',
      initialRequest: "I want to make a pet game, but I am not sure if players should rescue lost pets or battle with them. Help me choose what players actually do before building anything.",
      clearRequest: "Make a cozy single-player pet rescue game. Players find lost pets, carry them to a shelter, earn coins, and unlock the next forest path. Use a bright cartoon style. No combat or trading. Choose sensible defaults and do not ask me questions.",
      answerPolicy: 'Choose rescue rather than combat, solo play, and shelter/path progression. Use a suggested option for the main choice, custom plain-language answer for the next consequential choice, and explicit Choose for me delegation for incidental decisions. Record exact answers after inspecting initial questions.',
      gates: ['Ambiguous request asks about the unresolved rescue-versus-battle choice, not technical internals.', 'Clarification applies answers without repeating resolved choices.', 'No full plan before unresolved choices are settled.', 'Plan preserves requested rescue loop and binds user sources without reducing scope.', 'Clear request yields no questions and preserves all mechanics/exclusions.'],
      sourceHashes: Object.fromEntries(['src/generation/concept.ts','src/generation/engine.ts','src/generation/providers.ts','src/server/app.ts'].map(file => [file, hash(fs.readFileSync(file, 'utf8'))])),
      providerControl: 'Pin Anthropic, disable provider fallback, cap input/output prices. Same application prompts/schema/adapter, isolated app data and loopback HTTP API.',
    };
    
    const seed = JSON.parse(fs.readFileSync(path.join(priorDir, 'initial-project.json'), 'utf8'));
    fs.mkdirSync(path.join(dir, 'projects'), {recursive:true});
    save('initial-project.json', seed);
    save('answers.json', JSON.parse(fs.readFileSync(path.join(priorDir, 'answers.json'), 'utf8')));
    save('projects/' + seed.id + '.json', seed);
    save('prior-ledger.json', prior);
    const files = (folder: string): string[] => fs.readdirSync(folder, {withFileTypes:true}).flatMap(e => e.isDirectory() ? files(path.join(folder,e.name)) : [path.join(folder,e.name)]);
    save('prior-evidence-hashes.json', Object.fromEntries(files(priorDir).map(file => [path.relative(priorDir,file), hash(fs.readFileSync(file,'utf8'))])));
    save('protocol.json', protocol); summary(); console.log(JSON.stringify({ prepared: true, before, ceilingUsd: .15 }));
  } else {
    if (fs.existsSync(path.join(dir, 'stopped.json'))) throw Error('Trial stopped. No further inference permitted.');
    const protocol = read('protocol.json');
    const index = stages.indexOf(stage);
    if (index && !fs.existsSync(path.join(dir, stages[index - 1] + '-project.json'))) throw Error('Previous stage missing');
    const before = await balance(); save(stage + '-key-before.json', before);
    if (before.remaining < ceilingMicros / 1e6) throw Error('Insufficient remaining allowance');
    fs.writeFileSync(path.join(dir, stage + '.attempted.lock'), new Date().toISOString(), { flag: 'wx' });
    const transport: typeof fetch = async (url, init) => {
      if (String(url) !== 'https://openrouter.ai/api/v1/chat/completions') throw Error('Unexpected inference URL');
      const body = JSON.parse(String(init?.body));
      const reservedMicros = authorizeContinuation(stage, body, ledger, prior);
      body.provider = { order: ['Anthropic'], allow_fallbacks: false, max_price: { prompt: 1, completion: 5 } };
      const serialized = JSON.stringify(body);
      const row: any = { stage, at: new Date().toISOString(), reservedMicros, requestHash: hash(serialized), status: 'dispatched' };
      ledger.push(row); save('ledger.json', ledger); save(stage + '-request.json', body); summary();
      const response = await fetch(url, { ...init, body: serialized });
      const text = await response.text();
      // Store provider response only, never request headers or credential-bearing errors.
      fs.writeFileSync(path.join(dir, stage + '-response.json'), text.replaceAll(key, '[REDACTED]'));
      row.httpStatus = response.status; row.elapsedMs = Date.now() - Date.parse(row.at);
      const data = JSON.parse(text);
      row.receipt = receipt(data, reservedMicros); row.status = 'reconciled';
      save('ledger.json', ledger); summary();
      return new Response(text, { status: response.status, headers: { 'Content-Type': 'application/json' } });
    };
    const app = createApp(path.join(dir, 'projects'), { env: {}, transport });
    const config = app.locals.config;
    let profile = config.read().profiles[0];
    if (!profile) {
      profile = { id: randomUUID(), name: 'Live trial - Haiku 4.5', provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model, inputRate: 1, outputRate: 5, maxOutputTokens: 8000, requestTimeoutMs: 120000, jsonMode: true };
      config.save({ profiles: [profile], routes: { planner: [profile.id], builder: [], reviewer: [], repair: [] }, budgetMicros: ceilingMicros, generationBudgetMicros: ceilingMicros, reservationBudgetMicros: ceilingMicros, repairLimit: 0, researchEnabled: false });
    }
    config.setKey(profile.id, key);
    server = app.listen(0, '127.0.0.1');
    await new Promise<void>(r => server!.once('listening', r));
    const base = 'http://127.0.0.1:' + (server.address() as any).port;
    const api = async (route: string, method = 'GET', body?: unknown) => {
      const response = await fetch(base + '/api' + route, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw Error('Local API rejected stage: ' + response.status);
      return data;
    };
    let project = stage === 'initial' || stage === 'clear'
      ? await api('/projects', 'POST', { request: stage === 'initial' ? protocol.initialRequest : protocol.clearRequest })
      : await api('/projects/' + read((stage === 'clarify' ? 'initial' : 'clarify') + '-project.json').id);
    if (stage === 'clarify') project = await api('/projects/' + project.id, 'PATCH', { revision: project.revision, request: project.request, answers: read('answers.json') });
    if (stage === 'plan' && project.concept?.questions.length) throw Error('Concept still has unresolved choices');
    await api('/projects/' + project.id + '/' + (stage === 'plan' ? 'plan' : 'concept'), 'POST', { revision: project.revision, generationBudgetMicros: ceilingMicros });
    project = await app.locals.engine.wait(project.id);
    save(stage + '-project.json', project);
    const after = await balance(); save(stage + '-key-after.json', after); save('key-after.json', after); summary();
    config.setKey(profile.id, '');
    if (project.stage === 'failed' || project.stage === 'interrupted' || ledger.some(row => row.status !== 'reconciled')) {
      save('stopped.json', { at: new Date().toISOString(), stage, reason: project.error ?? 'Unreconciled charge' });
      process.exitCode = 1;
    }
    console.log(JSON.stringify({ stage, projectId: project.id, outcome: project.stage, concept: project.concept, error: project.error, after, calls: ledger.length, costUsd: ledger.reduce((sum, row) => sum + (row.receipt?.costUsd ?? 0), 0) }));
  }
} catch {
  save(stage + '-runner-error.json', { at: new Date().toISOString(), message: 'Trial stopped. Error detail suppressed to protect credentials. Inspect safe stage artifacts.' });
  if (stage !== 'prepare' && stage !== 'balance') save('stopped.json', { at: new Date().toISOString(), stage, reason: 'Runner error, no retry authorized' });
  summary(); console.log('Trial stopped. No inference retry. Inspect saved artifacts.'); process.exitCode = 1;
} finally {
  if (server) { server.closeAllConnections(); await new Promise<void>(r => server!.close(() => r())); }
  key = '';
}

