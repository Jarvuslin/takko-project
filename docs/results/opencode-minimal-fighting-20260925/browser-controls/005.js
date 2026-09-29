const id=new URL(page.url()).searchParams.get('project');
const p=await api('/projects/'+id);
if(p.jobId||!p.proposal||p.executionMode!=='opencode'||p.charges.reduce((n,c)=>n+c.chargedMicros,0)>=6000000)throw Error('Build precondition failed');
fs.writeFileSync(path.join(output,'before-single-approval.json'),JSON.stringify(p,null,2));
mark('Single Approve & build. Proposal preserves four requested behaviors. Host holds subsequent paid dispatch for inspection of generated requirements/tasks. No terminal retry or repair allowed.');
await page.getByRole('button',{name:'Approve & build',exact:true}).click();
await page.waitForTimeout(1000);
await page.screenshot({path:path.join(output,'05-build-started.png'),fullPage:true});
return {text:await page.locator('body').innerText()};
