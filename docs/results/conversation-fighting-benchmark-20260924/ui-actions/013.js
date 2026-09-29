mark('Isolated service reloaded with the general asset-identity fix. Reattempt saving selections, no generation retry or paid call.');
await page.getByRole('dialog',{name:'Choose assets',exact:true}).getByRole('button',{name:'Save replacements',exact:true}).click();
await expect(page.getByRole('dialog',{name:'Choose assets',exact:true})).toBeHidden({timeout:60000});
const id = new URL(page.url()).searchParams.get('project');
const p = await api('/projects/'+id);
fs.writeFileSync(path.join(output,'08-selected-project.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'10-selected-assets-after-fix.png'),fullPage:true});
return {revision:p.revision,choices:p.assetDiscovery.choices,pinned:p.assetDiscovery.pinned,attachments:p.assetAttachments,unresolved:Object.fromEntries(['mechanics','theme','environment'].map(id=>[id,p.proposal[id].unresolved]))};
