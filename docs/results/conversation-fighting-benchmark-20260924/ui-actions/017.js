const id = new URL(page.url()).searchParams.get('project');
const p = await api('/projects/'+id);
await page.screenshot({path:path.join(output,'12-internal-planning.png'),fullPage:true});
fs.writeFileSync(path.join(output,'planning-progress.json'),JSON.stringify(p,null,2));
return {stage:p.stage,workers:p.coordination?.workers.map(w=>({objective:w.objective,status:w.status})),chargeCount:p.charges.length,spentMicros:p.charges.reduce((n,c)=>n+c.chargedMicros,0),reservedMicros:p.reservedMicros};
