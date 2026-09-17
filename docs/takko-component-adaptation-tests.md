# Worker-authored component adaptations

2026-09-16. The raw worker can now produce bounded edits to retained Marketplace components, and the native diagnostic can apply and recapture those edits without executing imported code. The second bubble-wrap attempt edits all 72 pop-script bindings while preserving their Marketplace sounds; the second checkpoint attempt explicitly requests Marketplace audio instead of substituting a built-in sound. **These are component adaptation tests, not completed games.** The post-edit reviewer also missed a documented runtime API violation, so its positive verdict is not an acceptance result.

## Implemented and verified

`src/generation/component-adaptation.ts` defines an evidence/context-bound manifest for deleting explicit subtrees and replacing existing sources. Repeated source bindings can use an explicit `indices` list with one replacement body. Validation rejects stale source hashes, duplicate/overlapping/deleted/non-source targets, root deletion, no-op changes, excessive replacement bytes, and deletion of all non-source content. Literal new media references must already occur in retained evidence, and known built-in audio is rejected. This is bounded literal checking, not complete dynamic data-flow analysis.

Native application requires an unparented component in Edit. It checks original hierarchy, sources, execution settings, media and configuration, refuses a deletion that breaks a readable retained Instance reference, and applies only declared removals/source edits. It compares retained readable serialized properties, attributes, tags, Sandboxed and Capabilities after editing. It captures a new native archive and destroys the working copy. Original archives remain unchanged. Host verification checks expected surviving identities, exact sources, media/configuration inventories and source bytes against the manifest before persisting a distinct adaptation record.

`loadAdaptedComponentEvidence` reconstructs the post-edit review packet from verified archives and the manifest, rather than from the worker's description of what it changed. Hash and inventory checks reject tampered records or caller-edited original evidence. Source review and runtime acceptance remain required.

Twenty-six tests cover these constraints, grouped targets, media rejection, immutable originals, regenerated review evidence and tampering. Final `npm run check` passed **831 unit/API +10 desktop +36 browser**, plus Luau, plugin, guards, build and production smoke. Native diagnostics additionally applied actual raw model manifests to the three frozen selected assets. No root-authored replacement game/source or manually chosen replacement asset was supplied.

The module and diagnostics are **not yet connected to the production asset pipeline's accept/export path**. The existing pipeline still stops after component review. The app on port4324 remains the prior PID36672 version; no restart was attempted this turn after the previous approval-review rejection. This turn is not an activation claim.

## Paid experiments

Same Gemini3.7Flash model and frozen worker-selected assets/game contexts. Each case permits at most two automatic calls under a $0.25 admission cap; each batch has a conservative $0.75 ceiling. All seven actual calls succeeded on the first contract attempt under their recorded schema. Raw results, failures discovered afterward, request/response bodies, inputs and billing are retained at `research/results/component-adaptation-v1`.

| Batch | Cases / calls | Actual cost | Result |
|---|---:|---:|---|
| Initial adaptation | 3 / 3 | $0.07624650 | All manifests applied natively; bubble edited only 1/72 pop scripts; checkpoint introduced built-in audio |
| Revised grouping/media contract | 2 / 2 | $0.06627675 | Bubble explicitly edits 72 pop scripts plus manager; checkpoint leaves audio acquisition outstanding |
| Review of recaptured revised outputs | 2 / 2 | $0.04230150 | Both called integration candidates; bubble has a missed runtime API violation |
| Total | 7 / 7 | **$0.18482475** | No gameplay acceptance |

This is a sequential diagnostic, not a controlled estimate of general success rates. Initial manifests and applied archives are preserved, including the checkpoint proposal that the stronger media validator now rejects. The original adaptation module is saved alongside the first trial. Current validation must not relabel that old trial as passing the new policy.

Provider usage settled from $2.782163136 to $2.966987886, exactly matching these calls. Remaining shared allowance: **$7.033012114** at 08:01 UTC; key expires September20 22:29UTC. No keys occur in retained model requests/responses. The existing encrypted credential is reused; no user re-entry was needed.

## Actual native results

`scripts/verify-component-adaptation.ts` compiles replacement sources, loads a retained restricted archive into unparented instances, applies the raw manifest through the new native function, transfers the complete capture in verified chunks, checks its inventory, persists a separate derivative, and cleans only its owned transfer folder. Engine version0.739.0.7390687, Place1 Edit.

| Trial/component | Before instances / scripts | After instances / scripts | Observed change |
|---|---:|---:|---|
| V1 combat | 20 / 2 | 17 / 0 | Worker removed unrelated loader subtree; rig and joints retained |
| V1 bubble | 375 / 76 | 365 / 72 | Worker removed loader and physical reset subtree; only one bubble script changed |
| V1 checkpoint | 4 / 1 | 4 / 1 | Worker source replaced; built-in sound remained an invalid proposal, never played |
| V2 bubble | 375 / 76 | 371 / 73 | Loader removed; all72pop bindings and existing manager source changed |
| V2 checkpoint | 4 / 1 | 4 / 1 | Source replaced; no new sound ID; explicit missing Marketplace audio |

All five applied outputs passed native restoration and exact declared-inventory validation. Evidence: `docs/results/takko-component-adaptation/native-{v1,v2}`. This verifies edit application and retention, not that the proposed features run correctly. Final read-only Studio check found no AdaptationTransfer_ scopes, Studio still in Edit, original Workspace.Butter present with Script enabled.

## Reviewer miss and next implementation need

V2 bubble's manager creates a LocalScript and assigns `clientScript.Source` during ordinary gameplay. A Luau AST audit locates the real assignment (not text inside a comment) at zero-based line116, and links it to the worker source hash. Roblox documents Script.Source as protected with PluginOrOpenCloud capability and says ordinary Script/LocalScript access causes errors. This is a documented static runtime blocker; no native playtest was claimed. [Roblox explanatory documentation](https://github.com/Roblox/creator-docs/blob/main/content/en-us/reference/engine/classes/Script.yaml).

Despite that, the raw reviewer labeled the recaptured component `integration_candidate` and described HUD counters as present. Preserve this as a reviewer false positive. Additional concerns such as reset during an active tween and global multiplayer state remain untested.

The edit interface currently cannot add a real pre-authored client script. The next step must support bounded, worker-authored script additions at Edit time with explicit parent, class, run context and security checks, rather than forcing the worker to squeeze client behavior into existing server scripts. Then require deterministic runtime-API checks and native behavior evidence, connect approved component derivatives to export/integration, and run fresh diverse end-to-end trials. Marketplace animation/audio acquisition, full combat behavior, parkour fall recovery and full-game acceptance remain outstanding.
