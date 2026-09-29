const id=new URL(page.url()).searchParams.get('project');const p=await api('/projects/'+id);
fs.writeFileSync(path.join(output,'selection-save-observation.json'),JSON.stringify(p,null,2));
fs.writeFileSync(path.join(output,'selection-save-ui.txt'),await page.locator('body').innerText());
await page.screenshot({path:path.join(output,'04-selection-save-observation.png'),fullPage:true});
return {text:await page.locator('body').innerText(),job:p.jobId,error:p.error};
