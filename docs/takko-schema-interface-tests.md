# Explicit sourcing choices and schema metadata

V9 exposed four avoidable format corrections: one Sol plan copied `default` into asset needs, and three Gemini reviews copied root `$schema`. Those correction calls cost $0.158369. The raw run separately failed mandatory course sourcing below its budget cap; improving formatting does not solve that failure or its adaptation defects.

`engine.ts` now omits the root dialect annotation from model-facing schemas and clearly requests a data instance. `requirements.ts` advertises an explicit boolean `required`: true means successful acquisition is mandatory, while optional visual/course sourcing must still follow existing discovery, fallback and capability rules. It never waives required audio or gameplay. Saved/runtime parsing retains compatibility defaults; no existing plan or raw answer is repaired automatically.

Tests cover actual Engine prompt/schema output, strict rejection of copied metadata, explicit false preservation, legacy omitted values defaulting true and unchanged sourcing rules. **183 focused tests + TypeScript passed; full check1,051unit/API+10desktop+36browser/allstages passed.**

[Fresh probes](../research/results/schema-interface-v1/RESULTS.md) both passed on their first responses: Sol plan$0.067809, Gemini checkpoint review$0.049751. The plan still explicitly requires a course asset, and the review still over-rejects reusable content. These are formatting improvements on specific samples, not full semantic or game-success results. [V9's raw results](../benchmarks/runs/marketplace-diversity-v9-20260916/RESULTS.md) preserve the unresolved sourcing and adaptation problems.
