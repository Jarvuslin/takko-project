# Crystal Hollow authored visual refinement

This is an expert-authored art pass over the frozen Luna-plus-expert candidate. It is not unassisted model output, a new paid generation run, or proof of autonomous game quality.

## Candidate and reproduction

The frozen input is `.forge/evaluations/takko-crystal-hollow-v2-20260915/expert-refinement/project.json`. The current candidate is `visual-refinement-v2/project.json` beneath the same evaluation directory. The script refuses existing destinations and preserves the original input bytes beside every candidate.

```powershell
npx tsx scripts/polish-crystal-hollow.ts .forge/evaluations/takko-crystal-hollow-v2-20260915/expert-refinement/project.json .forge/evaluations/takko-crystal-hollow-v2-20260915/visual-refinement-v3 C:/Users/7474g/Downloads/Takko-Crystal-Hollow-Polished-v3.rbxlx
```

Choose unused output paths. The example intentionally uses a new suffix rather than overwriting V2. The current usable export is `C:/Users/7474g/Downloads/Takko-Crystal-Hollow-Polished-v2.rbxlx`.

V2 hashes:

- Bundle: `5190a564e55264c10ac8d1a4da30ef3a076cdf88c77d6a149c8479a3b6603eb9`
- Place export SHA-256: `6ff9e32c4cd1a98336fbb784628c680fa6660324331508d545ce24d920b7c35a`
- Frozen input project SHA-256: `98499fc7d38b267f86942329249cdb570f9a2649a0804ff11740152c43eb4823`

## Art direction and preserved behavior

The scene contains 194 World entries, including 183 authored geometric objects. A round quarry island replaces the square slab. Layered cliff masses, irregular crowns and lower rock shelves enclose the playable area. Low paths connect the mining routes. Six harvest clusters use tilted, differently sized wedge shards, with limited neon accents against solid crystal colors. Each runtime node retains exactly two child shards.

A gold canvas merchant kiosk, scales and ore crate distinguish selling from the purple workshop, anvil, pick and bag. Explicit sign canvas dimensions and labels that fill the board correct the earlier partial-board text layout. A stepped beacon monument, split crown, planting clusters and four small warm lanterns provide focal points and warm/cool contrast. All geometry is serialized into the place and exists before Play.

The original 35–45-entry art budget and three-light limit are intentionally superseded for this separately authored candidate. The original specification, review and protected tests are retained as historical evidence; this is not a claim that their original numerical limits pass unchanged.

The scene transformation preserves all seven source files byte for byte. The combined candidate then applies the independently tested `refineCrystalHollowFeedback` helper to HUD and Feedback only: completion messages retain priority, and interrupted button pulses restore their original color. Economy, Game, Contract, Controller and World sources remain unchanged. Existing node/station identities and horizontal interaction positions remain intact. No external assets, paid model calls, global lighting changes or Studio operations are performed by this script.

## Validation and known limits

The first visual candidate is preserved under `visual-refinement/`. Review found Node04 buried inside a collidable cliff. V2 moves every offending cliff mass, crown and foot outward until its full rotated bounding box clears four-stud approach disks and the terrace route corridors. The tests sample all six node centers and route points at one-stud intervals; they conservatively treat a wedge's empty corners as solid.

Five dedicated tests cover input/source preservation, runtime identities, exact native property metadata, orthonormal transforms, scoped anchored geometry, low first-loop paths, label sizing, cliff clearance and deterministic XML export. The candidate separately passes manifest validation and compilation of all seven actual Luau files. `verification.json` contains these checks and artifact hashes.

The full `npm run check` completed successfully on 2026-09-15: 218 unit/API tests, 10 desktop tests, 34 browser tests, plus Luau, plugin, guard, build and production checks. The subsequently developed scene-diff color-quantization fix requires its own targeted validation; it was not included in that 218-test baseline.

The checks above are offline checks. Root subsequently applied V2 to Studio, verified all declared world properties and seven script sources, navigated to all six harvest nodes, and passed the actual solo harvest/sell/upgrade/goal/respawn loop. Completion messaging is visibly fixed. See [separate native evidence and remaining limits](crystal-hollow-polished-native-verification.md). User aesthetic acceptance, multiplayer and touch gameplay remain unverified.
