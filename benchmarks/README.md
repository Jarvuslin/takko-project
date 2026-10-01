# Benchmarks

Definitions live in `src/benchmark/cases.ts`. Starting fixtures live in `benchmarks/fixtures/`. These are inputs, not measurements of game quality.

Run `npm run benchmark -- <command>` to use the scoring and evidence utilities in `scripts/benchmark-quality.ts`. The CLI lists its supported commands when called without arguments. Store generated output outside tracked source directories.

Scoring requires the evidence and gates declared by each case. Offline tests and model reviews do not establish native gameplay. Retrospective submissions cannot stand in for a controlled generation run. Paid runs require a separate explicit budget authorization.
