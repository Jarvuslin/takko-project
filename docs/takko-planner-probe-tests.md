# Raw planner comparison support

2026-09-16. The benchmark controller now has explicit `mode: "plan" | "build"` (default build) and an optional configured `plannerModel`. Plan mode records the unedited response, contract correction attempts and structural gate, then settles and restores settings. It makes no asset-Studio binding, approval, build, export or native call. It never marks a game complete.

The planner override changes only the planner route. Worker and reviewer routing remain separately configured and explicitly recorded. A model must have exactly one configured keyed profile; malformed options and unavailable/ambiguous profiles fail before mutations. Frozen prompt hashes, spending admission, unknown-call liabilities, cancellation and settings restoration remain enforced.

Thirty-eight controller tests cover default behavior, successful plan probes, raw rejected plans, planning failure, cancellation, settings restoration, separated role routing, malformed options and missing/ambiguous profiles. TypeScript passed. Full **`npm run check` passed 986 unit/API, 10 desktop and 36 browser tests**, plus all other stages, exit 0. Log: `research/results/planner-probes-v1/check.log`.

The fresh v7 comparison uses three unchanged briefs and the same application instructions, 12,000 maximum output tokens and 300-second deadline for each planner. It compares Gemini 3.7 Flash with GPT-5.6 Sol through actual provider calls. Individual namespaces differ, and there is only one run per case/model; corrections and latency are part of the observed cost. The preregistered rubric and all raw artifacts are in `benchmarks/runs/marketplace-diversity-v7-20260916/`.

These probes assess whether plans investigate the requested reusable behavior and preserve user intent. They do not prove that the searched assets exist, that integration succeeds, or that a generated game passes native acceptance. Studio and the user's existing app configuration are unchanged by plan-mode probes.
