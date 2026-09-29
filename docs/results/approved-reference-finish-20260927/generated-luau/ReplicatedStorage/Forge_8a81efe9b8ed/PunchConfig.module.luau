--!strict
-- Shared punch-loop configuration and constants.
-- Owned by shared_remote_module task; consumed by punch_input_client, punch_validator_server, hit_counter_hud.

export type PunchConfig = {
	CooldownSeconds: number,
	MaxRangeStuds: number,
	DummyHitPartNames: { string },
	DummyModelPath: { string },
}

local PunchConfig: PunchConfig = {
	-- Matches the ~0.5s punch animation clip length (temporary Studio registration) used by punch_input_client,
	-- so a single swing cannot register more than one hit and rapid re-presses are throttled server-side.
	CooldownSeconds = 0.5,

	-- Short-range melee distance: measured from the attacking player's HumanoidRootPart / hand position
	-- to the dummy hitbox part position. Generous enough for normal punch range but rejects far-away swings.
	MaxRangeStuds = 8,

	-- Names of parts on the retained Training Dummy component that count as a valid hitbox.
	DummyHitPartNames = { "Head", "Torso" },

	-- Path (as a list of instance names) from Workspace to the dummy's Model root, so the server
	-- validator can WaitForChild its way to the retained component without hardcoding slash paths.
	DummyModelPath = { "Forge_8a81efe9b8ed", "Assets", "dummy", "dummy", "Imported", "Training Dummy" },
}

return PunchConfig
