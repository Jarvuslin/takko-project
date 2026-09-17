# Crystal Hollow expert refinement

The Luna-generated V2 run ended with unresolved checks. A separate, explicitly authorized stronger-agent refinement fixes concrete defects while retaining the exact original project bytes and artifact hash. This is a model-plus-expert result, not unassisted model output or an autonomous quality pass.

## Reproduce the offline refinement

From the repository root, with the evaluation artifact and installed Luau CLI available:

```powershell
npx tsx scripts/refine-crystal-hollow.ts .forge/evaluations/takko-crystal-hollow-v2-20260915/trial-1/projects/630bccd2-04e0-4ac3-8827-6a56934bf2a8.json .forge/evaluations/takko-crystal-hollow-v2-20260915/expert-refinement
```

The script refuses a running project or a destination containing a different original snapshot. It makes no provider calls. Exact source anchors intentionally fail if the original implementation differs. The original run is read-only; output lives in `expert-refinement/`.

## Changes and evidence

- Sales increment `TotalSold`, allowing legitimate sales and upgrades to complete the personal goal. Upgrade results return zero as their documented amount.
- HUD feedback survives render calls for three seconds. A depleted nearby node gets its intended hint. The HUD respects Roblox's GUI inset.
- Goal celebration is deduplicated when the attribute arrives before or after the event; respawn restores steady presentation. Goal feedback omits the position field reserved for harvesting.
- Upright main crystal wedges plus two child shards form three visible pieces per cluster. Six excess third child shards are removed, bringing the world manifest to 42 entries. The strict resolver counts the main crystal plus two children.
- Upright station signs face spawn on their broad Back faces instead of their thin Top faces.

The executable regression runs the actual generated/refined Economy, HUD and Controller source under the Luau CLI. Only Roblox dependencies are mocked. It checks sales and progression, upgrade amounts and rejected purchases, toast lifetime and remount behavior, empty-node hints, and both goal-event orders with respawn. Five cases fail on the original; all six pass on the refined copy. Static validation and compilation of all seven files pass. `verification.json` records individual results, hashes and changes; `original-project.json` preserves original bytes.

## Limits

These are offline execution checks. The UI mock does not render text, calculate Roblox layout, simulate physics or reproduce networking. First-minute timing, floor accessibility, live controls, shared-node behavior and visual composition require native Studio verification.

The original generated review and protected tests remain unchanged as historical evidence. Its cluster assertion requires three *child* shards, which is four pieces when the main crystal is included. The refined interpretation has three visible pieces total. Do not report that original protected suite as passing unchanged. The refined `ready_to_test` state and pending native check are not gameplay or visual acceptance.
