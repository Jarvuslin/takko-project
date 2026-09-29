const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
const p=await api('/projects/'+id);
if(p.jobId)throw Error('Wait for initial automatic Marketplace analysis');
fs.writeFileSync(path.join(output,'automatic-before-proposal.json'),JSON.stringify(p,null,2));
mark('Initial automatic discovery completed before proposal. Preserve exact Jev outcomes. The first proposal click was rejected locally because discovery was running, with no proposal inference dispatched.');
await page.getByRole('button',{name:'Prepare persistent proposal',exact:true}).click();
await page.waitForTimeout(1000);
return {text:await page.locator('body').innerText()};
