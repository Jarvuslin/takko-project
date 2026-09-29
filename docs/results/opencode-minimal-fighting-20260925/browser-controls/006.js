const id=new URL(page.url()).searchParams.get('project');
const p=await api('/projects/'+id);
if(p.jobId)throw Error('Job is not terminal');
fs.writeFileSync(path.join(output,'browser-terminal-project.json'),JSON.stringify(p,null,2));
mark('Terminal failure. No retry. Planner returned 15 requirements and 10 tasks, then host rejected missing theme dependency coverage before OpenCode launch.');
await page.screenshot({path:path.join(output,'06-terminal-failure.png'),fullPage:true});
fs.writeFileSync(path.join(output,'terminal-ui.txt'),await page.locator('body').innerText());
stop();
return {stage:p.stage,error:p.error,requirements:p.spec?.requirements.length,tasks:p.spec?.tasks.length,openCodeRuns:p.opencodeRuns?.length??0,files:p.artifact?.files.length??0};
