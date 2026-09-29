# Independent lighting isolation review

Verdict: **FAIL** for the baseline and all three individual diagnostic treatments. Disabling the PointLights removes the dominant white washout and makes the room and target readable, but the resulting lighting is dim and flat. None of these treatments is a finished visual result.

Reviewed on 2026-09-28. Read the roblox-visual-capture skill in full and `docs/VISUAL_TESTS.md`. Independently opened all 16 actual JPG files with `view_image`. No builder explanation was supplied. No code, Studio state or lighting properties were changed by this reviewer. Paid inference cost: $0.

## Evidence

- Baseline: `refs/captures/export-room-before/2026-09-28/{entry,return,west,east}.jpg`.
- Treatments: `refs/captures/export-lighting-isolation/2026-09-28/{shadows,ambient,pointlights}-{entry,return,west,east}.jpg`.
- Scenario specifies the same four player-height CFrames, FOV 70, Edit mode and ClockTime 14. Original properties restored between treatments according to the supplied capture protocol. The reviewer did not independently observe capture execution or property restoration.
- Baseline state recorded by the scenario: GlobalShadows false, Ambient and OutdoorAmbient each (0.5,0.5,0.5), Brightness 1, four enabled PointLights with Brightness 2 and Range 30. Individual interventions are GlobalShadows true, both ambient colors zero, or all PointLights disabled.

## Controlled observations

| View | Baseline | Shadows enabled only | Ambient colors zero only | PointLights disabled only |
| --- | --- | --- | --- | --- |
| Entry | Wall and central rectangular surface appear solid white. Floor is visible. | Same dominant white regions. Floor detail appears sharper. | Same dominant white regions. Floor detail appears sharper. | Wall texture and gray central surface become visible. Floor becomes dark. |
| Return | Room boundaries merge into white. Much of target silhouette disappears, leaving tan portions and red target mark. | White washout remains. | White washout remains. | Back and side walls separate. Full target silhouette, post and platform can be read. |
| West | White walls merge, target is largely washed out. | White washout remains. | White washout remains. | Wall junctions, target side profile and platform read clearly enough to locate. Low directional contrast remains. |
| East | Large right wall and nearby rectangular platform are white. Target pale body loses shape. | White washout remains. | White washout remains. | Right wall texture, platform thickness and target body become visible. Floor remains dark. |

The PointLights intervention is the only tested change that removes the severe white washout across all four views. With the original ambient settings and shadows state still in place, disabling these lights is sufficient to recover room boundaries and the target silhouette in the supplied captures. This supports the active PointLights as a causal contributor to the observed washout in this scene.

The comparison does **not** establish that overlapping light ranges specifically cause the problem. All four lights were disabled together. It does not distinguish one excessive light from combined illumination, range, placement, material response or a renderer interaction. It also does not establish an acceptable final brightness or range. A per-light and reduced-brightness comparison would be needed to isolate those choices.

Enabling global shadows alone and removing ambient illumination alone do not visibly resolve the washout. This does not prove shadows and ambient settings never matter, or that combinations have no effect. The only supported conclusion is their inadequacy as individual repairs in the supplied state.

The baseline entry floor is blurrier than later entry captures. That difference is not a reliable lighting finding. Texture loading, render settling or capture timing could explain it. The white surfaces persist regardless.

## Rubric

Scores are visual assessments on a 0 to 10 scale, where 10 is strong finished work. They are not performance measurements. Occluded detail is scored as seen, without assuming underlying geometry or materials are absent.

| Criterion | Baseline | Shadows only | Ambient zero only | PointLights off |
| --- | ---: | ---: | ---: | ---: |
| Composition | 3 | 3 | 3 | 4 |
| Geometry complexity | 2 | 2 | 2 | 2 |
| Depth separation | 1 | 1 | 1 | 5 |
| Detail hierarchy | 1 | 1 | 1 | 3 |
| Material richness | 2 | 2 | 2 | 4 |
| Lighting | 0 | 0 | 0 | 3 |
| Readability | 1 | 1 | 1 | 5 |
| Repetition control | 3 | 3 | 3 | 3 |
| Environmental storytelling | 1 | 1 | 1 | 2 |
| Art bible consistency | Not assessable | Not assessable | Not assessable | Not assessable |

No art bible or target visual reference was supplied. Its consistency cannot honestly receive a numerical score. Repetition assessment is limited to the broad repeating floor texture and plain enclosure. These captures do not demonstrate repeated assets at identical rotation and scale.

Automatic-fail findings for a final-art verdict include large flat walls without visible secondary or tertiary structure and flat uniform lighting. With PointLights off, wall material texture becomes visible, but the room remains a bare box with a target and rectangular platforms. Material texture alone does not supply the missing structural detail. Exact Roblox material classes cannot be determined from screenshots. No default-material class claim is made.

## Three highest-impact fixes

1. **Reduce and rebalance the PointLight contribution, then recapture all four views.** The controlled comparison supports investigating these lights first. Start with a visible target silhouette and wall boundaries, then add illumination incrementally. Test lights individually before declaring overlap the cause. Disabling all lights is diagnostic evidence, not a proposed final lighting design.
2. **Establish useful directional and focal contrast.** Keep the floor navigable and the target distinct from the back wall while preserving visible material texture. The lights-off set provides a readable starting point but remains dim and uniformly lit. Specific values and placements need a new controlled capture rather than a guess from these images.
3. **Give the room a secondary detail hierarchy appropriate to the intended art direction.** Add meaningful wall divisions, trim or training-room fixtures that explain the space and break up large bare surfaces. Obtain or use the actual art bible before prescribing a theme. Reassess from the west and east corners as well as the front view.

## Verification limits

These are static Studio viewport captures in Edit mode. They do not establish player-client rendering, native gameplay, animation, physics, UI, visibility while moving or final asset quality. Capture dimensions are approximately 627 by 288, so fine-detail judgments are limited. No test suite was run because this subtask changed only this report. No Studio session was entered, no scripts or probes were created, and this reviewer has no independent cleanup or current-mode assertion to make.
