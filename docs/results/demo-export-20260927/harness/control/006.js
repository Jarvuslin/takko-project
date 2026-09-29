const preview=page.getByRole('dialog',{name:'R15 Punching Animations',exact:true});
await preview.getByLabel('Clip from R15 Punching Animations').selectOption('1/1/18/1');
await preview.getByRole('button',{name:'Choose this asset',exact:true}).click();
const dialog=page.getByRole('dialog',{name:'Choose assets'});
return {buttons:await dialog.getByRole('button').allTextContents(),text:(await dialog.innerText()).slice(-2300)};
