# Restricted Marketplace restoration — native proof, integration pending

September 16, 2026. This advances the active raw-worker Marketplace-diversity goal. It is a product regression using frozen worker selections, not a new autonomous game benchmark.

The [earlier capture work](takko-component-archive.md) established that exact imported archives could not be deserialized by the MCP thread because they carried capabilities the thread cannot grant. Roblox documents a supported operation for restricting an instance: remove capabilities from its set. We tested the intersection of each owned imported instance's original capabilities with the current thread's capabilities. This grants no new permission and leaves `Sandboxed`, `Source` and `Disabled` unchanged. Original archives are saved before the diagnostic changes the owned staging import. [SecurityCapabilities API](https://create.roblox.com/docs/reference/engine/datatypes/SecurityCapabilities), [script capability rules](https://create.roblox.com/docs/scripting/capabilities).

In this Studio, all three imports required removal of `ScriptGlobals`, `DataStore` and `Network`. The original unrestricted capability set is not restored or treated as approved. The resulting component is an explicitly restricted derivative; any behavior requiring removed permissions remains unsupported until separately addressed. No imported code ran during these tests.

| Frozen worker selection | Instances | Script sources | Changed capability sets | Readable properties checked after restoration | Internal references checked |
| --- | ---: | ---: | ---: | ---: | ---: |
| Combat training dummy | 20 | 2 | 2 | 447 | 13 |
| Bubble-wrap ASMR | 375 | 76 | 76 | 5,981 | 0 |
| Checkpoint parkour | 4 | 1 | 1 | 70 | 0 |

All three restricted versions passed native serialization/deserialization comparison. Every source hash matched the immutable original source manifest. Every changed instance retained its enabled sandbox; source text and script enablement remained unchanged. The shared archive validator now explicitly compares `Sandboxed` and `Capabilities` between originals and restored instances even when reflection does not label these properties serialized. New offline Luau tests reject lost sandboxing and expanded capabilities independently of the reflection property list.

This proves a bounded restoration path, not game compatibility. Some serialized properties remain unreadable to the comparison and are listed in each result. Native execution, sound/animation availability, dependency completeness, correct gameplay and export integration are still unverified. The production asset loop still halts on complete scripted-component reuse; this diagnostic does not remove that gate or automatically narrow live asset permissions.

## Evidence and reproduction

Run the explicit diagnostic with a connected Edit-mode Studio and a fresh output directory:

```powershell
npx tsx scripts/verify-restricted-component.ts STUDIO_UUID FRESH_OUTPUT_DIRECTORY
```

The script re-searches each original query and requires its original worker-selected candidate to still be returned. It saves the original full archive, performs the bounded native permission-reduction/restoration probe, checks original source hashes, and discards only the owned import. It never starts Play, executes imported scripts, substitutes a new root-selected asset or calls a model. Unknown transport outcomes stop rather than assuming cleanup is safe. Native acceptance failures are retained and return a nonzero exit code.

The first diagnostic failed because its assertion saved `Disabled=false` as nil through Luau's `and/or` idiom. The original script's enablement did not change; the diagnostic was corrected without altering asset code. That failure is preserved. V2 passed restoration. V3 reran all three with the explicit restored-sandbox/capability checks and stricter acceptance assertions, and is the authoritative result.

- [V3 native results](results/takko-component-restriction/native-v3/result.json), including original capture paths, source hashes, permission removals, restored-property coverage and cleanup receipts.
- [Preserved first diagnostic failure](results/takko-component-restriction/native-v1/failure.json).
- [Verification index](results/takko-component-restriction/verification.json), [final state](results/takko-component-restriction/native-cleanup.json) and [full check log](results/takko-component-restriction/check.log).

The final full check passed 696 unit/API tests, 10 desktop tests, 36 browser tests and all remaining stages. This is distinct from the native restoration evidence above.

During activation, the previous app process (PID22236) and its port4324 listener were confirmed absent. The attempted reload failed before changing any process. Takko was restarted from checked source at the same address/data directory as PID24564. Projects and model profiles remain, but all memory-only API keys are absent. The user was asked to re-enter the two test-route keys in Takko's Models UI; no paid run was attempted without them. [Current activation record](results/takko-component-restriction/activation.json) is separate from the preserved previous activation.

Absolute `.forge` paths in copied immutable evidence still identify original files. The verification index validates the retained copies by hash. Restricted binary hashes were recorded from native buffers, but restricted archives were not persisted as deliverable components in this diagnostic. No production export or deployable game is implied.

## Next required product work

Implement an explicit reviewed derivative path: retain the original archive, validate a restricted derivative and its permission delta, persist the derivative artifact, and bind review to both identities and the requested player experience. Full source/media/dependency review must precede execution. Duplicate source bodies may be presented once with every instance binding retained, but no source may be silently omitted. Workers must distinguish existing behavior, missing integration and permission-incompatible behavior before writing code.

Then integrate reviewed components with owned boundaries and export persistence, establish an isolated native play fixture, and run fresh raw trials across combat (including animations/dummy/hit counter/SFX), ASMR and parkour. Preserve the original frozen failures and avoid root-written game rescue. The current evidence does not establish a finished game or general worker understanding.
