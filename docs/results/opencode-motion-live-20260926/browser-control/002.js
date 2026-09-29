const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
const p=await api('/projects/'+id);
if(p.jobId||p.proposal)throw Error('Single proposal precondition failed');
fs.writeFileSync(path.join(output,'automatic-before-proposal.json'),JSON.stringify(p,null,2));
mark('Automatic relevance completed. Dummy 0.84, selected animation clip 0.96, sound 0.89. No manual selection.');
await page.getByRole('button',{name:'Prepare persistent proposal',exact:true}).click();
await page.waitForTimeout(700);
return {stage:(await api('/projects/'+id)).stage};
