# Independent base-world comparison

**FAIL. The standard Baseplate world alone does not resolve the white washout.** Walls, the rectangular platform and much of the target still merge into white. The entry, return and west captures also lose portions of the previously visible dark floor beneath or beyond the newly visible white studded surface.

Reviewed on 2026-09-28. Independently opened all four `refs/captures/export-base-world-comparison/2026-09-28/{entry,return,west,east}.jpg` images with `view_image` and compared with the original four `export-room-before` images already inspected directly during this review task. Read the saved scenario in `docs/VISUAL_TESTS.md`. No code or Studio changes were made by this reviewer. Cost: $0.

## Observations

| View | Comparison with original capture |
| --- | --- |
| Entry | Dominant white wall and central region remain. The dark textured floor previously visible on each side is replaced in view by a nearly white studded surface. Floor separation is worse. |
| Return | Tan target portions and the small red mark remain visible, but the pale target silhouette and room boundaries remain washed out. Dark floor now occupies a smaller patch around the target, with white studded foreground. |
| West | Walls and target still lose shape in the white washout. A dark floor patch remains, now bordered by the white studded surface with a stepped visible edge. |
| East | No meaningful recovery of wall, platform or target-body detail. The large right wall and rectangular platform remain white, much as in the original. |

The added studded surface is visible evidence. Exact intersections, floor heights and whether the old floor is occluded cannot be established from these images alone. Those require inspecting geometry. Regardless of mechanism, floor readability regresses in the supplied entry view and changes substantially in the return and west views.

## Scope of the conclusion

The scenario records the standard template Lighting properties, Sky, Atmosphere, Bloom, SunRays and baseplate as the only intervention. It records ClockTime 14.5, Brightness 3, GlobalShadows true, Ambient and OutdoorAmbient 70/255, exposure 0, with original generated geometry and four PointLights retained. This reviewer assessed the images and supplied protocol, not capture execution or property restoration.

This comparison tests that combined base-world intervention. It does not isolate which template property contributes to a changed pixel or prove that standard template properties are unsuitable in general. It does establish that applying this world with the original generated PointLights retained is insufficient to repair this room's washout.

The earlier individual-lighting comparison remains relevant: PointLights off was the only tested intervention that recovered wall texture and the target silhouette across all four angles. Taken together, the captures support investigating the generated PointLight contribution next. They still do not prove overlapping ranges specifically cause the problem, since all lights were disabled together in that treatment.

## Rubric and priorities

For this combined base-world result, lighting scores 0/10 and readability 1/10. Composition 3/10, geometry complexity 2/10, depth separation 1/10, detail hierarchy 1/10, material richness 2/10, repetition control 2/10 and environmental storytelling 1/10. Art bible consistency remains unassessable because no art bible or target visual reference was supplied. These are visual judgments, not quantitative rendering measurements. Large flat, poorly separated surfaces and flat white illumination remain automatic-fail findings for final art.

1. Diagnose and reduce generated PointLight contribution with individual-light or stepped-brightness comparisons, keeping the same cameras.
2. Inspect the template baseplate relative to the generated floor and remove the visible floor conflict without hiding the failed comparison.
3. Establish readable directional contrast and secondary room detail after exposure and floor placement are corrected.

These static, small Studio viewport captures in Edit mode do not establish gameplay, player-client rendering, UI, physics or finished art quality. No tests were run because this subtask only added this report. The reviewer did not enter Studio and cannot independently attest to session cleanup or current mode.
