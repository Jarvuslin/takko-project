const id=new URL(page.url()).searchParams.get('project');
const p=await api('/projects/'+id);
if(p.jobId)throw Error('Job is still active');
fs.writeFileSync(path.join(output,'browser-terminal-project.json'),JSON.stringify(p,null,2));
mark('Terminal asset capability escalation. No OpenCode job or generated gameplay files. No retry.');
await page.screenshot({path:path.join(output,'06-terminal-failure.png'),fullPage:true});
fs.writeFileSync(path.join(output,'terminal-ui.txt'),await page.locator('body').innerText());
stop();
return {stage:p.stage,error:p.error,calls:p.charges.length,files:p.artifact?.files.length??0,opencodeRuns:p.opencodeRuns??[]};
