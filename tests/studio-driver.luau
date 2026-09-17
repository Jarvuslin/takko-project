-- Runs only in the disposable native-import fixture, never in another place.
-- Appended by install-studio-plugin.ts --verify; not part of the distributed plugin.
if game.Name == "Forge-scene-verification.rbxlx" and not Run:IsRunning() then
 task.delay(4, function()
  local ok, err = pcall(function()
   local rig = workspace:WaitForChild(verification.scope, 10):WaitForChild("Rig")
   assert(rig.PrimaryPart == rig.HumanoidRootPart, "XML PrimaryPart did not import")
   assert(rig.HumanoidRootPart.RootJoint.Part0 == rig.HumanoidRootPart, "XML Part0 did not import")
   assert(rig.HumanoidRootPart.RootJoint.Part1 == rig.Torso, "XML Part1 did not import")
   assert(rig.Torso.Neck.Part1 == rig.Head, "XML forward reference did not import")
   assert(rig.Outline.Adornee == rig, "XML Adornee did not import")
   print("FORGE_NATIVE_XML_PASS: PrimaryPart, Motor6D Part0/Part1, Highlight.Adornee")
   -- Remove only this disposable fixture's imported roots to test normal first application.
   for _,parent in {workspace,game:GetService("ReplicatedStorage"),game:GetService("ServerScriptService"),game:GetService("ServerStorage"),game:GetService("StarterGui"),game:GetService("StarterPlayer").StarterPlayerScripts} do
    local root = parent:FindFirstChild(verification.scope)
    if root then root:Destroy() end
   end
   endpoint.Text = "http://127.0.0.1:4318"
   key.Text = Http:JSONDecode(Http:GetAsync(endpoint.Text.."/api/studio/pairing")).token
   connectToForge()
   assert(session, status.Text)
   for _,kind in {"apply", "test"} do
    local r = Http:RequestAsync({Url=endpoint.Text.."/api/projects/"..verification.id.."/studio",Method="POST",Headers={["Content-Type"]="application/json"},Body=Http:JSONEncode({studioId=session,kind=kind})})
    assert(r.Success, r.Body)
    local deadline=os.clock()+12
    repeat task.wait(.2) until pending or os.clock()>deadline
    assert(pending,"Plugin failed to poll queued "..kind)
    executePending()
    assert(outbox and outbox.ok, status.Text)
    print("FORGE_NATIVE_"..kind:upper().."_RESULT: "..Http:JSONEncode(outbox))
    deadline=os.clock()+12
    repeat task.wait(.2) until not outbox or os.clock()>deadline
    assert(not outbox,"Result was not acknowledged")
   end
   print("FORGE_NATIVE_VERIFICATION_FINISHED")
  end)
  if not ok then warn("FORGE_NATIVE_VERIFICATION_FAILED: "..tostring(err)) end
 end)
end
