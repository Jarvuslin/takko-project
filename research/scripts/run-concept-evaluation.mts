import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { createApp } from '../../src/server/app';
import { receipt } from './concept-live-guard.mjs';
import { authorizeEvaluation, model, stages } from './concept-evaluation-policy.mjs';
import { DispatchDenied } from '../../src/generation/providers';
import { authorizeAvailableReservation } from './concept-evaluation-policy.mjs';
import express from 'express';
import { chromium, type Browser, type BrowserContext } from '@playwright/test';

const dir = path.resolve('research/results/concept-live-v3');
const proposal = JSON.parse(fs.readFileSync(path.join(dir,'protocol-proposal.json'),'utf8'));
if (!fs.existsSync(path.join(dir,'authorization.json'))) { console.log('Awaiting explicit authorization for the proposed combined ceiling. No credential read or inference attempted.'); process.exit(2); }
const approval = JSON.parse(fs.readFileSync(path.join(dir,'authorization.json'),'utf8'));
if (approval.approved !== true || approval.ceilingMicros !== proposal.combinedCeilingMicros || !approval.userMessage || !approval.at) throw Error('Invalid run authorization');
const ceilingMicros = approval.ceilingMicros;
const prior = ['v1','v2'].flatMap(v => JSON.parse(fs.readFileSync(path.resolve('research/results/concept-live-'+v+'/ledger.json'),'utf8')));
if (prior.length !== 3 || prior.reduce((s,r)=>s+r.reservedMicros,0) !== 46313) throw Error('Historical spending changed');
let plannedReservation = 0;
fs.mkdirSync(dir, { recursive: true });
const stage = process.argv[2];
const save = (name: string, data: unknown) => fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2));
const read = (name: string) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const hash = (data: string) => createHash('sha256').update(data).digest('hex');
let key = '';
let server: ReturnType<ReturnType<typeof createApp>['listen']> | undefined;
let browser: Browser | undefined;
let context: BrowserContext | undefined;
const ledger: any[] = fs.existsSync(path.join(dir, 'ledger.json')) ? read('ledger.json') : [];
const summary = () => {
  const before = fs.existsSync(path.join(dir, 'key-before.json')) ? read('key-before.json') : null;
  const after = fs.existsSync(path.join(dir, 'key-after.json')) ? read('key-after.json') : null;
  const total = ledger.reduce((sum, row) => sum + (row.receipt?.costUsd ?? 0), 0);
  const unknown = ledger.filter(row => row.status !== 'reconciled').reduce((sum, row) => sum + row.reservedMicros, 0);
  fs.writeFileSync(path.join(dir, 'RESULTS.md'), `# Live concept trial\n\nModel: ${model}. User-authorized combined ceiling $5.00 across prior trials and this evaluation. Prior actual $0.011967, reservations $0.046313. One dispatch per stage, stop on failure.\n\nCalls dispatched: ${ledger.length}. Provider-reported total: $${total.toFixed(9)}. Unreconciled reservation: $${(unknown / 1e6).toFixed(6)}.\n\nBefore: ${before ? '$' + before.remaining + ' at ' + before.at : 'not read'}. Latest after: ${after ? '$' + after.remaining + ' at ' + after.at : 'not read'}.\n\n` + ledger.map(row => `- ${row.stage}: reservation $${(row.reservedMicros / 1e6).toFixed(6)}, actual ${row.receipt ? '$' + row.receipt.costUsd.toFixed(9) : 'unknown'}, ${row.status}, ${row.at}.`).join('\n') + '\n\nSee stage project snapshots for contract outcomes and the final report for semantic review. This is not a Studio/gameplay test.\n');
};
try {
  if (!['prepare', 'balance', ...stages].includes(stage)) throw Error('Unknown command');
  try {
    if (process.env.FORGE_TEST_KEY_STDIN === '1') {
      for await (const chunk of process.stdin) key += chunk.toString();
      key = key.trim();
      if (!key) throw Error('Missing local key');
    } else {
    key = execFileSync('pwsh.exe', ['-NoProfile', '-NonInteractive', '-Command',
      "$taskSecure=ConvertTo-SecureString ([IO.File]::ReadAllText((Join-Path $env:LOCALAPPDATA 'Takko\\secrets\\openrouter-testing.dpapi'))); $taskPtr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecure); try {[Console]::Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPtr))} finally {[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPtr)}"],
      { windowsHide: true, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    }
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
    const rememberPath = path.resolve('.forge/remember-openrouter-key.json');
    if (fs.existsSync(rememberPath)) {
      const remember = JSON.parse(fs.readFileSync(rememberPath, 'utf8'));
      if (remember.authorized !== true || remember.action !== 'save-current-testing-key' || Date.now() - Date.parse(remember.at) > 600000 || !Number.isFinite(Date.parse(remember.at))) throw Error('Invalid credential-save authorization');
      const saved = execFileSync('pwsh.exe', ['-NoProfile', '-NonInteractive', '-File', path.resolve('research/scripts/save-testing-key.ps1')], {input: key, encoding:'utf8', windowsHide:true, stdio:['pipe','pipe','pipe']});
      fs.writeFileSync(path.resolve('docs/results/openrouter-key-storage.json'), saved);
      fs.renameSync(rememberPath, path.resolve('.forge/remember-openrouter-key-completed-' + Date.now() + '.json'));
      console.log('Testing key saved with Windows account encryption and verified. No key output.');
    }
    console.log(JSON.stringify(after));
  } else if (stage === 'prepare') {
    if (fs.existsSync(path.join(dir, 'protocol.json'))) throw Error('Trial already prepared');
    const before = await balance(); save('key-before.json', before);
    if (before.remaining <= 0) throw Error('Insufficient allowance');
    const response = await fetch('https://openrouter.ai/api/v1/models/' + model + '/endpoints', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw Error('Model metadata unavailable');
    const metadata = await response.json(); save('model-metadata.json', metadata);
    const endpoint = metadata.data.endpoints.find((e: any) => e.tag === 'anthropic');
    if (!endpoint || Number(endpoint.pricing.prompt) !== .000001 || Number(endpoint.pricing.completion) !== .000005) throw Error('Model price changed');
    const protocol = {
      at: new Date().toISOString(), authorization: approval, proposal, priorCalls: prior.length, priorReservationsMicros: 46313, priorActualUsd: .011967,
      model, ceilingUsd: ceilingMicros / 1e6, maxPaidCalls: 4, retryPolicy: 'One provider dispatch per stage. Stop after failure. No prompt retuning or rerun.',
      initialRequest: "I want to make a pet game, but I am not sure if players should rescue lost pets or battle with them. Help me choose what players actually do before building anything.",
      clearRequest: "Create a solo pizza shop game. Customers order a pizza, I choose the toppings, bake and serve it, earn coins, and buy a faster oven. Cartoon style, no fighting or trading. Choose sensible defaults and ask no questions.",
      answerPolicy: 'Choose rescue rather than combat, solo play, and shelter/path progression. Use a suggested option for the main choice, custom plain-language answer for the next consequential choice, and explicit Choose for me delegation for incidental decisions. Record exact answers after inspecting initial questions.',
      gates: ['Ambiguous request asks about the unresolved rescue-versus-battle choice, not technical internals.', 'Clarification applies answers without repeating resolved choices.', 'No full plan before unresolved choices are settled.', 'Plan preserves requested rescue loop and binds user sources without reducing scope.', 'Clear request yields no questions and preserves all mechanics/exclusions.'],
      sourceHashes: Object.fromEntries(['src/generation/concept.ts','src/generation/output-contract.ts','src/generation/engine.ts','src/generation/providers.ts','src/server/app.ts'].map(file => [file, hash(fs.readFileSync(file, 'utf8'))])),
      providerControl: 'Pin Anthropic, disable provider fallback, cap input/output prices. Same application prompts/schema/adapter, isolated app data and loopback HTTP API.',
    };
    save('protocol.json', protocol); summary(); console.log(JSON.stringify({ prepared: true, before, ceilingUsd: ceilingMicros / 1e6 }));
  } else {
    if (fs.existsSync(path.join(dir, 'stopped.json'))) throw Error('Trial stopped. No further inference permitted.');
    const protocol = read('protocol.json');
    const index = stages.indexOf(stage);
    if (index && (!fs.existsSync(path.join(dir, stages[index - 1] + '-review.json')) || read(stages[index - 1] + '-review.json').passed !== true)) throw Error('Previous stage must pass semantic review before continuing');
    const before = await balance(); save(stage + '-key-before.json', before);
    if (before.remaining <= 0) throw Error('Insufficient remaining allowance');
    fs.writeFileSync(path.join(dir, stage + '.attempted.lock'), new Date().toISOString(), { flag: 'wx' });
    const transport: typeof fetch = async (url, init) => {
      if (String(url) === 'https://openrouter.ai/api/v1/models/' + model + '/endpoints' && !init?.method) {
        const metadata = await fetch(url, init);
        save(stage + '-endpoint-metadata.json', await metadata.clone().json());
        return metadata;
      }
      if (String(url) !== 'https://openrouter.ai/api/v1/chat/completions') throw new DispatchDenied('Unexpected inference URL');
      const body = JSON.parse(String(init?.body));
      let reservedMicros: number;
      try { reservedMicros = authorizeEvaluation(stage, plannedReservation, ledger, prior, ceilingMicros); }
      catch { throw new DispatchDenied('Evaluation dispatch is not authorized under the recorded call/budget policy.'); }
      const expected = Buffer.byteLength(body.messages.map((m: any) => m.content).join('')) + (body.response_format?.type === 'json_schema' ? Buffer.byteLength(JSON.stringify(body.response_format.json_schema.schema)) : 0) + 1024 + body.max_tokens * 5;
      if (expected !== reservedMicros || body.model !== model) throw new DispatchDenied('Request differs from the reserved evaluation dispatch.');
      body.provider = { ...body.provider, order: ['Anthropic'], allow_fallbacks: false, max_price: { prompt: 1, completion: 5 } };
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
    const app = createApp(path.join(dir, 'projects'), { env: {}, transport, executionPolicy: {
      maxAttempts: 1, allowFallbacks: false,
      beforeDispatch: request => {
        try { plannedReservation = authorizeAvailableReservation(authorizeEvaluation(stage, request.reservedMicros, ledger, prior, ceilingMicros), before.remaining); }
        catch { throw new DispatchDenied('Combined evaluation call/reservation allowance exhausted before dispatch.'); }
      },
    } });
    const config = app.locals.config;
    let profile = config.read().profiles[0];
    if (!profile) {
      profile = { id: randomUUID(), name: 'Live trial - Haiku 4.5', provider: 'openrouter', baseUrl: 'https://openrouter.ai/api/v1', model, inputRate: 1, outputRate: 5, maxOutputTokens: 4000, structuredOutput: 'anthropic', requestTimeoutMs: 120000, jsonMode: true };
      config.save({ profiles: [profile], routes: { planner: [profile.id], builder: [], reviewer: [], repair: [] }, budgetMicros: ceilingMicros, generationBudgetMicros: ceilingMicros, reservationBudgetMicros: ceilingMicros, repairLimit: 0, researchEnabled: false });
    }
    config.setKey(profile.id, key);
    app.use(express.static('dist'));
    app.get('/{*path}', (_req, res) => res.sendFile(path.resolve('dist/index.html')));
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
    if (stage === 'plan' && project.concept?.questions.length) throw Error('Concept still has unresolved choices');
    browser = await chromium.launch({headless:true});
    context = await browser.newContext({viewport:{width:1440,height:1000}, recordVideo:{dir:path.join(dir,'video'),size:{width:1440,height:1000}}, reducedMotion:'reduce'});
    const page = await context.newPage();
    await page.goto(base + '/?project=' + project.id);
    await page.getByLabel('Project request',{exact:true}).waitFor();
    await page.waitForTimeout(1500);
    if (stage === 'clarify') {
      for (const [id,answer] of Object.entries(read('answers.json'))) {
        await page.locator('#concept-' + id).fill(String(answer));
        await page.waitForTimeout(600);
      }
    }
    const button = stage === 'plan' ? 'Use this concept & plan' : stage === 'clarify' ? 'Update my concept' : 'Shape my idea';
    await page.getByRole('button',{name:button,exact:true}).scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(dir,stage+'-before.png')});
    await Promise.all([
      page.waitForResponse(r=>r.url().endsWith('/'+(stage==='plan'?'plan':'concept')) && r.request().method()==='POST'),
      page.getByRole('button',{name:button,exact:true}).click(),
    ]);
    project = await app.locals.engine.wait(project.id);
    save(stage + '-project.json', project);
    await page.waitForTimeout(2500);
    await page.screenshot({path:path.join(dir,stage+'-after.png'),fullPage:true});
    const card = page.getByRole('region',{name:'Your game concept'});
    if (await card.count()) {
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1800);
      const guide = card.getByText('How you’ll check it after building',{exact:true});
      if (await guide.count()) await guide.click();
      await page.mouse.wheel(0,450);
      await page.waitForTimeout(1800);
    }
    const video = page.video();
    await context.close(); context = undefined;
    if (video) await video.saveAs(path.join(dir,stage+'-live.webm'));
    await browser.close(); browser = undefined;
    const after = await balance(); save(stage + '-key-after.json', after); save('key-after.json', after); summary();
    config.setKey(profile.id, '');
    if (project.stage === 'failed' || project.stage === 'interrupted' || (['clarify','clear'].includes(stage) && project.concept?.readiness !== 'review') || ledger.some(row => row.status !== 'reconciled')) {
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
  if (context) await context.close();
  if (browser) await browser.close();
  if (server) { server.closeAllConnections(); await new Promise<void>(r => server!.close(() => r())); }
  key = '';
}

