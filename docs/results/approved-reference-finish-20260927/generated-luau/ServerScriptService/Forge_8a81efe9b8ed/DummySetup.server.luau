-- Anchors and positions the retained Training Dummy component so its hitbox
-- matches the location PunchValidator.server.luau checks against.
local Workspace = game:GetService("Workspace")

local root = Workspace:WaitForChild("Forge_8a81efe9b8ed")
local dummyRoot = root:WaitForChild("Assets"):WaitForChild("dummy"):WaitForChild("dummy")
local imported = dummyRoot:WaitForChild("Imported")
local dummyModel = imported:WaitForChild("Training Dummy")

-- Freeze every part of the retained dummy so it never falls, slides or
-- otherwise changes position/state during play.
for _, descendant in ipairs(dummyModel:GetDescendants()) do
	if descendant:IsA("BasePart") then
		descendant.Anchored = true
	end
end

-- Stand it upright at the practice room's fixed target position, facing the
-- spawn point, while preserving the model's original relative part layout
-- (no rotation change, only translation).
dummyModel:PivotTo(CFrame.new(0, 3, 15))
