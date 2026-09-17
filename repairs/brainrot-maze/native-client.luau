return function(ctx)
 local player=game:GetService("Players").LocalPlayer
 local gui=player:WaitForChild("PlayerGui"):WaitForChild("BrainrotHealthHUD",3)
 assert(gui,"HUD loaded")
 local sound=game:GetService("SoundService"):WaitForChild("AmbientAtmosphere",3)
 assert(sound,"Ambient sound exists")
 local startCharacter=player.Character
 local sawBoost,sawDamage,sawRespawn=false,false,false
 local deadline=os.clock()+9
 repeat
  local c=player.Character
  if c and c:GetAttribute("BuffActive") and workspace.CurrentCamera.FieldOfView==90 and sound.Volume>.15 then sawBoost=true end
  if gui.HealthFrame.HealthLabel.Text=="Health  75 / 100" then sawDamage=true end
  if c and c~=startCharacter and gui.HealthFrame.HealthLabel.Text=="Health  100 / 100" then sawRespawn=true end
  task.wait(.05)
 until (sawBoost and sawDamage and sawRespawn) or os.clock()>deadline
 assert(sawBoost,"Client camera and sound adapt while buff is active")
 assert(sawDamage,"Health HUD observes real damage")
 assert(sawRespawn,"Health HUD rebinds after respawn")
 assert(sound.IsLoaded and sound.IsPlaying and sound.TimePosition>0,"Stock audio loaded and played")
end
