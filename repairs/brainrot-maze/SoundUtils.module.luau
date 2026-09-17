local M={}
function M.createAmbientSound(_assetId)
 -- This stock Roblox sound is bundled with Studio/client and needs no uploaded asset.
 local sound=Instance.new("Sound");sound.Name="AmbientAtmosphere"
 sound.SoundId="rbxasset://sounds/action_falling.ogg"
 sound.Looped=true;sound.Volume=.08;sound.PlaybackSpeed=.65
 return sound
end
return M
