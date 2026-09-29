const preview = page.getByRole('dialog',{name:'R15 Punching Animations',exact:true});
await expect(preview.getByRole('button',{name:'Choose this asset',exact:true})).toBeEnabled({timeout:90000});
const clips = await preview.getByLabel('Clip from R15 Punching Animations').locator('option').evaluateAll(options => options.map(o=>({key:o.value,text:o.textContent,disabled:o.disabled})));
fs.writeFileSync(path.join(output,'animation-clips.json'),JSON.stringify(clips,null,2));
await page.screenshot({path:path.join(output,'07-animation-preview.png'),fullPage:true});
return {clips,text:await preview.innerText()};
