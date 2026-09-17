# Scene references and Studio verification — 2026-09-13

**Follow-up, 2026-09-14:** Save now closes the Models dialog, additional generation/export defects are fixed, and the locally repaired user maze passed 13 solo and three multiplayer Studio scenarios. See [the follow-up report](maze-generation-and-studio-repair.md). The remaining-verification section below describes the earlier checkpoint, not the current repaired game.

The reported `scene.14..17.className` and `Part0`/`Part1` failures exposed a missing representation for character rigs. Forge accepted Parts but excluded Humanoid/joint classes and instance-valued properties. A valid rig could not pass the contract, and neither the XML exporter nor the plugin could resolve its links.

## Changes

- The scene contract now supports Humanoid, Animator, AnimationController, Motor6D, Weld, WeldConstraint, Highlight, ProximityPrompt and additional common scene/UI/value classes. Instance properties use `{ "type": "Ref", "path": "Workspace/<scope>/Rig/Head" }`; a null path clears a reference.
- Validation rejects missing or external targets and wrong target classes for part/attachment links. XML assigns referents before rendering properties. The plugin constructs all instances before assigning properties, so forward references resolve to the actual staged objects. Failed staging retains the previous scene.
- Reviewer tests compile within the bounded response-correction loop before becoming protected. Invalid reviewer syntax no longer becomes an unchangeable test that code repair cannot fix. Exhausting schema corrections tries the next configured model route, with all attempts charged.
- Successful build tasks are checkpointed. Repair of an incomplete build resumes unfinished tasks before review. Legacy partial projects infer completed tasks only from concrete coverage and owned files, preserving previous output/review in `.forge/projects/history/`. Coordination tasks may cite implemented dependencies without creating meaningless scene objects.
- Failed or interrupted partial builds cannot be exported or queued for Studio, even when their final static checks have not run. The UI follows the same readiness rule.

## Offline verification

Final `npm run check`: **92 unit tests, five plugin scenarios, six retained combat scenarios, Luau compilation, guard checks, TypeScript/Vite build, production smoke and 14 desktop/mobile browser tests passed**. The plugin mock suite verifies forward links, failed staging, unchanged source/scene protection and harness cleanup. Browser checks include hiding download for a failed partial artifact. Fixture-provider tests are not model-quality measurements.

## Native Studio verification

An independent integration fixture was created by `scripts/studio-smoke-fixture.ts`, exported to `.forge/evaluation/Forge-scene-verification.rbxlx`, and opened in a separate native Studio process. `scripts/install-studio-plugin.ts --verify` temporarily appends `tests/studio-driver.luau` to the original plugin. That driver runs only in the named disposable fixture and exercises the same connect, poll, apply, test and result-delivery functions used by the UI. The standard plugin is restored afterward with `node --import tsx scripts/install-studio-plugin.ts`.

Actual engine assertions passed:

1. Native XML import resolves Model.PrimaryPart, Motor6D.Part0/Part1, forward references and Highlight.Adornee.
2. The installed local plugin pairs with Forge, polls the queued apply operation and creates the scene and client source under a Studio undo recording.
3. StudioTestService starts a real client/server play session. A server test moves Motor6D.C0, observes the connected head move, restores C0 and observes it return. A client test verifies HUD initialization and a living spawned player.
4. Both results arrive at the app for the exact artifact hash; the fixture reports no runtime logs. The play session returns to edit mode and temporary harnesses are removed by the adapter.

See [recorded native results](results/scene-reference-studio.json). This is a native integration test, not the user's generated Brainrot game or a claim of arbitrary generation quality.

The MCP-invoked apply initially conflicted with the tool's outer undo recording; executing after that transaction completed succeeded. The installed native plugin succeeded independently. Native plugins cannot write HttpService.HttpEnabled (LocalUser capability is required); the disposable test place enables HTTP in its saved XML. The product plugin does not silently change this setting.

The installed third-party Lemonade artifact was rechecked: the cached 68657693815716 binary still matches the preserved 2.2.4 snapshot, SHA-256 `AD009C907A7E7764B225EBDB23EACD070716473D6BC1E58121ACB11244A3B1C5`. It was not modified.

## Remaining user-specific verification

Project `d0dab662-25dd-4705-a0ef-ed45134bf4bf` (Brainrot Maze Sprint) retains its approved brief and incomplete generated output. The existing scene and early repair contain additional unresolved requirements; the full game has not passed a playtest. No fresh paid generation was made during this fix. The backend restart cleared the session-only OpenRouter key, and no key has been re-entered at this report's writing.

After entering the key for the configured GPT 4.1 mini profile in Models & budget, use Repair to resume this project's missing build tasks. Continue with its actual generated acceptance tests and gameplay inspection. Audio requirements still require playable, permitted assets; the fix does not fabricate missing asset IDs or mark blocked features complete.
