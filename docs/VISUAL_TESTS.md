# Visual tests

## export-lighting-isolation

Reuse all four export-room-before CFrames below, FOV70, Edit mode, ClockTime14. Baseline remains Brightness1, Ambient/OutdoorAmbient(.5,.5,.5), GlobalShadows false, four PointLights Brightness2 Range30. Treatments individually: shadows enabled only, both ambient colors zero only, all PointLights disabled only. Restore every original property between treatments and after all captures. These are controlled diagnostic treatments, not proposed final lighting. Save under refs/captures/export-lighting-isolation/2026-09-28/.

## counter-visibility

Scratch copy of the user-patched export only. Play, original lighting and FOV70. Fixed camera CFrame.new(0,5,10, -1,0,0, 0,1,0, 0,0,-1) toward the target. Record PlayerGui ancestry, Enabled, Visible, absolute bounds, inset and viewport size before and after actual input. Capture at 1920x1080, 2560x1440, 3440x1440 and 960x540 where the native capture mechanism permits, plus resize transition and missing/malformed counter data. Unsupported capture dimensions or data probes must be reported as unverified, never simulated as native evidence. Restore Edit state after testing. Save under refs/captures/counter-visibility/2026-09-28/.

## export-base-world-comparison

Same four CFrames as export-room-before, Edit, FOV70. Apply only the verified template Lighting properties, Sky, Atmosphere, Bloom, SunRays and baseplate read from Studio0.740.0.7400927 in docs/results/fresh-generation-fixes-20260928/baseplate-template.json. Keep all generated geometry and its four PointLights unchanged. ClockTime14.5, Brightness3, GlobalShadows true, Ambient/OutdoorAmbient70/255, exposure0. This determines whether the host base world alone resolves the finding. Restore original scratch properties and remove inserted template instances afterward. Capture under refs/captures/export-base-world-comparison/2026-09-28/.

## export-room-before

Purpose: record the untouched export's room illumination and readability before the base-world fix. Scratch file only: `.forge/visual-scratch-20260928/Takko-Before-Scratch.rbxlx`. No gameplay or UI verdict.

All shots: Edit mode, FOV 70, player eye height y=5, no lighting overrides. Captures are Studio viewport evidence, not a player client. Original Lighting observed: ClockTime 14, Brightness 1, Ambient and OutdoorAmbient (0.5,0.5,0.5), GlobalShadows false, ExposureCompensation 0. Four enabled PointLights each Brightness 2, Range 30. Keep these unchanged for the before set.

Explicit camera CFrames (reuse after the base-world change):

1. Entry approach: `CFrame.new(0,5,-3, -1,0,0, 0,1,0, 0,0,-1)` looking north through the room.
2. Return sightline: `CFrame.new(0,5,14, 1,0,0, 0,1,0, 0,0,1)` looking back to spawn.
3. West corner: `CFrame.new(-10,5,14, 0.6689647,0,-0.7432941, 0,1,0, 0.7432941,0,0.6689647)` looking toward the opposite lower corner.
4. East corner: `CFrame.new(10,5,-5, -0.6689647,0,0.7432941, 0,1,0, -0.7432941,0,-0.6689647)` looking toward the opposite upper corner.

This static room inspection does not exercise VFX, gameplay or UI, which require separate scenarios. Capture files belong under `refs/captures/export-room-before/2026-09-28/`. Restore camera CFrame, Focus, FOV and CameraType after the shots. Leave scratch and existing places in Edit mode. No original scripts or objects are to be modified.
