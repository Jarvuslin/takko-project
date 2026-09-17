local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")

local LocalPlayer = Players.LocalPlayer
local character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
local humanoid = character:WaitForChild("Humanoid")
local animator = humanoid:WaitForChild("Animator")

local combatFolder = script.Parent:FindFirstChild("CombatSystem")
local punchingRemote = combatFolder and combatFolder:FindFirstChild("Punching")
local animationsFolder = combatFolder and combatFolder:FindFirstChild("CombatAnimations")

local animTracks = {}
if animationsFolder then
	local leftPunchAnim = animationsFolder:FindFirstChild("LeftPunch")
	local rightPunchAnim = animationsFolder:FindFirstChild("RightPunch")
	if leftPunchAnim and leftPunchAnim:IsA("Animation") then
		animTracks[1] = animator:LoadAnimation(leftPunchAnim)
	end
	if rightPunchAnim and rightPunchAnim:IsA("Animation") then
		animTracks[2] = animator:LoadAnimation(rightPunchAnim)
	end
end

local currentStep = 1
local isAttacking = false
local ATTACK_DEBOUNCE = 0.5

local function performAttack()
	if isAttacking then return end
	if not humanoid or humanoid.Health <= 0 then return end

	isAttacking = true
	local step = currentStep
	currentStep = (currentStep % 2) + 1

	if animTracks[step] then
		animTracks[step]:Play()
	end

	if punchingRemote and punchingRemote:IsA("RemoteEvent") then
		punchingRemote:FireServer(step)
	end

	task.delay(ATTACK_DEBOUNCE, function()
		isAttacking = false
	end)
end

UserInputService.InputBegan:Connect(function(input, processed)
	if processed then return end
	if input.UserInputType == Enum.UserInputType.MouseButton1 or input.KeyCode == Enum.KeyCode.F or input.KeyCode == Enum.KeyCode.E then
		performAttack()
	end
end)

LocalPlayer.CharacterAdded:Connect(function(newChar)
	character = newChar
	humanoid = newChar:WaitForChild("Humanoid")
	animator = humanoid:WaitForChild("Animator")
	isAttacking = false
	currentStep = 1
	table.clear(animTracks)
	if animationsFolder then
		local leftPunchAnim = animationsFolder:FindFirstChild("LeftPunch")
		local rightPunchAnim = animationsFolder:FindFirstChild("RightPunch")
		if leftPunchAnim and leftPunchAnim:IsA("Animation") then
			animTracks[1] = animator:LoadAnimation(leftPunchAnim)
		end
		if rightPunchAnim and rightPunchAnim:IsA("Animation") then
			animTracks[2] = animator:LoadAnimation(rightPunchAnim)
		end
	end
end)
