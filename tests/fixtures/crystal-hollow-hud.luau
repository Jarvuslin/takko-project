local HUD = {}

local PANEL_COLOR = Color3.fromRGB(18, 25, 38)
local PANEL_ALT = Color3.fromRGB(28, 38, 56)
local TEXT = Color3.fromRGB(236, 246, 255)
local MUTED = Color3.fromRGB(166, 188, 208)
local CYAN = Color3.fromRGB(70, 225, 245)
local AMBER = Color3.fromRGB(255, 185, 78)
local VIOLET = Color3.fromRGB(169, 125, 255)

local function make(className, name, parent, properties)
	local object = Instance.new(className)
	object.Name = name
	object.Parent = parent
	for property, value in pairs(properties or {}) do
		object[property] = value
	end
	return object
end

local function label(parent, name, text, size, color, properties)
	local values = {
		BackgroundTransparency = 1,
		Text = text,
		TextColor3 = color or TEXT,
		Font = Enum.Font.Gotham,
		TextSize = size or 14,
		TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left,
		TextYAlignment = Enum.TextYAlignment.Center,
	}
	for property, value in pairs(properties or {}) do
		values[property] = value
	end
	return make("TextLabel", name, parent, values)
end

local function button(parent, name, text, color)
	local item = make("TextButton", name, parent, {
		BackgroundColor3 = color,
		BorderSizePixel = 0,
		AutoButtonColor = true,
		Text = text,
		TextColor3 = TEXT,
		Font = Enum.Font.GothamBold,
		TextSize = 13,
		TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextYAlignment = Enum.TextYAlignment.Center,
		Active = true,
		Selectable = true,
	})
	make("UICorner", "Corner", item, {CornerRadius = UDim.new(0, 7)})
	make("UIStroke", "Outline", item, {Color = Color3.fromRGB(95, 116, 142), Thickness = 1, Transparency = 0.25})
	return item
end

