const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;const p=await api('/projects/'+id);
if(p.jobId||p.spec||!p.assetDiscovery?.approved||p.proposal?.approval)throw Error('Single build approval precondition failed');
fs.writeFileSync(path.join(output,'before-build.json'),JSON.stringify(p,null,2));
mark('One Approve & build action. Delivery is place export only.');
await page.getByRole('button',{name:'Approve & build',exact:true}).click();
await page.waitForTimeout(500);return {stage:(await api('/projects/'+id)).stage};
