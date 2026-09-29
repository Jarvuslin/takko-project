await page.getByRole('dialog',{name:'Training Dummy',exact:true}).getByRole('button',{name:'Choose this asset',exact:true}).click();
const dialog=page.getByRole('dialog',{name:'Choose assets'});await dialog.getByRole('button',{name:'Sound effects',exact:true}).click();
const option=dialog.locator('.asset-option').filter({hasText:'#101355487033225'});
if(await option.count()!==1)throw Error('Previously inspected sound not in current results');
await option.getByRole('button',{name:'Preview',exact:true}).click();
const preview=page.getByRole('dialog',{name:'Punch impact',exact:true});await expect(preview).toBeVisible();await page.screenshot({path:path.join(output,'04-manual-sound-preview.png'),fullPage:true});return {text:await preview.innerText()};
