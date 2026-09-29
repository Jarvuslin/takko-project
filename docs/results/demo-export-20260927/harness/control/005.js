await page.getByRole('button',{name:'Preview & choose assets'}).click();
const dialog=page.getByRole('dialog',{name:'Choose assets'});await dialog.getByRole('button',{name:'Fighting animation',exact:true}).click();
const option=dialog.locator('.asset-option').filter({hasText:'R15 Punching Animations'}).first();
await option.getByRole('button',{name:'Preview',exact:true}).click();
const preview=page.getByRole('dialog',{name:'R15 Punching Animations',exact:true});await expect(preview.locator('canvas')).toBeVisible({timeout:60000});
await page.screenshot({path:path.join(output,'04-manual-animation-preview.png'),fullPage:true});
return {text:await preview.innerText(),selects:await preview.locator('select').evaluateAll(xs=>xs.map(x=>({label:x.getAttribute('aria-label'),options:[...x.options].map(o=>({value:o.value,text:o.text}))})))};