function HUD.mount(playerGui)
	assert(playerGui, "HUD.mount requires a PlayerGui")
	local previous = playerGui:FindFirstChild("CrystalHollowHUD")
	if previous then
		previous:Destroy()
	end

	local gui = make("ScreenGui", "CrystalHollowHUD", playerGui, {
		ResetOnSpawn = false,
		IgnoreGuiInset = false,
		DisplayOrder = 20,
		ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
	})

	local main = make("Frame", "MainPanel", gui, {
		AnchorPoint = Vector2.new(0, 0),
		Position = UDim2.new(0, 12, 0, 12),
		Size = UDim2.new(0, 340, 0, 282),
		BackgroundColor3 = PANEL_COLOR,
		BackgroundTransparency = 0.06,
		BorderSizePixel = 0,
	})
	make("UICorner", "Corner", main, {CornerRadius = UDim.new(0, 12)})
	make("UIStroke", "Outline", main, {Color = Color3.fromRGB(78, 130, 157), Thickness = 1, Transparency = 0.15})
	make("UIPadding", "Padding", main, {
		PaddingTop = UDim.new(0, 11),
		PaddingBottom = UDim.new(0, 10),
		PaddingLeft = UDim.new(0, 13),
		PaddingRight = UDim.new(0, 13),
	})

	label(main, "Title", "CRYSTAL HOLLOW", 20, CYAN, {
		Size = UDim2.new(1, 0, 0, 27),
		Font = Enum.Font.GothamBlack,
	})
	label(main, "Subtitle", "Quarry loop  •  restore the beacon", 11, MUTED, {
		Position = UDim2.new(0, 0, 0, 27),
		Size = UDim2.new(1, 0, 0, 18),
	})

	local statsRow = make("Frame", "StatsRow", main, {
		Position = UDim2.new(0, 0, 0, 50),
		Size = UDim2.new(1, 0, 0, 31),
		BackgroundTransparency = 1,
	})
	local carryLabel = label(statsRow, "CarryLabel", "Bag  0 / 8", 16, TEXT, {
		Size = UDim2.new(0.52, 0, 1, 0),
		Font = Enum.Font.GothamBold,
	})
	local coinsLabel = label(statsRow, "CoinsLabel", "Coins  0", 16, AMBER, {
		Position = UDim2.new(0.52, 0, 0, 0),
		Size = UDim2.new(0.48, 0, 1, 0),
		Font = Enum.Font.GothamBold,
		TextXAlignment = Enum.TextXAlignment.Right,
	})

	local tracks = make("Frame", "UpgradeTracks", main, {
		Position = UDim2.new(0, 0, 0, 84),
		Size = UDim2.new(1, 0, 0, 47),
		BackgroundColor3 = PANEL_ALT,
		BackgroundTransparency = 0.18,
		BorderSizePixel = 0,
	})
	make("UICorner", "Corner", tracks, {CornerRadius = UDim.new(0, 7)})
	local powerInfo = label(tracks, "PowerInfo", "PICK  Lv 1  •  Yield 1", 11, VIOLET, {
		Position = UDim2.new(0, 8, 0, 3), Size = UDim2.new(0.5, -10, 0, 20), Font = Enum.Font.GothamBold,
	})
	local bagInfo = label(tracks, "BagInfo", "BAG  Lv 1  •  Holds 8", 11, CYAN, {
		Position = UDim2.new(0.5, 2, 0, 3), Size = UDim2.new(0.5, -10, 0, 20), Font = Enum.Font.GothamBold,
	})
	local powerNext = label(tracks, "PowerNext", "Next: yield 2  •  40 coins", 10, MUTED, {
		Position = UDim2.new(0, 8, 0, 23), Size = UDim2.new(0.5, -10, 0, 18),
	})
	local bagNext = label(tracks, "BagNext", "Next: 14 slots  •  30 coins", 10, MUTED, {
		Position = UDim2.new(0.5, 2, 0, 23), Size = UDim2.new(0.5, -10, 0, 18),
	})

	local goalLabel = label(main, "GoalLabel", "Beacon goal  •  Sold 0 / 40  •  Pick 0/1  •  Bag 0/1", 11, TEXT, {
		Position = UDim2.new(0, 0, 0, 137), Size = UDim2.new(1, 0, 0, 20), Font = Enum.Font.GothamMedium,
	})
	local hint = label(main, "Hint", "Find a glowing crystal cluster nearby.", 11, MUTED, {
		Position = UDim2.new(0, 0, 0, 158), Size = UDim2.new(1, 0, 0, 23), TextXAlignment = Enum.TextXAlignment.Center,
	})

	local actions = make("Frame", "Actions", main, {
		Position = UDim2.new(0, 0, 0, 185), Size = UDim2.new(1, 0, 0, 42), BackgroundTransparency = 1,
	})
	local harvestButton = button(actions, "HarvestButton", "E  HARVEST", Color3.fromRGB(24, 117, 132))
	harvestButton.Position = UDim2.new(0, 0, 0, 0); harvestButton.Size = UDim2.new(0.25, -4, 1, 0)
	local sellButton = button(actions, "SellButton", "Q  SELL", Color3.fromRGB(143, 82, 27))
	sellButton.Position = UDim2.new(0.25, 2, 0, 0); sellButton.Size = UDim2.new(0.25, -4, 1, 0)
	local powerButton = button(actions, "PowerButton", "1  PICK", Color3.fromRGB(77, 54, 132))
	powerButton.Position = UDim2.new(0.5, 2, 0, 0); powerButton.Size = UDim2.new(0.25, -4, 1, 0)
	local capacityButton = button(actions, "CapacityButton", "2  BAG", Color3.fromRGB(39, 91, 116))
	capacityButton.Position = UDim2.new(0.75, 2, 0, 0); capacityButton.Size = UDim2.new(0.25, -2, 1, 0)
	label(main, "Footer", "E/Q/1/2  or  tap a button", 10, MUTED, {
		Position = UDim2.new(0, 0, 0, 234), Size = UDim2.new(1, 0, 0, 18), TextXAlignment = Enum.TextXAlignment.Center,
	})

	local toastMessage = nil
	local toastUntil = 0
	local destroyed = false
	local handles = {
		gui = gui,
		harvestButton = harvestButton,
		sellButton = sellButton,
		powerButton = powerButton,
		capacityButton = capacityButton,
		coinsLabel = coinsLabel,
	}

	local function setButtonState(item, available)
		item.Active = true
		item.AutoButtonColor = available
		item.BackgroundTransparency = available and 0 or 0.42
		item.TextTransparency = available and 0 or 0.35
		local outline = item:FindFirstChild("Outline")
		if outline then outline.Transparency = available and 0.25 or 0.7 end
	end

	function handles.render(stats, context)
		if destroyed or not gui.Parent then return end
		stats = stats or {}; context = context or {}
		local carry = tonumber(stats.Carry) or 0
		local capacity = tonumber(stats.Capacity) or 8
		local coins = tonumber(stats.Coins) or 0
		local powerLevel = tonumber(stats.PowerLevel) or 0
		local capacityLevel = tonumber(stats.CapacityLevel) or 0
		local totalSold = tonumber(stats.TotalSold) or 0
		local goalComplete = stats.GoalComplete == true
		carryLabel.Text = string.format("Bag  %d / %d", carry, capacity)
		coinsLabel.Text = string.format("Coins  %d", coins)
		powerInfo.Text = string.format("PICK  Lv %d  •  Yield %d", powerLevel + 1, ({1, 2, 3})[powerLevel + 1] or 1)
		bagInfo.Text = string.format("BAG  Lv %d  •  Holds %d", capacityLevel + 1, capacity)
		if powerLevel >= 2 then
			powerNext.Text = "MAX LEVEL  •  Yield 3"; powerButton.Text = "1  PICK MAX"
		else
			powerNext.Text = string.format("Next: yield %d  •  %d coins", ({1, 2, 3})[powerLevel + 2], ({40, 100})[powerLevel + 1])
			powerButton.Text = string.format("1  PICK  %d", ({40, 100})[powerLevel + 1])
		end
		if capacityLevel >= 2 then
			bagNext.Text = "MAX LEVEL  •  Holds 20"; capacityButton.Text = "2  BAG MAX"
		else
			bagNext.Text = string.format("Next: %d slots  •  %d coins", ({8, 14, 20})[capacityLevel + 2], ({30, 80})[capacityLevel + 1])
			capacityButton.Text = string.format("2  BAG  %d", ({30, 80})[capacityLevel + 1])
		end
		goalLabel.Text = goalComplete and "Beacon restored  •  Goal complete!" or string.format("Beacon goal  •  Sold %d / 40  •  Pick %d/1  •  Bag %d/1", math.min(totalSold, 40), math.min(powerLevel, 1), math.min(capacityLevel, 1))
		goalLabel.TextColor3 = goalComplete and CYAN or TEXT
		local remaining = tonumber(context.nodeRemaining)
		local nearNode = context.nodeId ~= nil
		local nearSell = context.nearSell == true
		local nearUpgrades = context.nearUpgrades == true
		if toastMessage and os.clock() < toastUntil then hint.Text = toastMessage
		elseif goalComplete then hint.Text = "The beacon shines again. Keep quarrying!"
		elseif nearNode and carry >= capacity then hint.Text = "Bag full — visit the amber SELL station."
		elseif nearNode and remaining == 0 then hint.Text = "This node is dim. Try another crystal cluster."
		elseif nearNode then hint.Text = "Crystal nearby — press E or tap HARVEST."
		elseif nearSell and carry > 0 then hint.Text = "Amber station ready — press Q or tap SELL."
		elseif nearUpgrades then hint.Text = "Choose PICK for yield or BAG for capacity."
		else hint.Text = "Follow the pale path to a glowing crystal cluster." end
		setButtonState(harvestButton, nearNode and remaining ~= 0 and carry < capacity)
		setButtonState(sellButton, nearSell and carry > 0)
		setButtonState(powerButton, nearUpgrades and powerLevel < 2 and coins >= (({40, 100})[powerLevel + 1] or math.huge))
		setButtonState(capacityButton, nearUpgrades and capacityLevel < 2 and coins >= (({30, 80})[capacityLevel + 1] or math.huge))
	end

	function handles.toast(message)
		if destroyed or not gui.Parent then return end
		toastMessage = tostring(message or "")
		toastUntil = os.clock() + 3
		hint.Text = toastMessage; hint.TextColor3 = TEXT
	end

	function handles.destroy()
		if destroyed then return end
		destroyed = true
		if gui.Parent then gui:Destroy() end
	end

	return handles
end

return HUD