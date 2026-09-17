# Frozen Butter Crunch native evaluation

**Overall failed:** the counter advances at action start rather than after completion. No game source or scene repairs were made. This is evaluator-side delivery into disposable Place1, not autonomous Takko plugin delivery. The existing default place environment remained around the scoped artifact; this was not a clean opening of the exported place file.

The frozen artifact SHA-256 is `26e76b3faf63d01504f32203044088aff205bfc389942b6e4eefa168b43d78f3`. `freeze.json` records original project/export/script hashes. Official `multi_edit` created the two exact worker scripts. `verification-v2.json` confirms both exact sources, 17 scene nodes and all 62 declared properties. The first verifier assumed nearest-byte Color3 rounding; Studio instead floored these channels. Its failed receipt remains in `verification-v1.json`. Only verifier tolerance changed, with an offline regression; no application operation or artifact changed or was reapplied.

| Observation | Result |
| --- | --- |
| Initial counter | 0 |
| Ten controlled, separately targeted desktop clicks | Counts 0 through 10, final HUD 10 |
| Three rapid clicks after count 10 | Final count/HUD 11 |
| Animation/reset | Squash and elastic recovery observed; final Size returned to original |
| Actual game audio | Bound Studio-process WAV captured after a real click; native sound length approximately 0.813 seconds |
| Counter after completed crunch | **Failed**: count 2 already visible at +0.1 and +0.3 seconds while sound played and butter was deformed; recovery observed at +1.1 seconds |
| Phone input | Actual `Enum.UserInputType.Touch` events and counter changes observed; controlled counting/debounce inconclusive |
| Phone layout | Numeric HUD visible in iPhone 17 Pro landscape and portrait screenshots; simple presentation, no quality rating |

`desktop-ten-inputs.json` records each projected target, verified mouse target and native input result. `desktop-ten-result.json` records final10. `desktop-overlap-result.json` records11. `desktop-timing-console.json` contains read-only event observations; no handler, counter or state was assigned. The first-click game audio is `first-click-audio-v3.json` plus its referenced WAV.

Preserved evaluator difficulties are not relabeled game failures: a 3D instance-path mouse call was rejected before input; a viewport/screen coordinate mismatch produced silence and no increment; an initial fixed-coordinate sequence ended at9 after camera/character movement; a replay omitted per-call coordinates and was rejected before input. The subsequent controlled sequence used current WorldToScreenPoint coordinates, confirmed the actual mouse target before each click, and passed. No counter was reset by assignment; a fresh normal Play session started at0.

Mobile simulation enabled Touch input. Extra touch events and count changes occurred outside the controlled calls, including count6 in a fresh portrait session with no evaluator click. Attribution is unknown, so no exact mobile input count or debounce pass is claimed. Original screenshots and receipts preserve this limitation. Game settings were ScreenOrientation.Sensor, IgnoreGuiInset=false, CoreUISafeInsets, FullscreenExtension and ClipToDeviceSafeArea=true. Device orientation was restored to landscape, simulation stopped, and Studio returned to Edit/default viewport.

No paid evaluation calls were made here. The full offline check after evaluator tooling passed **637 unit/API tests, 10 desktop tests and 36 browser tests**, plus Luau/plugin/guards/build/production stages. Those tests are separate from the native observations above.
