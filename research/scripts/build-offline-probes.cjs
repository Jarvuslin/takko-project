// Wrap actual extracted Luau bodies with local mocks. Never contacts Lemonade or Studio.
const fs=require('node:fs');
const root='research/evidence/plugin/source/';
function moduleBody(file,names){return fs.readFileSync(root+file,'utf8').split('\n').filter(line=>!names.some(n=>new RegExp('^local '+n+' =').test(line))).join('\n');}
const service=moduleBody('135-StudioActionService.luau',['HttpCore','HttpService','Lemonade','Log','manifest']);
const rollback=moduleBody('062-batchRollback.luau',['HttpService','Lemonade','Log','helpers','WriteHelpers','PropertyConverter']);
const runTests=moduleBody('091-runTests.luau',['RunService','LogService','Lemonade','Log']);
const render=moduleBody('089-renderContentId.luau',['AssetService']);
const code=`-- Generated from actual shipped modules; dependency lines replaced with mocks only.
local Log={info=function()end,warn=function()end,debug=function()end,trace=function()end,error=function(...) error('log error') end}
local queued={}
local task={spawn=function(fn) table.insert(queued,fn) return fn end,wait=function() end}
local calls={}
local responseStatus=200
local HttpCore={API_BASE_PATH='mock://local',request=function(method,path,body,headers)
 table.insert(calls,{method=method,path=path,body=body,project=headers and headers['X-Project-Id']})
 return {StatusCode=responseStatus,Body='{}'}
end}
local HttpService={JSONDecode=function()return {}end}
local manifest={package={version='2.2.4'}}
local StudioActionService=(function()
${service}
end)()
local observed=0
local function check(name,condition,detail)
 assert(condition, 'Probe did not reproduce: '..name)
 observed+=1
 print('REPRODUCED | '..name..' | '..detail)
end
local s=StudioActionService.new()
local mutations=0
s.projectId='project-A'
s.actionHandlers={createInstance=function()mutations+=1 return {status='completed'}end}
local req={requestId='same-id',toolName='createInstance',params={},timestamp=1}
s:_executeRequest(req)
s:_executeRequest(req)
check('Duplicate delivery executes mutation twice',mutations==2,'No client deduplication; server redelivery policy remains unknown')
calls={};responseStatus=503
s:_postResult('failed-post',{status='completed'})
check('Failed result POST has no client retry',#calls==1,'One HTTP 503 produces one attempt; no persisted outbox in this module')
responseStatus=200;calls={}
s.isPolling=true
s.actionHandlers={slow=function()coroutine.yield()return {status='completed'}end}
local worker=coroutine.create(function()s:_executeRequest({requestId='old-request',toolName='slow',params={},timestamp=1})end)
assert(coroutine.resume(worker))
s:stopPolling()
s:startPolling('project-B',{})
assert(coroutine.resume(worker))
check('In-flight result reads mutable project ID',calls[1].project=='project-B','Old request posted with new project ID on same service object; app normally recreates Core, reducing this specific reachability')
-- Actual application stop path, without restarting the same object.
calls={};s.projectId='project-A';s.isPolling=true
s.actionHandlers={slow=function()coroutine.yield()return {status='completed'}end}
worker=coroutine.create(function()s:_executeRequest({requestId='disconnected-request',toolName='slow',params={},timestamp=1})end)
assert(coroutine.resume(worker));s:stopPolling();assert(coroutine.resume(worker))
check('Disconnect drops in-flight result project header',calls[1].project=='','Running handler survives stopPolling but self.projectId becomes nil')
local helpers={}
local WriteHelpers={}
local PropertyConverter={convertPropertyValue=function(_,value)return value end}
local batchRollback=(function()
${rollback}
end)()
local fakeScript={Source='old',IsA=function(_,name)return name=='LuaSourceContainer'end,IsDescendantOf=function()return true end}
local tree={getInstance=function(_,id)if id=='script-1' then return fakeScript end end}
local r=batchRollback({tree=tree},{messageId='m',operations={
 {type='updateScript',uniqueId='script-1',content='restored',path='Script'},
 {type='unsupported',uniqueId='bad'}
}})
check('Rollback returns completed after partial failure',r.status=='completed' and r.operationsFailed==1 and fakeScript.Source=='restored','Successful earlier mutation is retained; batch is not all-or-nothing')
local callback=nil
local simulateWarning=false
local Enum={MessageType={MessageError=1,MessageWarning=2,MessageInfo=3,MessageOutput=4}}
local LogService={MessageOut={Connect=function(_,fn)callback=fn return {Disconnect=function()callback=nil end}end}}
local RunService={Run=function()if simulateWarning then callback('benign warning',Enum.MessageType.MessageWarning)end end,Stop=function()end}
local runTests=(function()
${runTests}
end)()
local clean=runTests({}, {timeout=0})
check('No-assertion simulation reports one passing test',clean.totalTests==1 and clean.passedTests==1,'This is a smoke check, not a gameplay correctness assertion')
simulateWarning=true
local warned=runTests({}, {timeout=0})
check('Warning-only simulation reports failing test',warned.failedTests==1 and #warned.errors==1,'Warnings are classified together with errors')
responseStatus=403;s.projectId='project-A';s.isPolling=true
HttpService.JSONDecode=function()return {message='outdated'}end
local outdatedOk=pcall(function()s:_poll()end)
check('Logging exception bypasses outdated-version stop',not outdatedOk and s.isPolling,'With throwing Log.error, execution never reaches stopPolling in the 403 branch; production logger throws when logging is enabled')
local AssetService={CreateEditableImageAsync=function()return {Size={X=1080,Y=1920},Destroy=function()end}end}
local renderer=(function()
${render}
end)()
local portraitOk,portraitError=pcall(renderer.renderToBuffer,'mock://portrait',1024)
check('Portrait frame rejected by width-only scaling',not portraitOk and string.find(tostring(portraitError),'1024x1820',1,true)~=nil,'1080x1920 with maxWidth=1024 exceeds the 1024 height limit in the direct-upload path')
print('PROBES_COMPLETE '..observed)
`;
fs.writeFileSync('research/tests/offline-probes.luau',code);
console.log('Generated probes from actual module bodies; mocks only at external dependency boundaries.');
