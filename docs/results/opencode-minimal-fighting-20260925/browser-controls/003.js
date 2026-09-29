const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
const p=await api('/projects/'+id);
if(p.jobId||!p.proposal)throw Error('Proposal must be complete before assistance');
fs.writeFileSync(path.join(output,'proposal-before-assistance.json'),JSON.stringify(p,null,2));
await page.screenshot({path:path.join(output,'02-automatic-selection-failed.png'),fullPage:true});
mark('Automatic selection failed for all three required groups. Assisted run begins. VFX search is an observed negation-handling defect and is explicitly skipped because VFX is excluded.');
await page.getByRole('button',{name:'Preview & choose assets',exact:true}).click();
const dialog=page.getByRole('dialog',{name:'Choose assets',exact:true});
for(const [group,id] of [['Practice dummy','1245720733'],['Sound effects','132504023010884']]){
 if(!p.assetDiscovery.groups.some(g=>g.label===group&&g.options.some(o=>o.assetId===id)))throw Error('Assisted pick must be present in actual returned results');
 await dialog.getByRole('button',{name:group,exact:true}).click();
 await dialog.locator('article').filter({hasText:'#'+id}).getByRole('button',{name:'Select',exact:true}).click();
}
await dialog.getByRole('button',{name:'Visual effects',exact:true}).click();
await dialog.getByRole('radio',{name:'Find later',exact:true}).check();
await dialog.getByRole('button',{name:'Fighting animation',exact:true}).click();
await dialog.locator('article').filter({hasText:'#12061946559'}).getByRole('button',{name:'Select',exact:true}).click();
const preview=page.getByRole('dialog',{name:'R15 Punching Animations',exact:true});
await expect(preview.getByRole('button',{name:'Choose this asset',exact:true})).toBeEnabled({timeout:60000});
const clips=await preview.getByLabel('Clip from R15 Punching Animations').locator('option').evaluateAll(options=>options.map(o=>({key:o.value,text:o.textContent,disabled:o.disabled})));
fs.writeFileSync(path.join(output,'animation-clips.json'),JSON.stringify(clips,null,2));
await page.screenshot({path:path.join(output,'03-animation-preview.png'),fullPage:true});
return {clips,text:await preview.innerText()};
