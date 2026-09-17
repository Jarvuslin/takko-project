-- Temporary harness for a new disposable place; excluded from the normal plugin.
if game.Name == "Forge-project-verification.rbxlx" and not Run:IsRunning() then
 task.delay(5, function()
  local ok, err = pcall(function()
   endpoint.Text="http://127.0.0.1:4318"
   key.Text=""
   connectToForge()
   assert(session,status.Text)
   print("FORGE_PROJECT_CONNECTED: "..game.Name)
   local ready=false
   local project
   local deadline=os.clock()+600
   repeat
    project=Http:JSONDecode(Http:GetAsync(endpoint.Text.."/api/projects/"..verification.id))
    ready=not project.jobId and (project.stage=="ready_to_test" or project.stage=="verified")
    if not ready then task.wait(3) end
   until ready or os.clock()>deadline
   assert(ready,"Generation did not become ready within ten minutes")
   for _,kind in {"apply","test"} do
    local response=Http:RequestAsync({Url=endpoint.Text.."/api/projects/"..verification.id.."/studio",Method="POST",Headers={["Content-Type"]="application/json"},Body=Http:JSONEncode({studioId=session,kind=kind})})
    assert(response.Success,response.Body)
    deadline=os.clock()+15
    repeat task.wait(.2) until pending or os.clock()>deadline
    assert(pending,"Plugin did not receive queued "..kind)
    executePending()
    local report=outbox
    assert(report,status.Text)
    print("FORGE_PROJECT_"..kind:upper().."_RESULT: "..Http:JSONEncode(report))
    deadline=os.clock()+15
    repeat task.wait(.2) until not outbox or os.clock()>deadline
    assert(not outbox,"Result was not acknowledged")
    assert(report.ok,"Studio operation failed; see result logs")
   end
   if verification.behaviorSource then
    busy=true
    local success,report=pcall(function() return runTests({id=Http:GenerateGUID(false),scope=project.scope,artifactHash=applied[project.scope],tests={{id="independent_cookie_behavior",mode="client",source=verification.behaviorSource}}}) end)
    busy=false
    assert(success,tostring(report))
    print("FORGE_PROJECT_BEHAVIOR_RESULT: "..Http:JSONEncode(report))
    assert(#report.checks==1 and report.checks[1].status=="passed","Independent behavioral audit failed")
   end
   print("FORGE_PROJECT_VERIFICATION_FINISHED")
  end)
  if not ok then warn("FORGE_PROJECT_VERIFICATION_FAILED: "..tostring(err)) end
 end)
end
