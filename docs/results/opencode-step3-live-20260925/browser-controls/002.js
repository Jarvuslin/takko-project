const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
const p=await api('/projects/'+id);
if(p.jobId||p.proposal)throw Error('Single proposal precondition failed');
fs.writeFileSync(path.join(output,'automatic-before-proposal.json'),JSON.stringify(p,null,2));
mark('Jev attempted all three positive-only brief groups. Dispatch the single proposal with the $8 cumulative cap.');
await page.getByRole('button',{name:'Prepare persistent proposal',exact:true}).click();
await page.waitForTimeout(700);
return {stage:(await api('/projects/'+id)).stage};
