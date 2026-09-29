# Approved asset binding correction

2026-09-25 UTC. The saved fighting benchmark now resolves its four approved selections to the four existing asset needs offline. No fifth animation-pack need is created. Live gameplay has not been rerun.

## Direct answer about the old test

Yes. The old fixture was shaped around the implementation's assumption that requirement prose contained a catalog number. It was not representative of the planner output. Deleting every requirement then tested a different, trivial failure. That test confirmed the implementation's assumption and missed the real defect. The earlier green suite did not establish that the approved-asset handoff worked with actual planner output.

AGENTS.md now records the producer-grounded fixture rule for future work. The replacement happy path describes punching behavior without an asset number. Numeric prose appears only in a separately named legacy-compatibility regression. The principal new regression reads the preserved terminal-project.json directly. It verifies that no chosen ID appears in any requirement description or acceptance text, resolves all four needs, and checks that the saved project is unchanged. Another removes catalog numbers from asset-need constraints too. The binding does not require the model to repeat IDs in text.

## Changes

Discovery with an existing specification now derives its search groups from assetNeeds and stores assetNeedId. Refreshing an existing group can retain its identity while adding the need link. IDs are persisted with discovery state. Raw brief keyword searches remain available before a specification exists.

The host resolves group to asset need to requirement. Explicit need identity takes priority over display text. Older groups without that edge use normalized role, label and search-query similarity filtered by compatible asset kind. Uploader names are not used to decide which requirement an asset implements. Equally scoring candidates, stale explicit links, missing requirements and conflicting group assignments fail instead of silently choosing. The old numeric-prose representation is a final compatibility fallback, never a required producer contract.

buildAssetNeeds and approvedAssetAdapter use the same resolver. The adapter restricts acquisition to the selected reference for that exact need and requirement. Optional unrelated searches do not receive approved assets for another purpose. A Model containing an Animation is acquired as a Model under the original need ID. The logical specification remains Animation and its selected clip and other saved state remain unchanged. This follows the actual imported container kind and prevents the duplicate fifth need.

Ordinary imports already place their root at Assets/need.id. Retained components now also receive the stable need ID as their exported root name. A host naming overlay changes only the root Name property in the exported XML. It preserves descendant names, properties, references, source text and the original captured archive. The integration record binds the new XML hash and root name. Existing records without the overlay retain their original identity. Builder context supplies the stable rootPath and distinguishes the original uploader name. Name-sensitive behavior inside retained scripts still requires integration review and native testing.

## Regression evidence

01-red.log records three failing regressions before any product-source edits. The saved terminal project reproduces the exact production error: Approved asset needs a linked requirement before building: Practice dummy #1245720733. The spec-origin discovery regression also fails.03-naming-red.log separately reproduces the old component-root naming behavior before its correction.

Coverage includes the real saved plan, no-number constraints, a fishing-dock need with misleading labels and a junk catalog name, explicit identity priority, wrong-requirement rejection, stale and ambiguous links, legacy compatibility, API discovery/refresh/persistence, export naming without archive/source mutation and an orchard build through the real Engine. The orchard test uses offline provider, compiler and Studio doubles and reaches ready_to_test. It is not gameplay evidence.

Focused verification:220 tests across six files passed, followed by the additional Engine regression passing with75 other tests intentionally filtered out. TypeScript passed. The first full npm run check stopped in Vitest with1,549 passes and4 failures out of1,553 tests. Later stages did not run in that attempt. The failures were embedded-audio tests passing a separately constructed old integration reference instead of the public adapter's actual returned reference. Stable naming changes that reference hash. The helper now consumes the returned reference and retains an explicit assertion that the old reference is rejected. All21 component-media tests then passed. The original failed full-check log remains in09-full-check.log.

The full rerun in11-full-check.log exited0. All required stages ran:1,553 unit/API tests across100 files,6 offline Luau scenarios and4 source compiles,14 plugin mock groups plus the plugin and8 injected-source compiles,6 guard cases, CSS0 errors/556 existing warnings, TypeScript/Vite,14 desktop tests, production smoke and165 browser passes with1 intentional mobile resize skip in7.4m. These are offline checks, not Studio gameplay. Ten new tests were added. All61 protected evidence files and13 checked source/test hashes match their manifests.

## Preservation and operating state

All new evidence is under docs/results/approved-asset-binding-fix-20260924. The local folder date is September24, while execution timestamps are September25 UTC. The protected docs/results/opencode-fighting-live-20260924 directory is read only for this task. An initial SHA256 manifest covers61 files, including the video and failure responses. No original project, charge, reservation or failure artifact is rewritten.

New paid calls0, cost$0. No Studio session, plugin replacement or user app restart. No benchmark continuation was attempted. The last known provider balance remains$0.715080368 at2026-09-24T19:05:38.819Z, not newly refreshed. Previous accounted spending and unknown holds remain unchanged. These changes do not fix the separate automatic-recommendation uncertainty and do not establish a working fighting game.


Final verification UTC: 2026-09-25T01:36:26.369Z.
