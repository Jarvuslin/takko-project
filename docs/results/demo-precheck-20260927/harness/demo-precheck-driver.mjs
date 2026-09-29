import fs from 'node:fs';const out='docs/results/demo-precheck-20260927';const f=JSON.parse(fs.readFileSync(out+'/fixture.json','utf8'));
const source=fs.readFileSync('plugin/Forge.plugin.luau','utf8');
const driver=`
endpoint.Text="http://127.0.0.1:4335"
local report={projectId="${f.project}",scope="${f.scope}",placeId=game.PlaceId,execution="Current plugin source in a temporary native Plugin, not proof the old loaded plugin hot-reloaded"}
local ok,err=pcall(function()
 assert(game.PlaceId==122588481889475 and not Run:IsRunning(),"Wrong target or mode")
 connectToForge();assert(session,status.Text);report.connected=true
 local response=Http:RequestAsync({Url=endpoint.Text.."/api/projects/${f.project}/studio",Method="POST",Headers={["Content-Type"]="application/json"},Body=Http:JSONEncode({studioId=session,kind="apply"})})
 assert(response.Success,response.Body);report.queued=Http:JSONDecode(response.Body)
 local deadline=os.clock()+15 repeat pollOnce();task.wait(.2) until pending or os.clock()>deadline
 assert(pending,"No dispatch received");executePending();assert(outbox,status.Text);report.receipt=outbox
 pollOnce();assert(not outbox,"Receipt not acknowledged")
 report.acknowledged=request("/"..session.."/operations/"..report.queued.id)
 assert(report.receipt.ok,"Apply failed")
 local part=workspace:FindFirstChild("${f.scope}"):FindFirstChild("Probe")
 local mod=game:GetService("ReplicatedStorage"):FindFirstChild("${f.scope}"):FindFirstChild("Receipt")
 assert(part and part:IsA("Part") and mod and mod:IsA("ModuleScript"),"Native objects missing")
 report.source=Editor:GetEditorSource(mod);report.nativeObjectsVerified=true
 local denied=Http:RequestAsync({Url=endpoint.Text.."/api/projects/${f.nativeReplayProject}/studio",Method="POST",Headers={["Content-Type"]="application/json"},Body=Http:JSONEncode({studioId=session,kind="apply"})})
 report.nativeReplay={httpStatus=denied.StatusCode,response=Http:JSONDecode(denied.Body)}
end)
report.ok=ok;report.error=not ok and tostring(err) or nil
alive=false
for _,parent in {workspace,game:GetService("ReplicatedStorage"),game:GetService("ServerScriptService"),game:GetService("ServerStorage"),game:GetService("StarterGui"),game:GetService("StarterPlayer").StarterPlayerScripts} do local root=parent:FindFirstChild("${f.scope}");if root then root:Destroy() end end
widget:Destroy();plugin:Destroy()
report.cleaned=true;report.running=Run:IsRunning()
local sent=Http:RequestAsync({Url="http://127.0.0.1:4335/probe-result",Method="POST",Headers={["Content-Type"]="application/json"},Body=Http:JSONEncode(report)})
assert(sent.Success,"Could not persist native evidence")
return Http:JSONEncode(report)
`;
fs.writeFileSync(out+'/harness/native-roundtrip.luau','local plugin=PluginManager():CreatePlugin()\n'+source.replace('"ForgeV2"','"ForgeDemoPrecheck20260927"')+'\n'+driver);
