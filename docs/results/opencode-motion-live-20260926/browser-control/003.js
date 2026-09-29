const id=new URL(page.url()).searchParams.get('project');const p=await api('/projects/'+id);
fs.writeFileSync(path.join(output,'proposal-with-automatic-assets.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'02-proposal.png'),fullPage:true});
return {text:await page.locator('body').innerText(),stage:p.stage,job:p.jobId,approved:p.assetDiscovery?.approved,choices:p.assetDiscovery?.choices};
