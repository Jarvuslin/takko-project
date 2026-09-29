const id=new URL(page.url()).searchParams.get('project');
const p=await api('/projects/'+id);
if(p.jobId)throw Error('Wait for the paid attempt to settle');
fs.writeFileSync(path.join(output,'terminal-project.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'10-terminal-failure.png'),fullPage:true});
mark('Terminal failure before OpenCode: approved asset has no requirement link. No retry, generated code, apply or gameplay.');
stop();
return {stage:p.stage,error:p.error,charges:p.charges.length,files:p.artifact?.files?.length??0,opencodeRuns:p.opencodeRuns?.length??0};
