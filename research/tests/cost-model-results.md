# Illustrative cost model results

ILLUSTRATIVE ASSUMPTIONS ONLY — not measured Lemonade performance or actual provider prices

Success probabilities, token volumes, prices and infrastructure charges are hypothetical inputs. These rows do not estimate an improvement or compare real models. Perfect failure identification is assumed. Re-run after replacing inputs with measured data.

| Scenario | True success within budget | Online cost/request | Offline allocation/request | Cost/accepted result |
|---|---:|---:|---:|---:|
| Illustrative simple cheap workflow | 40.00% | $0.04020 | $0.00000 | $0.10050 |
| Illustrative structured cheap workflow | 81.80% | $0.03973 | $0.00000 | $0.04857 |
| Same structured workflow plus amortized offline work | 81.80% | $0.03973 | $0.01000 | $0.06079 |
| Illustrative strong workflow (not Astra pricing) | 90.00% | $0.29700 | $0.00000 | $0.33000 |

Token buckets are disjoint. Output includes all billed output/reasoning tokens without double counting. Each later stage is charged only when all previous stages fail; its success probability is conditional on that failure history.

## Sensitivity: structured workflow

These vary assumptions, not observations. All other inputs remain fixed; no offline cost in this table.

| Initial success | Infrastructure multiplier | Success within budget | Cost/accepted |
|---|---:|---:|---:|
| 30% | 1 | 63.60% | $0.07543 |
| 30% | 3 | 63.60% | $0.19763 |
| 50% | 1 | 74.00% | $0.05846 |
| 50% | 3 | 74.00% | $0.15279 |
| 65% | 1 | 81.80% | $0.04857 |
| 65% | 3 | 81.80% | $0.12663 |
| 80% | 1 | 89.60% | $0.04039 |
| 80% | 3 | 89.60% | $0.10504 |

With these inputs alone, the $1,000 offline investment needs at least 23,540 requests to beat the simple cheap workflow on amortized cost per accepted result. This excludes costs not entered in the configuration.
