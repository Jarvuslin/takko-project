/** Generates diagnostic Edit-only script isolation, not benchmark game code.
 * Callers own Studio identity/state dispatch and retain the returned restore code.
 * No source is edited and no Play transition is initiated by either template.
 */
export function studioTestIsolation(options: {
  nonce: string;
  countLimit?: number;
}) {
  const { nonce, countLimit = 100 } = options;
  if (
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      nonce,
    )
  )
    throw Error("A caller-supplied UUID nonce is required");
  if (!Number.isSafeInteger(countLimit) || countLimit < 1 || countLimit > 100)
    throw Error(
      "Isolation script count limit must be an integer from 1 to 100",
    );
  const recordScope =
    "TakkoTestIsolation_" + nonce.replaceAll("-", "").toLowerCase();
  const common = `local TOKEN=${JSON.stringify(nonce)}
local SCOPE=${JSON.stringify(recordScope)}
local LIMIT=${countLimit}
local Run=game:GetService("RunService")
local storage=game:GetService("ServerStorage")
local editor=game:GetService("ScriptEditorService")
local encoding=game:GetService("EncodingService")
local function edit() assert(not Run:IsRunning(),"Isolation requires verified Edit; no Play transition is performed") end
local function unique(parent,name)
 local found=nil
 for _,item in parent:GetChildren() do if item.Name==name then assert(not found,"Ambiguous isolation record");found=item end end
 return found
end
local function hash(script)
 local source=editor:GetEditorSource(script)
 assert(type(source)=="string" and #source<=1048576,"Unreadable or oversized script source")
 local digest=encoding:ComputeStringHash(source,Enum.HashAlgorithm.Sha256)
 assert(type(digest)=="string" and #digest==32,"Expected native SHA256 bytes")
 return digest:gsub(".",function(c)return string.format("%02x",string.byte(c))end),#source
end
local function identity(script,parent,name,className,sourceHash)
 assert(script and script:IsA("BaseScript") and script.Parent==parent and parent~=nil,"Original script missing or reparented")
 assert(script.Name==name and script.ClassName==className,"Original script identity changed")
 assert(not script:IsDescendantOf(storage),"Original script moved into storage")
 assert(hash(script)==sourceHash,"Original script source changed")
end
local function reply(operation,count)
 return game:GetService("HttpService"):JSONEncode({marker="takko_test_isolation_v1",operation=operation,nonce=TOKEN,recordScope=SCOPE,scriptCount=count,sourceEdited=false,playChanged=false})
end
`;
  const pause =
    common +
    `edit()
assert(not unique(storage,SCOPE),"Isolation record already exists; reconcile before another pause")
local rows={};local totalBytes=0
-- Complete the read-only preflight before creating records or disabling anything.
for _,script in game:GetDescendants() do
 if script:IsA("BaseScript") and not script:IsDescendantOf(storage) then
  assert(#rows<LIMIT,"Isolation script count limit exceeded")
  local sourceHash,bytes=hash(script);totalBytes+=bytes
  assert(totalBytes<=4194304,"Isolation source byte limit exceeded")
  assert(script.Parent~=nil and type(script.Disabled)=="boolean","Invalid original script state")
  table.insert(rows,{script=script,parent=script.Parent,name=script.Name,className=script.ClassName,sourceHash=sourceHash,disabled=script.Disabled})
 end
end
edit()
for _,row in rows do identity(row.script,row.parent,row.name,row.className,row.sourceHash);assert(row.script.Disabled==row.disabled,"Original enablement changed during preflight") end
local saved=Instance.new("Folder");saved.Name=SCOPE;saved:SetAttribute("Token",TOKEN);saved:SetAttribute("Protocol","takko_test_isolation_v1");saved:SetAttribute("Count",#rows);saved:SetAttribute("Phase","prepared")
for index,row in rows do
 local ref=Instance.new("ObjectValue");ref.Name="Script_"..index;ref.Value=row.script
 ref:SetAttribute("OriginalName",row.name);ref:SetAttribute("OriginalClass",row.className);ref:SetAttribute("SourceHash",row.sourceHash);ref:SetAttribute("Disabled",row.disabled)
 local parent=Instance.new("ObjectValue");parent.Name="OriginalParent";parent.Value=row.parent;parent.Parent=ref;ref.Parent=saved
end
assert(not unique(storage,SCOPE),"Isolation record appeared during preflight")
saved.Parent=storage;assert(unique(storage,SCOPE)==saved,"Isolation record publication failed")
-- Publish every exact identity and original flag before the first script write.
saved:SetAttribute("Phase","pausing")
for _,row in rows do edit();row.script.Disabled=true;assert(row.script.Disabled==true,"Script pause failed; preserve recovery record") end
edit()
saved:SetAttribute("Phase","paused")
return reply("pause",#rows)
`;
  const restore =
    common +
    `edit()
local saved=assert(unique(storage,SCOPE),"Missing isolation recovery record")
assert(saved:IsA("Folder") and saved:GetAttribute("Token")==TOKEN and saved:GetAttribute("Protocol")=="takko_test_isolation_v1","Isolation record ownership mismatch")
assert(saved:GetAttribute("Phase")=="paused","Isolation outcome uncertain; preserve recovery record for reconciliation")
local count=saved:GetAttribute("Count")
assert(type(count)=="number" and count%1==0 and count>=0 and count<=LIMIT and #saved:GetChildren()==count,"Isolation record count changed")
local rows={};local seen={}
-- Validate ALL originals and record structure before restoring any flag.
for index=1,count do
 local ref=assert(unique(saved,"Script_"..index),"Original reference missing")
 assert(ref:IsA("ObjectValue") and #ref:GetChildren()==1,"Original reference structure changed")
 local parent=assert(unique(ref,"OriginalParent"),"Original parent reference missing")
 assert(parent:IsA("ObjectValue") and #parent:GetChildren()==0,"Original parent reference changed")
 local script=ref.Value
 assert(script and not seen[script],"Original script reference missing or duplicated");seen[script]=true
 local disabled=ref:GetAttribute("Disabled");local sourceHash=ref:GetAttribute("SourceHash")
 assert(type(disabled)=="boolean" and type(sourceHash)=="string" and #sourceHash==64,"Original metadata changed")
 identity(script,parent.Value,ref:GetAttribute("OriginalName"),ref:GetAttribute("OriginalClass"),sourceHash)
 assert(script.Disabled==true,"Original enablement changed during isolation")
 table.insert(rows,{script=script,disabled=disabled})
end
edit();saved:SetAttribute("Phase","restoring")
for _,row in rows do edit();row.script.Disabled=row.disabled;assert(row.script.Disabled==row.disabled,"Script restoration failed; preserve recovery record") end
edit()
saved:SetAttribute("Phase","restored")
saved:Destroy();assert(not unique(storage,SCOPE),"Isolation record removal failed")
return reply("restore",#rows)
`;
  return { nonce, recordScope, countLimit, pause, restore };
}
