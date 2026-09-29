const id=new URL(page.url()).searchParams.get('project');const p=await api('/projects/'+id);
await page.getByRole('button',{name:'Preview & choose assets',exact:true}).click();
const dialog=page.getByRole('dialog',{name:'Choose assets',exact:true});
for(const g of p.assetDiscovery.groups){
 const a=g.relevance;if(!a?.candidateId)throw Error('No automatic pick');
 await dialog.getByRole('button',{name:g.label,exact:true}).click();
 const card=dialog.locator('article').filter({hasText:'#'+a.candidateId});
 await card.getByRole('button',{name:'Select',exact:true}).click();
 if(g.preview==='animation'){
  const option=g.options.find(o=>o.assetId===a.candidateId);const preview=page.getByRole('dialog',{name:option.name,exact:true});
  await expect(preview.getByRole('button',{name:'Choose this asset',exact:true})).toBeEnabled({timeout:60000});
  await preview.getByLabel('Clip from '+option.name).selectOption(a.clipKey);
  await page.screenshot({path:path.join(output,'03-automatic-animation-preview.png'),fullPage:true});
  fs.writeFileSync(path.join(output,'animation-preview-ui.txt'),await preview.innerText());
  await preview.getByRole('button',{name:'Choose this asset',exact:true}).click();
 }
}
await dialog.getByRole('button',{name:'Save replacements',exact:true}).click();
await expect(dialog).toBeHidden({timeout:60000});
const saved=await api('/projects/'+id);fs.writeFileSync(path.join(output,'confirmed-model-picks.json'),JSON.stringify(saved,null,2));
mark('Manually confirmed exactly the three model recommendations. No alternative asset substituted.');
return {choices:saved.assetDiscovery.choices,approved:saved.assetDiscovery.approved};
