local folder=assert(workspace:FindFirstChild("TakkoAnimationCapabilityProbe"))
local report={}
local function run(id)
 local model=Instance.new("Model"); model.Name="Rig_"..script.Name; model.Parent=folder
 local root=Instance.new("Part");root.Name="Root";root.Anchored=true;root.CFrame=CFrame.new(0,20,0);root.Parent=model
 local arm=Instance.new("Part");arm.Name="Arm";arm.CanCollide=false;arm.Parent=model
 local motor=Instance.new("Motor6D");motor.Name="ArmJoint";motor.Part0=root;motor.Part1=arm;motor.Parent=root
 local controller=Instance.new("AnimationController");controller.Parent=model
 local animator=Instance.new("Animator");animator.Parent=controller
 local seq=Instance.new("KeyframeSequence");seq.Loop=true
 for i=0,2 do local f=Instance.new("Keyframe");f.Time=i*0.5;f.Parent=seq
 local p=Instance.new("Pose");p.Name="Root";p.Parent=f
 local a=Instance.new("Pose");a.Name="Arm";a.CFrame=CFrame.Angles(0,0,i==1 and 1 or 0);a.Parent=p end
 local ok,value=pcall(function() return game:GetService("KeyframeSequenceProvider"):RegisterKeyframeSequence(seq) end)
 report.registerOk=ok;report.registerResult=tostring(value)
 local anim=Instance.new("Animation")
 local assigned,err=pcall(function() anim.AnimationId=id or value end)
 report.assignmentOk=assigned;report.assignmentResult=tostring(err);report.animationId=anim.AnimationId
 if assigned then
 local loaded,track=pcall(function() return animator:LoadAnimation(anim) end)
 report.loadOk=loaded
 if loaded then
 track.Looped=true;track:Play(0)
 local maxMotion=0
 for i=1,30 do task.wait(0.05);local _,angle=motor.Transform:ToAxisAngle();maxMotion=math.max(maxMotion,math.abs(angle)) end
 report.length=track.Length;report.isPlaying=track.IsPlaying;report.timePosition=track.TimePosition;report.maxJointAngle=maxMotion;track:Stop()
 else report.loadError=tostring(track) end end
 seq:Destroy();anim:Destroy();model:Destroy()
end
local ok,err=pcall(function() run(script:GetAttribute("RegisteredId")) end)
report.completed=ok;report.error=not ok and tostring(err) or nil
folder:SetAttribute(script.Name,game:GetService("HttpService"):JSONEncode(report))
