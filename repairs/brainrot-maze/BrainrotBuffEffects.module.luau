local M={}
function M.applyGlowOutline(character)
 if character:FindFirstChild("BuffGlow") then return end
 local glow=Instance.new("Highlight");glow.Name="BuffGlow";glow.Adornee=character
 glow.FillColor=Color3.fromRGB(122,255,132);glow.FillTransparency=.8
 glow.OutlineColor=Color3.fromRGB(194,150,255);glow.OutlineTransparency=0
 glow.DepthMode=Enum.HighlightDepthMode.Occluded;glow.Parent=character
end
function M.removeGlowOutline(character)
 local glow=character:FindFirstChild("BuffGlow");if glow then glow:Destroy() end
end
return M
