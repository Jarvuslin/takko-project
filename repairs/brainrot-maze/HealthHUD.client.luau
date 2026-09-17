local Players=game:GetService("Players")
local player=Players.LocalPlayer
local gui=Instance.new("ScreenGui");gui.Name="BrainrotHealthHUD";gui.ResetOnSpawn=false;gui.Parent=player:WaitForChild("PlayerGui")
local frame=Instance.new("Frame");frame.Name="HealthFrame";frame.Size=UDim2.fromOffset(270,92);frame.Position=UDim2.fromOffset(24,24)
frame.BackgroundColor3=Color3.fromRGB(19,29,25);frame.BackgroundTransparency=.08;frame.Parent=gui
local corner=Instance.new("UICorner");corner.CornerRadius=UDim.new(0,12);corner.Parent=frame
local stroke=Instance.new("UIStroke");stroke.Color=Color3.fromRGB(145,186,101);stroke.Thickness=2;stroke.Parent=frame
local title=Instance.new("TextLabel");title.BackgroundTransparency=1;title.Size=UDim2.new(1,-24,0,26);title.Position=UDim2.fromOffset(12,8)
title.Font=Enum.Font.GothamBold;title.TextSize=16;title.TextXAlignment=Enum.TextXAlignment.Left;title.TextColor3=Color3.fromRGB(194,225,157);title.Text="MOSS MUG / MAZE SPRINT";title.Parent=frame
local label=Instance.new("TextLabel");label.Name="HealthLabel";label.BackgroundTransparency=1;label.Size=UDim2.new(1,-24,0,24);label.Position=UDim2.fromOffset(12,35)
label.Font=Enum.Font.Gotham;label.TextSize=16;label.TextXAlignment=Enum.TextXAlignment.Left;label.TextColor3=Color3.fromRGB(232,233,214);label.Parent=frame
local track=Instance.new("Frame");track.Size=UDim2.new(1,-24,0,10);track.Position=UDim2.fromOffset(12,68);track.BackgroundColor3=Color3.fromRGB(51,66,46);track.BorderSizePixel=0;track.Parent=frame
local bar=Instance.new("Frame");bar.Name="HealthFill";bar.BackgroundColor3=Color3.fromRGB(158,220,95);bar.BorderSizePixel=0;bar.Parent=track
local help=Instance.new("TextLabel");help.Name="Directions";help.AnchorPoint=Vector2.new(.5,1);help.Position=UDim2.new(.5,0,1,-24);help.Size=UDim2.new(.8,0,0,38)
help.BackgroundColor3=Color3.fromRGB(19,29,25);help.BackgroundTransparency=.2;help.TextColor3=Color3.fromRGB(230,228,211);help.Font=Enum.Font.GothamBold;help.TextSize=16
help.Text="Reach the purple exit • Green pools boost speed + vision";help.Parent=gui
local healthConnection,maximumConnection,buffConnection
local function bind(c)
 for _,connection in {healthConnection,maximumConnection,buffConnection} do connection:Disconnect() end
 healthConnection=nil;maximumConnection=nil;buffConnection=nil
 local h=c:WaitForChild("Humanoid",5);if not h or player.Character~=c then return end
 local function update()
  label.Text=string.format("Health  %d / %d",math.ceil(h.Health),h.MaxHealth)
  bar.Size=UDim2.fromScale(math.clamp(h.Health/h.MaxHealth,0,1),1)
 end
 local function vision()
  local camera=workspace.CurrentCamera
  if camera then camera.CameraSubject=h;camera.FieldOfView=c:GetAttribute("BuffActive") and 90 or 70 end
 end
 healthConnection=h.HealthChanged:Connect(update)
 maximumConnection=h:GetPropertyChangedSignal("MaxHealth"):Connect(update)
 buffConnection=c:GetAttributeChangedSignal("BuffActive"):Connect(vision)
 update();vision()
end
player.CharacterAdded:Connect(bind)
if player.Character then task.spawn(bind,player.Character) end
