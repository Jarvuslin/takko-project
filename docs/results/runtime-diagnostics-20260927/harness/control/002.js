const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
await expect.poll(async()=>!!(await api('/projects/'+id)).assetDiscovery,{timeout:60000}).toBe(true);
const p=await api('/projects/'+id);
fs.writeFileSync(path.join(output,'automatic-before-proposal.json'),JSON.stringify(p,null,2));
if(p.charges.length||p.proposal||p.jobId)throw Error('Expected free discovery before the single proposal');
mark('Free discovery saved. No paid relevance occurred before planner-authored needs.');
await page.getByRole('button',{name:'Prepare persistent proposal',exact:true}).click();
return {discoveryGroups:p.assetDiscovery.groups.map(g=>({id:g.id,options:g.options.length,error:g.error})),charges:p.charges.length};
