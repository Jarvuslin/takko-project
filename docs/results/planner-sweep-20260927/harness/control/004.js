const id=JSON.parse(fs.readFileSync(path.join(output,'mode-verified.json'),'utf8')).projectId;
const start=Date.now(); let previous='';
while(Date.now()-start<35*60*1000){
 const p=await api('/projects/'+id);
 const signature=JSON.stringify([p.stage,!!p.spec,p.completedBuildTasks?.length,p.artifact?.files.length]);
 if(signature!==previous){
  fs.appendFileSync(path.join(output,'build-milestones.jsonl'),JSON.stringify({at:new Date().toISOString(),stage:p.stage,plan:!!p.spec,completed:p.completedBuildTasks?.length??0,files:p.artifact?.files.length??0})+'\n');previous=signature;
  if(p.spec&&!fs.existsSync(path.join(output,'accepted-plan-project.json')))fs.writeFileSync(path.join(output,'accepted-plan-project.json'),JSON.stringify(p,null,2));
 }
 if(!p.jobId&&['ready_to_test','verified','failed','needs_input'].includes(p.stage)){
  fs.writeFileSync(path.join(output,'terminal-project.json'),JSON.stringify(p,null,2));
  await page.screenshot({path:path.join(output,'03-terminal.png'),fullPage:true});
  let exported=null;
  if(['ready_to_test','verified'].includes(p.stage)){
   const r=await page.request.get('http://127.0.0.1:4335/api/projects/'+id+'/export');
   fs.writeFileSync(path.join(output,'export-response.json'),JSON.stringify({at:new Date().toISOString(),status:r.status(),headers:r.headers()},null,2));
   const body=await r.body();
   if(!r.ok()){fs.writeFileSync(path.join(output,'export-error.txt'),body);throw Error('Export HTTP '+r.status());}
   const filename='Takko-'+id.slice(0,8)+'.rbxlx';fs.writeFileSync(path.join(output,filename),body);exported=filename;
  }
  mark('Run terminal: '+p.stage+'. '+(exported?'Place exported: '+exported:'No exported place.')+' No bridge apply or Studio gameplay.');
  const text=await page.locator('body').innerText();stop();return {stage:p.stage,error:p.error,files:p.artifact?.files.length??0,exported,text};
 }
 await page.waitForTimeout(1000);
}
throw Error('Harness observation deadline reached; inspect active job before taking action');
