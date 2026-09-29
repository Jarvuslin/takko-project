# Independent counter visibility review

**PASS for visible counter presence and changed value in the supplied small native viewport. Full UI verification remains incomplete.** This does not establish that the user's original session is resolved.

Reviewed on 2026-09-28 using the roblox-visual-capture skill already read in full for the lighting review. Opened both actual JPGs with `view_image`, read `counter-native-state.json` and the `counter-visibility` scenario in `docs/VISUAL_TESTS.md`. No Studio or code changes were made. Cost: $0.

## Direct visual evidence

- `refs/captures/counter-visibility/2026-09-28/counter-before.jpg` visibly shows **Hits: 0** in the upper-right area.
- `refs/captures/counter-visibility/2026-09-28/counter-after.jpg` visibly shows **Hits: 2** in the same upper-right area.
- Both labels are readable white text on a dark rounded background with a thin red outline. Neither supplied capture clips the label or obscures it behind the avatar. The white world washout does not prevent reading this label.
- The avatar scale and framing differ between the captures, so these are not a clean visual regression pair for the world or fixed-camera framing. This does not undermine the directly visible counter values.

The screenshots establish visible counter presence and a value difference across the two captured states. They do not by themselves establish which input or server event caused that difference.

## Recorded native state

The supplied native-state result records `Players.ycbuild.PlayerGui.HitCounterHUD`, `enabled: true`, label `Hits: 2`, size `150, 50`, position `584, 16`, viewport `750, 361`, and inset `0, 58`. Its final label agrees with the after image. This is one final-state record. It does not contain a separate before-state snapshot or an explicit `Visible` field. Visibility is nonetheless directly demonstrated by the screenshots.

The displayed JPGs are approximately 627 by 288, while the native-state viewport is recorded as 750 by 361. These are a single small native capture setup, not evidence at any of the required larger target resolutions.

## Scope and missing verification

The 1920x1080, 2560x1440, 3440x1440 and 960x540 resolution matrix was not completed. Resize-transition captures and missing/malformed counter-data captures were not supplied. Responsive layout, all device safe areas and all native player configurations remain unverified.

The scenario identifies a scratch copy of the user-patched export in Play. These captures do not reproduce or diagnose the user's original missing-counter session, and they do not prove that session is fixed. The recorded viewport rendering is not a substitute for a separately launched player-client comparison.

No full environment-art score is applicable to this focused UI check. The world washout remains visible and is addressed separately by the lighting review. No test suite was run because only this report was added. This reviewer did not enter Studio and cannot independently attest to cleanup or current Studio mode.
