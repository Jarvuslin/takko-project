await page.getByRole('dialog',{name:'R15 Punching Animations',exact:true}).getByRole('button',{name:'Choose this asset',exact:true}).click();
mark('Save assisted selections: stationary dummy, inspected R15 punch clip, impact sound.');
await page.getByRole('dialog',{name:'Choose assets',exact:true}).getByRole('button',{name:'Save replacements',exact:true}).click();
await expect(page.getByRole('dialog',{name:'Choose assets',exact:true})).toBeHidden({timeout:60000});
const id=new URL(page.url()).searchParams.get('project');
const p=await api('/projects/'+id);
fs.writeFileSync(path.join(output,'assisted-selected-project.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'04-assisted-selected-assets.png'),fullPage:true});
return {revision:p.revision,choices:p.assetDiscovery.choices,pinned:p.assetDiscovery.pinned,attachments:p.assetAttachments.map(a=>({assetId:a.assetId,assetVersionId:a.assetVersionId,inspection:a.inspection,animationSelection:a.animationSelection})),unresolved:Object.fromEntries(['mechanics','theme','environment'].map(id=>[id,p.proposal[id].unresolved]))};

