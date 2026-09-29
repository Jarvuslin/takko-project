local function value(v)
 if typeof(v)=='Color3' then return {v.R,v.G,v.B} elseif typeof(v)=='Vector3' then return {v.X,v.Y,v.Z} elseif typeof(v)=='EnumItem' then return {name=tostring(v),value=v.Value} else return v end
end
local out={version=version(),instances={}}
local fields={Lighting={'Ambient','OutdoorAmbient','Brightness','ClockTime','GlobalShadows','ExposureCompensation','EnvironmentDiffuseScale','EnvironmentSpecularScale','ShadowSoftness','GeographicLatitude'},Sky={'SkyboxBk','SkyboxDn','SkyboxFt','SkyboxLf','SkyboxRt','SkyboxUp','CelestialBodiesShown','MoonAngularSize','SunAngularSize','StarCount','MoonTextureId','SunTextureId'},Atmosphere={'Density','Offset','Color','Decay','Glare','Haze'},Part={'Size','Position','Color','Material','Anchored','CanCollide','Transparency'},BloomEffect={'Enabled','Intensity','Size','Threshold'},SunRaysEffect={'Enabled','Intensity','Spread'}}
for _,v in game:GetDescendants() do if fields[v.ClassName] and (v.Parent==workspace or v==game:GetService('Lighting') or v:IsDescendantOf(game:GetService('Lighting'))) then local p={} for _,key in fields[v.ClassName] do p[key]=value(v[key]) end table.insert(out.instances,{path=v:GetFullName(),className=v.ClassName,properties=p}) end end
print(game:GetService('HttpService'):JSONEncode(out))
