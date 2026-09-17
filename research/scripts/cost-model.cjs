// Research calculator. No network, model calls, or product changes.
const fs = require('node:fs');
const path = require('node:path');
function finiteNonnegative(value, field) {
  if (!Number.isFinite(value) || value < 0) throw new Error(`Invalid ${field}`);
}
function stageCost(stage, rates) {
  const rate = rates[stage.model];
  if (!rate) throw new Error(`Unknown model: ${stage.model}`);
  const pairs = [['inputTokens', 'input'], ['cacheReadTokens', 'cacheRead'], ['cacheWriteTokens', 'cacheWrite'], ['outputTokens', 'output']];
  let tokens = 0;
  for (const [bucket, price] of pairs) {
    finiteNonnegative(stage[bucket], bucket);
    finiteNonnegative(rate[price], price);
    tokens += stage[bucket] * rate[price] / 1e6;
  }
  finiteNonnegative(stage.nonTokenCost, 'nonTokenCost');
  return tokens + stage.nonTokenCost;
}
function evaluate(scenario, rates) {
  if (!scenario.stages?.length) throw new Error('At least one stage is required');
  finiteNonnegative(scenario.offlineCost, 'offlineCost');
  if (!(scenario.amortizationRequests > 0) || !Number.isFinite(scenario.amortizationRequests)) throw new Error('Invalid amortizationRequests');
  let reach = 1, onlineCost = 0, success = 0, expectedStages = 0;
  const stages = [];
  for (const stage of scenario.stages) {
    const p = stage.conditionalSuccess;
    if (!Number.isFinite(p) || p < 0 || p > 1) throw new Error('Invalid conditionalSuccess');
    const cost = stageCost(stage, rates);
    stages.push({ reachProbability: reach, stageCost: cost, conditionalSuccess: p });
    onlineCost += reach * cost;
    success += reach * p;
    expectedStages += reach;
    reach *= 1 - p;
  }
  const offlinePerRequest = scenario.offlineCost / scenario.amortizationRequests;
  const totalCost = onlineCost + offlinePerRequest;
  return { name: scenario.name, success, onlineCost, offlinePerRequest, totalCost,
    costPerAccepted: success > 0 ? totalCost / success : null, expectedStages, stages };
}
function offlineBreakEvenVolume(baselineCostPerAccepted, improvedOnlineCost, improvedSuccess, offlineCost) {
  const headroomPerRequest = baselineCostPerAccepted * improvedSuccess - improvedOnlineCost;
  return headroomPerRequest > 0 ? Math.ceil(offlineCost / headroomPerRequest) : null;
}
if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const input = path.resolve(process.argv[2] || path.join(root, 'cost-scenarios.json'));
  const cfg = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (cfg.assumesCorrectVerification !== true) throw new Error('This calculator assumes correct verification; use empirical trace accounting otherwise');
  const results = cfg.scenarios.map(s => evaluate(s, cfg.ratesPerMillionTokens));
  const money = x => x === null ? 'undefined (no successes)' : `$${x.toFixed(5)}`;
  const rows = results.map(r => `| ${r.name} | ${(100*r.success).toFixed(2)}% | ${money(r.onlineCost)} | ${money(r.offlinePerRequest)} | ${money(r.costPerAccepted)} |`);
  const markdown = ['# Illustrative cost model results', '', cfg.status, '',
    'Success probabilities, token volumes, prices and infrastructure charges are hypothetical inputs. These rows do not estimate an improvement or compare real models. Perfect failure identification is assumed. Re-run after replacing inputs with measured data.', '',
    '| Scenario | True success within budget | Online cost/request | Offline allocation/request | Cost/accepted result |',
    '|---|---:|---:|---:|---:|', ...rows, '',
    'Token buckets are disjoint. Output includes all billed output/reasoning tokens without double counting. Each later stage is charged only when all previous stages fail; its success probability is conditional on that failure history.', '',
    '## Sensitivity: structured workflow', '',
    'These vary assumptions, not observations. All other inputs remain fixed; no offline cost in this table.', '',
    '| Initial success | Infrastructure multiplier | Success within budget | Cost/accepted |', '|---|---:|---:|---:|'];
  const structured = cfg.scenarios[1];
  const sensitivity = [];
  for (const p of [0.3, 0.5, 0.65, 0.8]) {
    for (const multiplier of [1, 3]) {
      const s = structuredClone(structured);
      s.offlineCost = 0;
      s.stages[0].conditionalSuccess = p;
      s.stages.forEach(t => t.nonTokenCost *= multiplier);
      const r = evaluate(s, cfg.ratesPerMillionTokens);
      sensitivity.push({ initialSuccess: p, infrastructureMultiplier: multiplier, ...r });
      markdown.push(`| ${(100*p).toFixed(0)}% | ${multiplier} | ${(100*r.success).toFixed(2)}% | ${money(r.costPerAccepted)} |`);
    }
  }
  const breakEvenRequests = offlineBreakEvenVolume(results[0].costPerAccepted, results[1].onlineCost, results[1].success, cfg.scenarios[2].offlineCost);
  markdown.push('', `With these inputs alone, the $1,000 offline investment needs at least ${breakEvenRequests?.toLocaleString('en-US') || 'no finite number of'} requests to beat the simple cheap workflow on amortized cost per accepted result. This excludes costs not entered in the configuration.`, '');
  fs.mkdirSync(path.join(root, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(root, 'tests/cost-model-results.md'), markdown.join('\n'));
  fs.writeFileSync(path.join(root, 'tests/cost-model-results.json'), JSON.stringify({ status: cfg.status, results, sensitivity, breakEvenRequests }, null, 2));
  console.log(markdown.join('\n'));
}
module.exports = { stageCost, evaluate, offlineBreakEvenVolume };
