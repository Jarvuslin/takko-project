assert(exports.status.Text:find("Open Takko",1,true),"Plugin instructions must use the Takko brand")
exports.connect()
assert(#httpRequests==2,'Local connection must fetch pairing and connect')
assert(httpRequests[1].Url=='http://127.0.0.1:4318/api/studio/pairing')
assert(httpRequests[2].Headers.Authorization=='Bearer local-test-token')
assert(httpBodies[1].protocolVersion==2 and httpBodies[1].capabilities[1]=='apply' and httpBodies[1].capabilities[2]=='test')
assert(exports.session()=='local-test-session')
assert(exports.status.Text:find("Takko's Studio panel",1,true),"Connected instructions must use the Takko brand")
assert(exports.endpoint.ClearTextOnFocus==false)
exports.key.Text=' supplied-token '
exports.connect()
assert(#httpRequests==3 and httpRequests[3].Headers.Authorization=='Bearer supplied-token')
exports.endpoint.Text='https://external.example'
exports.connect()
assert(#httpRequests==3,'Non-local endpoints must be rejected before networking')
exports.endpoint.Text='http://127.0.0.1:4318'
print('PASS one-click local pairing, supplied tokens and local-only endpoint validation')
local function fails(fn,pattern) local ok,err=pcall(fn);assert(not ok and tostring(err):find(pattern),tostring(err)) end
local source='local marker = "original"'
local op={id='12345678-1234-1234-1234-123456789012',scope='Forge_Test',artifactHash='hash1',revision=1,bundle={scene={{path='Workspace/Forge_Test/Ground',className='Part',properties={Anchored=true,Size={type='Vector3',value={40,1,40}}}}},files={{path='ServerScriptService/Forge_Test/Game.server.luau',kind='Script',source=source}}},tests={{id='testOne',mode='server',source='return function(ctx) assert(ctx.scope) end'}}}
local unrelated=Instance.new('Part');unrelated.Name='UserWork';unrelated.Parent=workspace
table.insert(op.bundle.scene,{path='Workspace/Forge_Test',className='Folder',properties={}})
exports.apply(op)
assert(workspace:FindFirstChild('UserWork')==unrelated,'Unrelated scene was changed')
assert(workspace:FindFirstChild(op.scope):FindFirstChild('Ground').Size=='40,1,40')
local scriptRoot=game:GetService('ServerScriptService'):FindFirstChild(op.scope)
assert(scriptRoot:FindFirstChild('Game').Source==source,'Generated source was not applied')
print('PASS apply creates actual manifest objects and source, preserving unrelated content')
exports.runTests(op)
assert(not game:GetService('ReplicatedStorage'):FindFirstChild('ForgeTest_'..op.id:gsub('-','')),'Test harness was not cleaned up')
print('PASS test harness inserts server/client code and removes temporary instances')
failSource=true
fails(function() exports.runTests(op) end,'Source permission denied')
assert(not game:GetService('ReplicatedStorage'):FindFirstChild('ForgeTest_'..op.id:gsub('-','')),'Setup failure leaked a harness')
local savedTests=op.tests;op.tests={}
fails(function() exports.runTests(op) end,'No acceptance tests')
op.tests=savedTests
print('PASS empty tests are rejected and failed harness setup is cleaned up')
op.artifactHash='changed'
fails(function() exports.runTests(op) end,'exact artifact')
op.artifactHash='hash1'
scriptRoot:FindFirstChild('Game').Source='-- user edit'
fails(function() exports.apply(op) end,'Owned objects changed')
fails(function() exports.runTests(op) end,'changed after apply')
assert(scriptRoot:FindFirstChild('Game').Source=='-- user edit')
print('PASS source edits and mismatched artifacts block replacement and stale test reports')
scriptRoot:FindFirstChild('Game').Source=source
local oldRoot=workspace:FindFirstChild(op.scope)
duringSource=function() scriptRoot:FindFirstChild('Game').Source='-- concurrent user edit' end
fails(function() exports.apply(op) end,'changed during staging')
assert(workspace:FindFirstChild(op.scope)==oldRoot,'Concurrent edit replaced the existing scene')
assert(scriptRoot:FindFirstChild('Game').Source=='-- concurrent user edit','Concurrent source edit was lost')
scriptRoot:FindFirstChild('Game').Source=source
print('PASS source edits during yielding staging prevent replacement')
op.bundle.scene[1].properties.Size={type='NotAType',value={}}
fails(function() exports.apply(op) end,'Unknown property type')
assert(workspace:FindFirstChild(op.scope)==oldRoot,'Failed construction replaced the existing scene')
print('PASS failed staging preserves the existing project')
local rig={id='rig',scope='Forge_Rig',artifactHash='rig1',revision=1,bundle={files={{path='ReplicatedStorage/Forge_Rig/PlayerModels.module.luau',kind='ModuleScript',source='return {}'}},scene={
 {path='Workspace/Forge_Rig/Rig',className='Model',properties={PrimaryPart={type='Ref',path='Workspace/Forge_Rig/Rig/Root'}}},
 {path='Workspace/Forge_Rig/Rig/Joint',className='Motor6D',properties={Part0={type='Ref',path='Workspace/Forge_Rig/Rig/Root'},Part1={type='Ref',path='Workspace/Forge_Rig/Rig/Head'}}},
 {path='Workspace/Forge_Rig/Rig/Root',className='Part',properties={}},
 {path='Workspace/Forge_Rig/Rig/Head',className='Part',properties={}}
}},tests={}}
exports.apply(rig)
assert(game:GetService('ReplicatedStorage'):FindFirstChild('Forge_Rig'):FindFirstChild('PlayerModels').ClassName=='ModuleScript','Module filename suffix was not removed')
local model=workspace:FindFirstChild('Forge_Rig'):FindFirstChild('Rig')
assert(model.PrimaryPart==model:FindFirstChild('Root'))
assert(model:FindFirstChild('Joint').Part0==model.PrimaryPart)
assert(model:FindFirstChild('Joint').Part1==model:FindFirstChild('Head'))
rig.bundle.scene[2].properties.Part1.path='Workspace/Other/Head'
fails(function() exports.apply(rig) end,'Missing reference target')
assert(workspace:FindFirstChild('Forge_Rig'):FindFirstChild('Rig')==model)
print('PASS forward references resolve to staged instances; missing references preserve the applied rig')
local meshOp={id='mesh-import',scope='Forge_Mesh',artifactHash='mesh-hash',revision=1,importedMeshIds={'rbxassetid://12345'},bundle={files={},scene={
 {path='Workspace/Forge_Mesh/Imported',className='MeshPart',properties={MeshId='rbxassetid://12345',TextureID='rbxassetid://56789',Anchored=true,Size={type='Vector3',value={4,2,3}}}}
}},tests={}}
exports.apply(meshOp)
local meshRoot=workspace:FindFirstChild(meshOp.scope)
local imported=meshRoot:FindFirstChild('Imported')
assert(imported.ClassName=='MeshPart' and imported.MeshId=='rbxassetid://12345')
assert(imported.TextureID=='rbxassetid://56789' and imported.Size=='4,2,3')
assert(meshCalls[1].content.Uri=='rbxassetid://12345' and next(meshCalls[1].options)==nil)
assert(meshIdSetterAttempts==0,'Read-only MeshId was assigned after mesh creation')
print('PASS authorized imported MeshPart is created through AssetService Content without assigning read-only MeshId')
local meshCallCount=#meshCalls
meshOp.importedMeshIds=nil
fails(function() exports.apply(meshOp) end,'not authorized')
meshOp.importedMeshIds={'rbxassetid://12345'}
meshOp.bundle.scene[1].properties.MeshId='rbxassetid://99999'
fails(function() exports.apply(meshOp) end,'not authorized')
for _,invalidId in {'https://www.roblox.com/asset/?id=12345','12345','rbxassetid://012345','rbxassetid://0',12345,{type='Ref',path='Workspace/Other'}} do
 meshOp.bundle.scene[1].properties.MeshId=invalidId
 fails(function() exports.apply(meshOp) end,'normalized declared MeshId')
end
meshOp.bundle.scene[1].properties.MeshId=nil
fails(function() exports.apply(meshOp) end,'normalized declared MeshId')
meshOp.bundle.scene[1].properties.MeshId='rbxassetid://12345'
assert(#meshCalls==meshCallCount,'Untrusted mesh metadata reached the native allocator')
assert(workspace:FindFirstChild(meshOp.scope)==meshRoot and not imported._destroyed,'Untrusted import replaced existing content')
print('PASS absent authorization, forged mesh IDs and noncanonical IDs are rejected before native allocation')
failMesh=true
fails(function() exports.apply(meshOp) end,'Mesh asset access denied')
assert(workspace:FindFirstChild(meshOp.scope)==meshRoot and meshRoot:FindFirstChild('Imported')==imported,'Failed native allocation changed the old root')
assert(meshIdSetterAttempts==0)
print('PASS native mesh allocation failure preserves the existing owned root and does not report success')
duringMesh=function() coroutine.yield('mesh-staging') end
local meshCoroutine=coroutine.create(function() exports.apply(meshOp) end)
local meshStarted,meshPhase=coroutine.resume(meshCoroutine)
assert(meshStarted and meshPhase=='mesh-staging')
assert(workspace:FindFirstChild(meshOp.scope)==meshRoot,'Mesh staging touched the live root before its yielding API returned')
imported.TextureID='rbxassetid://77777'
local meshFinished,meshError=coroutine.resume(meshCoroutine)
assert(not meshFinished and tostring(meshError):find('changed during staging'),tostring(meshError))
assert(workspace:FindFirstChild(meshOp.scope)==meshRoot and imported.TextureID=='rbxassetid://77777','Concurrent user edit was not preserved')
assert(createdMeshes[#createdMeshes]._destroyed,'Rejected staged mesh was not cleaned up')
assert(meshIdSetterAttempts==0)
print('PASS yielding mesh allocation rechecks ownership and preserves concurrent texture edits')
local dispatched={protocolVersion=2,id='dispatch-one',dispatchId='lease-one',scope='Forge_Dispatch',artifactHash='dispatch-hash',revision=1,kind='apply',expiresAt=2000,bundle={scene={},files={}},tests={}}
local offer=true
local outcome='dispatched'
local pauseValidation=false
local failReceipt=false
httpHandler=function(options)
 if options.Url:find('/operations/',1,true) then
  if pauseValidation then coroutine.yield('validating') end
  return {Success=true,StatusCode=200,Body={state=outcome,dispatchId=dispatched.dispatchId,artifactHash=dispatched.artifactHash,revision=1,expiresAt=dispatched.expiresAt}}
 elseif options.Url:find('/result',1,true) then
  return {Success=not failReceipt,StatusCode=failReceipt and 503 or 200,Body={duplicate=false}}
 else local result=offer and dispatched or nil;offer=false;return {Success=true,StatusCode=200,Body={operation=result}} end
end
exports.poll();assert(exports.pending()==dispatched)
exports.poll();assert(exports.pending()==dispatched,'An empty heartbeat dropped delivered work')
pauseValidation=true
local clicksBefore=#httpRequests
local recordingsBefore=applyRecordings
local first=coroutine.create(exports.execute)
local resumed,point=coroutine.resume(first);assert(resumed and point=='validating')
exports.execute()
assert(#httpRequests==clicksBefore+1,'Second click entered network validation while busy')
assert(coroutine.resume(first))
assert(applyRecordings==recordingsBefore+1,'Overlapping clicks applied more than once')
assert(exports.outbox().dispatchId=='lease-one')
local reconnectRequests=#httpRequests
exports.connect();assert(#httpRequests==reconnectRequests,'Reconnect orphaned an undelivered result')
failReceipt=true;exports.poll();assert(exports.outbox(),'Lost acknowledgment discarded result')
failReceipt=false;exports.poll();assert(not exports.outbox(),'Result was not retried')
pauseValidation=false;offer=true;dispatched.id='dispatch-expired';dispatched.dispatchId='lease-expired';dispatched.expiresAt=999
exports.poll();exports.execute();assert(applyRecordings==recordingsBefore+1,'Expired command mutated Studio')
assert(exports.outbox().executionStatus=='not_started','Expired pending command did not release its delivery with proof')
offer=true;dispatched.id='dispatch-unknown';dispatched.dispatchId='lease-unknown';dispatched.expiresAt=2000;outcome='unknown'
exports.poll();exports.execute();assert(applyRecordings==recordingsBefore+1,'Unknown outcome was executed again')
assert(exports.outbox().executionStatus=='not_started','Unexecuted pending work remained ambiguous')
print('PASS delivered work survives heartbeats, double clicks execute once, receipts retry, and stale commands cannot run')
exports.poll();assert(not exports.outbox())
exports.endpoint.Text='http://127.0.0.1:4319';exports.key.Text='new-token'
httpHandler=function(options)
 if options.Url:find('/connect',1,true) then coroutine.yield('connecting');return {Success=true,StatusCode=200,Body={id='replacement-session'}} end
 return {Success=true,StatusCode=200,Body={}}
end
local oldSession=exports.session()
local reconnect=coroutine.create(exports.connect)
local began,phase=coroutine.resume(reconnect);assert(began and phase=='connecting')
local requestsDuringConnect=#httpRequests
exports.poll();exports.connect();exports.execute()
assert(#httpRequests==requestsDuringConnect,'Connect did not serialize polling and duplicate connects')
assert(exports.session()==oldSession,'Session changed before connection succeeded')
assert(coroutine.resume(reconnect));assert(exports.session()=='replacement-session')
exports.poll()
assert(httpRequests[#httpRequests].Url=='http://127.0.0.1:4319/api/bridge/replacement-session/poll')
assert(httpRequests[#httpRequests].Headers.Authorization=='Bearer new-token')
httpHandler=function() coroutine.yield('polling');return {Success=true,StatusCode=200,Body={}} end
local pollThread=coroutine.create(exports.poll)
local polled,pollPhase=coroutine.resume(pollThread);assert(polled and pollPhase=='polling')
local requestsDuringPoll=#httpRequests
exports.connect();exports.poll()
assert(#httpRequests==requestsDuringPoll,'Reconnect overlapped an in-flight poll')
assert(coroutine.resume(pollThread))
exports.endpoint.Text='http://127.0.0.1:4320';exports.key.Text='rejected-token'
httpHandler=function(options) return {Success=not options.Url:find('/connect',1,true),StatusCode=403,Body={}} end
exports.connect();assert(exports.session()=='replacement-session')
exports.poll()
assert(httpRequests[#httpRequests].Url=='http://127.0.0.1:4319/api/bridge/replacement-session/poll','Failed reconnect replaced the previous endpoint')
assert(httpRequests[#httpRequests].Headers.Authorization=='Bearer new-token','Failed reconnect replaced the previous token')
print('PASS reconnect serializes with polling, commits connection state only on success, and preserves failed reconnect state')
for _,text in captured do print('SOURCE_BEGIN');print(text);print('SOURCE_END') end
