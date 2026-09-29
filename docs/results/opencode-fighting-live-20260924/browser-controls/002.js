const id = new URL(page.url()).searchParams.get('project');
const p = await api('/projects/'+id);
fs.writeFileSync(path.join(output,'03-proposal-project.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'03-proposal.png'),fullPage:true});
return {text:await page.locator('body').innerText(),proposal:p.proposal,choices:p.assetDiscovery?.choices,groups:p.assetDiscovery?.groups.map(g=>({id:g.id,label:g.label,count:g.options.length,recommendation:g.recommendation})),charges:p.charges};
