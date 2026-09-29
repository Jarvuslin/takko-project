await page.getByRole('dialog',{name:'Choose assets'}).getByRole('button',{name:'Save replacements',exact:true}).click();
const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
await expect.poll(async()=>!!(await api('/projects/'+id)).assetDiscovery?.approved,{timeout:60000}).toBe(true);
const p=await api('/projects/'+id);fs.writeFileSync(path.join(output,'approved-assets.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'05-approved-assets.png'),fullPage:true});
mark('Automatic dummy and sound preserved. Manual R15 punch selected only after no automatic animation passed. Raw publishing limitation visible.');
return {stage:p.stage,choices:p.assetDiscovery.choices,attachments:p.assetAttachments.map(a=>({id:a.assetId,name:a.name,limitations:a.inspectionLimitations})),charges:p.charges.length,text:(await page.locator('body').innerText()).slice(-2400)};
