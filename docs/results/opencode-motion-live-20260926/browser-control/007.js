const id=new URL(page.url()).searchParams.get('project');const p=await api('/projects/'+id);
fs.writeFileSync(path.join(output,'browser-terminal-project.json'),JSON.stringify(p,null,2));
fs.writeFileSync(path.join(output,'terminal-ui.txt'),await page.locator('body').innerText());
await page.screenshot({path:path.join(output,'05-terminal-gate.png'),fullPage:true});
mark('Stopped under user instruction: pre-approval picker rejects selected animation because inspection exceeded 3000 instances. No build dispatched, no retry.');
stop();return {stage:p.stage,calls:p.charges.length,files:p.artifact?.files.length??0,opencodeRuns:p.opencodeRuns??[]};
