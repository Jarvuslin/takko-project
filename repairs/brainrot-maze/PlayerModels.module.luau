local M = {}
function M.createBrainrotCharacter()
 local model = Instance.new("Model")
 model.Name = "MossMug"
 local function part(name, size, position, color, collide)
  local p = Instance.new("Part")
  p.Name=name; p.Size=size; p.Position=position; p.Color=color
  p.Material=Enum.Material.SmoothPlastic; p.Anchored=false
  p.CanCollide=collide == true; p.Massless=name~="HumanoidRootPart"
  p.TopSurface=Enum.SurfaceType.Smooth; p.BottomSurface=Enum.SurfaceType.Smooth
  p.Parent=model; return p
 end
 local moss=Color3.fromRGB(84,106,65)
 local root=part("HumanoidRootPart",Vector3.new(2,2,1),Vector3.zero,moss,false)
 root.Transparency=1
 local torso=part("Torso",Vector3.new(2,2,1),Vector3.zero,moss,true)
 local head=part("Head",Vector3.new(2,1,1),Vector3.new(0,1.5,0),Color3.fromRGB(218,194,150),true)
 local leftArm=part("Left Arm",Vector3.new(1,2,1),Vector3.new(-1.5,0,0),moss,false)
 local rightArm=part("Right Arm",Vector3.new(1,2,1),Vector3.new(1.5,0,0),moss,false)
 local leftLeg=part("Left Leg",Vector3.new(1,2,1),Vector3.new(-.5,-2,0),moss,true)
 local rightLeg=part("Right Leg",Vector3.new(1,2,1),Vector3.new(.5,-2,0),moss,true)
 local function joint(name,a,b,c0,c1)
  local j=Instance.new("Motor6D");j.Name=name;j.Part0=a;j.Part1=b;j.C0=c0;j.C1=c1;j.Parent=a
 end
 joint("RootJoint",root,torso,CFrame.new(),CFrame.new())
 joint("Neck",torso,head,CFrame.new(0,1,0),CFrame.new(0,-.5,0))
 joint("Left Shoulder",torso,leftArm,CFrame.new(-1,.5,0),CFrame.new(.5,.5,0))
 joint("Right Shoulder",torso,rightArm,CFrame.new(1,.5,0),CFrame.new(-.5,.5,0))
 joint("Left Hip",torso,leftLeg,CFrame.new(-.5,-1,0),CFrame.new(0,1,0))
 joint("Right Hip",torso,rightLeg,CFrame.new(.5,-1,0),CFrame.new(0,1,0))
 local function decoration(name,size,offset,color)
  local p=part(name,size,head.Position+offset,color,false)
  local weld=Instance.new("WeldConstraint");weld.Part0=head;weld.Part1=p;weld.Parent=p
  return p
 end
 decoration("Cup",Vector3.new(2.35,1.4,1.5),Vector3.new(0,.6,0),Color3.fromRGB(206,192,156))
 decoration("Coffee",Vector3.new(2.1,.12,1.25),Vector3.new(0,1.32,0),Color3.fromRGB(44,27,21))
 decoration("HandleTop",Vector3.new(.8,.22,.25),Vector3.new(1.4,.95,0),Color3.fromRGB(206,192,156))
 decoration("HandleEnd",Vector3.new(.22,.85,.25),Vector3.new(1.75,.6,0),Color3.fromRGB(206,192,156))
 decoration("HandleBottom",Vector3.new(.8,.22,.25),Vector3.new(1.4,.2,0),Color3.fromRGB(206,192,156))
 for _,x in {-.5,.5} do
  local eye=decoration("Eye",Vector3.new(.32,.4,.1),Vector3.new(x,.55,-.8),Color3.fromRGB(163,255,113))
  eye.Material=Enum.Material.Neon
 end
 decoration("Mouth",Vector3.new(.65,.1,.1),Vector3.new(0,.12,-.8),Color3.fromRGB(43,29,30))
 local h=Instance.new("Humanoid");h.Name="Humanoid";h.MaxHealth=100;h.Health=100;h.WalkSpeed=16
 h.DisplayName="MOSS MUG";h.DisplayDistanceType=Enum.HumanoidDisplayDistanceType.None;h.Parent=model
 local animator=Instance.new("Animator");animator.Parent=h
 model.PrimaryPart=root;model:SetAttribute("ForgeCharacter",true)
 return model
end
function M.spawnPlayer(player,spawn)
 if player.Parent ~= game:GetService("Players") then return end
 local old=player.Character
 local character=M.createBrainrotCharacter()
 character.Name=player.Name
 character:PivotTo(spawn.CFrame*CFrame.new(0,4,0))
 character.Parent=workspace
 player.Character=character
 if old then old:Destroy() end
 return character
end
return M
