# Retained restricted Marketplace components

September 16, 2026. This is product progress toward the active raw-worker diversity goal. It does not count as a new worker trial or a completed game.

The previous diagnostic proved native restoration after reducing permissions but did not retain the restricted binary. Takko now provides an explicit inert `StudioAssetAdapter.captureRestrictedComponent` operation. It first verifies the already-saved original archive and source manifest, binds the native cached original to the same inspection, checks unchanged hierarchy/source/enablement, removes only capabilities unavailable to the current thread, and captures the restricted result. It transfers the result in verified chunks and persists a separate RBXM, manifest and review packet.

The operation never enables scripts, changes source, removes sandboxing, starts Play or clears the original capability-review block. It grants no capabilities. Host validation checks that each resulting permission set is exactly the intersection of the original set with the current thread's set, with a complete per-instance before/after inventory. A failed native restoration cannot be retained as a successful derivative. Original and derived archives remain separate and content-addressed.

This is an explicit preparation API, not an automatic production acceptance path. The engine's current asset loop still halts for complete component review. Source/dependency review, behavior under reduced permissions, owned integration, media auditions and export remain required.

## Native evidence

The diagnostic replayed the same three original worker-selected Marketplace candidates, with no substituted asset IDs, game-code fixes, model calls or imported-script execution.

| Frozen selection | Instances retained | Scripts retained | Unique source bodies | Permission sets reduced | Native derivative restored |
| --- | ---: | ---: | ---: | ---: | --- |
| Combat training | 20 | 2 | 2 | 2 | Yes |
| Bubble-wrap ASMR | 375 | 76 | 5 | 76 | Yes |
| Checkpoint parkour | 4 | 1 | 1 | 1 | Yes |

All original archives remain intact. All source, hierarchy and script execution-setting inventories match the originals. The native restoration comparison includes sandbox/capability preservation and records unreadable properties rather than claiming they were checked. All three required removal of DataStore, Network and ScriptGlobals. Whether their behavior needs these rights is still a review/runtime question.

The review packet stores each exact source body once and retains every indexed instance binding, class, enablement and run context. For bubble wrap this reduces repeated source text from 33,947 to 19,534 UTF-8 bytes, while retaining all 76 bindings. These are source-byte counts, not token counts, model-quality evidence or measured API savings. Complete-source availability does not establish complete dependency analysis: `securityReview`, `dependencyReview`, `runtimeVerification` and `exportConversion` remain `not_performed`.

Packets bind the Studio identity, owned scope/token, selected candidate, original and derivative hashes and game-context input hash. The diagnostic records the actual source-backed game context next to the packet. Imported source remains untrusted evidence for the future reviewer.

Final native scan: Place1 remains Edit; no owned `DerivativeRegression_` scopes remain; the user's original Workspace.Butter and its enabled Script remain present. The installed third-party plugin's cached asset version remains68657693815716 with the same SHA-256 as the preserved snapshot; this implementation changes Takko's own adapter rather than that plugin.

## Verification and reproduction

- [Native result and receipts](results/takko-component-derivative/native-v1/result.json).
- [Revalidation of saved native payloads against final host checks](results/takko-component-derivative/host-recheck.json).
- [Native cleanup scan](results/takko-component-derivative/native-cleanup.json).
- [Verification index](results/takko-component-derivative/verification.json) and [full check log](results/takko-component-derivative/check.log).

```powershell
npx tsx scripts/verify-component-derivative.ts STUDIO_UUID FRESH_OUTPUT_DIRECTORY
npx tsx scripts/recheck-component-derivative.ts EXISTING_RESULT_DIRECTORY
```

The first command requires an explicitly selected, connected Edit-mode Studio. It re-searches frozen queries and fails if the original worker selection is no longer returned. The second command performs only local evidence validation. It does not repeat a native operation. Copied result records preserve absolute original `.forge` paths; the rechecker resolves copied evidence by content-addressed basenames under the selected result directory.

Tests cover all-source binding retention, damaged originals, changed source/hierarchy/enablement, lost sandboxing, expanded permissions, unnecessary permission removals, forged deltas, missing security rows, engine-version mismatch, bounded transfers and uncertain mutation handling. The fixed restriction Luau also executes in the offline Luau harness: stale/unsaved source or changed hierarchy/enablement must fail before any permission mutation. Offline tests and native evidence are separate.

The final full `npm run check` passes 724 unit/API tests, 10 desktop tests, 36 browser tests and the Luau/plugin/guard/build/production checks. The first check passed before two stricter host-validation conditions were added; the final check and saved-native revalidation cover those conditions. No upstream agent-framework code or new dependency was introduced.

## Remaining work and runtime state

Next is complete source/media/dependency review tied to the game contract, then a supported integration/export path and isolated native gameplay verification. Only after that gate can fresh raw benchmarks across ASMR, fighting with motion/dummy/hit counter/SFX, and parkour test the workers beyond the previously known importer stop. Preserve all earlier failed attempts; no root-authored game rescue is authorized as benchmark success.

The live Takko service remains PID24564 at localhost4324. Its model profiles/routes are intact, but all nine profiles have no API key. Paid raw trials remain unavailable until keys are re-entered in Models. No paid calls, budget changes, model-route changes or live-service reload occurred in this slice. Native diagnostics loaded the new adapter directly from source; the existing live process was not represented as newly activated.
