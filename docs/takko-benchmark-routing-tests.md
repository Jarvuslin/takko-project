# Explicit benchmark source review and budget batches

The benchmark controller now accepts optional `componentReviewerModel` and `campaignCeilingMicros`. Source-review selection requires one matching configured profile with a key before any trial mutation. It sets only the optional component-review route; normal reviewer/audio routing remains independently fixed. Without the option, the trial uses legacy reviewer behavior even if saved settings contain a source override. Original settings are restored afterward.

The cumulative ceiling defaults to the historical$6 and accepts an explicit integer limit up to the user's$10 key limit. Admission, monitoring, both accounting helpers, terminal checks and experiment/results metadata use the chosen ceiling. Prior charges/unknown liabilities and headroom remain counted; historical reservations remain separate under settled-plus-active trials. Raising a ceiling must be explicitly registered in the new protocol, never silently applied to older results.

59 controller tests and TypeScript passed, including unknown/missing/unkeyed/ambiguous source profiles, invalid ceilings, default versus explicit admission under both accounting policies, cancellation at the selected bound, route restoration and unchanged raw plans. Full `npm run check` after both application and controller changes passed **1,102 unit/API +10 desktop +36 browser tests** and all stages. Log: `benchmarks/runs/marketplace-diversity-v10-20260916/check.log`.

The [V10 protocol](../benchmarks/runs/marketplace-diversity-v10-20260916/PROTOCOL.md) registers the next fresh combat trial at$1.30 project/$7.50 cumulative/$0.40 headroom with all previous liabilities carried forward. These controls prepare a raw experiment; passing controller tests is not evidence of game quality.

The [completed trial](../benchmarks/runs/marketplace-diversity-v10-20260916/RESULTS.md) used the override for both source reviews, restored original routes, and reconciled all six charges. It failed on actual adaptation defects for$0.46199245; neither the project nor campaign budget stopped it. No complete game or native gameplay pass resulted.
