# Export room before capture

The before capture fails static illumination and readability review. The baseplate and lighting pipeline fix has not been implemented yet. This is the baseline for the required after comparison, not evidence that any pipeline defect is fixed.

## Procedure and isolation

Read the full roblox-visual-capture skill from `C:/Users/7474g/.claude/skills/synced/9d033cd4-f5cd-4557-ac07-3afd98eda110_07ea2cdd-651b-447f-bc6d-a2f9dd4c3dfe/roblox-visual-capture/SKILL.md`. The supplied path had an extra separator between the two identifiers. The actual directory joins them with an underscore.

Checked both existing Studio places before opening anything. Both were in Edit mode. PID 6604 was Untitled Experience, place 122588481889475. PID 41900 held Takko-Fighting-Review-20260927.rbxlx. Neither existing place was modified.

Announced the opening and camera changes before proceeding. Copied the original export to `.forge/visual-scratch-20260928/Takko-Before-Scratch.rbxlx`, outside docs/results, then opened it in a new Studio process, PID 18552. The scratch Studio connection is 4af0c536-39b7-42ed-96f7-fb4d711a5483. It remained in Edit mode throughout.

Saved four reproducible player-height camera scenarios in docs/VISUAL_TESTS.md before capturing. Set cameras through execute_luau with explicit CFrames, FOV 70 and unchanged in-scene lighting. Captures and observed properties are under refs/captures/export-room-before/2026-09-28/. Restored the scratch camera CFrame, Focus, FOV and CameraType afterward. No scripts, lights, imported content or gameplay state were changed. No probe scopes were created. All three places were confirmed in Edit mode after capture. The scratch place remains open for the eventual comparison.

Original export, protected evidence export and scratch file all have SHA256 `8a701b7a46dbb2c15b3b0b49559544ec05be26bd9b521edbd38599c65307d17d` after capture. No writes were made under docs/results or to the saved generation project.

## Direct observations

The loaded scratch world has four enabled PointLights, each Brightness 2 and Range 30. Ground is 24 by 24 studs. The ceiling is at y=12.5 and fixtures at about y=12.3. Lighting loaded as ClockTime 14, Brightness 1, Ambient and OutdoorAmbient both (0.5,0.5,0.5), GlobalShadows false and ExposureCompensation 0. These are observations of the loaded export, not verified Baseplate template values.

Every capture shows large solid-white regions with poor separation between pale objects and their surroundings. The floor texture is visible. Exact causal attribution to lights, materials or renderer behavior has not been isolated. The after-base-world comparison must happen before deciding whether to add the conditional light-overlap rule.

## Independent verdict

A fresh reviewer received the four images, scenario and requested experience without the builder's explanation or source. Verdict: FAIL for static room illumination and readability.

Scores out of 10: composition 3, depth separation 2, detail hierarchy 2, lighting 1, readability 2. Geometry complexity, material richness, repetition, environmental storytelling and art bible consistency were unassessable from the available evidence.

Priority fixes from the reviewer:

1. Recover tonal variation on white surfaces at the same four cameras.
2. Separate pale objects from their surroundings with shading and contact cues, then surface contrast where needed.
3. Make room boundaries and floor transitions readable after inspecting the underlying geometry.

These are visual findings and repair priorities, not proof that a particular lighting setting is the cause.

## Verification limits and cost

Four Edit-mode viewport captures, not player-client screenshots. No Play session. No gameplay, animation, VFX, SFX, hit-counter or UI verification. No production implementation changed and no tests or npm run check were run in this capture task. All six pipeline fixes and the after comparison remain pending.

Paid inference spend: $0. No paid trial or resume. No Takko process restarted. No listeners on 4318, 4319, 4320, 4324, 4335 or 4336 at the final check. Last verified balances remain account $7.133167908 and key $5.625646434 at 2026-09-27T23:52:52.242Z. No balance refresh was performed.
