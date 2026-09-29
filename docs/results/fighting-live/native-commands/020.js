await page.getByRole("dialog").last().getByRole("button",{name:"Back to results",exact:true}).click();
const chooser=page.getByRole("dialog",{name:"Choose assets",exact:true});
await chooser.getByRole("button",{name:"Visual effects",exact:true}).click();
const p=await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d");
return {body:await chooser.innerText(),groups:p.assetDiscovery.groups.filter(g=>["effects","sound"].includes(g.id))};
