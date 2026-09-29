mark('Use Approve & build on the exact saved proposal and inspected manual choices. This is the first implementation attempt.');
const responsePromise = page.waitForResponse(r=>r.url().endsWith('/approve-proposal')&&r.request().method()==='POST');
await page.getByRole('button',{name:'Approve & build',exact:true}).click();
const response = await responsePromise;
const body = await response.json();
fs.writeFileSync(path.join(output,'approval-response.json'),JSON.stringify({status:response.status(),body},null,2));
await page.screenshot({path:path.join(output,'11-approved-build-start.png'),fullPage:true});
return {status:response.status(),revision:body.revision,stage:body.stage,jobId:body.jobId,error:body.error,proposalApproval:body.proposal?.approval};
