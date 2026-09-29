const id = new URL(page.url()).searchParams.get('project');
const before = await api('/projects/'+id);
fs.writeFileSync(path.join(output,'before-theme-edit.json'),JSON.stringify(before,null,2));
await page.getByLabel('Message',{exact:true}).fill('Change only the theme to a blue-lit training gym.');
mark('Request a theme-only change through chat to test preservation.');
await page.getByRole('button',{name:'Send',exact:true}).click();
return {text:await page.locator('body').innerText()};
