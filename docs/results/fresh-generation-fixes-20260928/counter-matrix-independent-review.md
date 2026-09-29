# Independent counter matrix review

**PASS for counter visibility in all seven supplied images. PASS for legibility on direct inspection, with weak readability in the reduced ultrawide image.** This is a limited screenshot verdict, not a full player-client UI pass.

Reviewed on 2026-09-28 using the roblox-visual-capture skill previously read in full. Opened every image directly with `view_image`, read the counter scenario and checked actual JPG dimensions using the image headers. No code or Studio changes were made. Cost: $0.

## Observed image results

All paths below are under `refs/captures/counter-visibility/2026-09-28/`.

| File | Actual JPG dimensions | Visible value | Verdict |
| --- | --- | --- | --- |
| counter-1920x1080.jpg | 742x417 | Hits: 0 | PASS, visible and legible at upper right |
| counter-2560x1440.jpg | 742x417 | Hits: 0 | PASS, smaller but legible at upper right |
| counter-3440x1440.jpg | 742x310 | Hits: 0 | PASS for presence and decipherable text, weak at-a-glance readability in this reduced image |
| counter-960x540.jpg | 742x417 | Hits: 0 | PASS, large and clear |
| counter-small-after-hit.jpg | 742x417 | Hits: 1 | PASS, large and clear |
| counter-malformed.jpg | 742x417 | Hits: 1 | PASS for retained visible label only |
| counter-resize.jpg | 742x432 | Hits: 1 | PASS for the one supplied resize state |

The counter remains inside the image boundary in all seven captures. Its white text, dark fill and thin red border separate it from the extremely bright world. No avatar overlap or clipping is visible. The ultrawide label is only roughly 33 pixels wide in the supplied JPG, making it much weaker for quick reading than the small-window example. That observation applies to this reduced image, not automatically to the native UI at 3440x1440.

The first four images show zero and the later three show one. This establishes different displayed values, not the event that caused the change. The image named malformed shows an intact Hits: 1 label. Its filename and pixels do not establish which malformed input was injected, whether missing data was separately tested or whether the correct error-handling path executed.

## Resolution and environment limits

The four resolution names identify the intended or simulated Studio viewports. They are not the saved screenshot dimensions. All saved images are 742 pixels wide, and the ultrawide image is shorter. This set therefore extends the earlier small-viewport evidence with captures labeled for four viewport settings, but does not supply full-resolution 1920x1080, 2560x1440, 3440x1440 or 960x540 images. Viewport metadata for these new frames was not supplied to this reviewer, so exact simulated dimensions are not independently verified by the filenames.

The captures were supplied as native Studio Play evidence. They are not captures from a separately launched player client. The resize image demonstrates one visible state. A single still cannot prove uninterrupted visibility throughout an actual resize transition.

The world is still washed out and avatar scale varies between frames. This review passes only counter presence and the legibility visible in these images. It does not pass environment quality, fixed-camera reproducibility, gameplay, combat, animations, networking, or the user's original missing-counter session.

## Three highest-priority fixes or verification follow-ups

1. **Resolve the weak ultrawide preview readability with native-size evidence before changing UI scale.** Capture the full simulated viewport or pair its exact viewport size and counter bounds with an unscaled image. If the label is also too small at native display size, adjust the counter's minimum readable size and retest. These reduced images alone do not establish that a runtime scaling change is necessary.
2. **Complete the resize evidence.** Record several transition frames or a short native sequence, including the smallest supported window, and confirm the counter stays within safe bounds throughout. The supplied resize still passes only its captured state.
3. **Complete malformed and missing-data evidence.** Preserve the exact injected input, before/after label state and errors, then verify the chosen fallback visually. The intact label here is useful but cannot establish robust handling of unspecified input.

The focused UI observations support high contrast and visible placement in all seven images. A full environment-art rubric is not applicable to this narrow counter request. No test suite was run because only this report was written. This reviewer did not enter Studio and makes no independent claim about restoration, cleanup or current Play/Edit state.
