let dialog=page.getByRole("dialog").last();
await dialog.getByRole("button",{name:"Choose this asset",exact:true}).click();
const chooser=page.getByRole("dialog",{name:"Choose assets",exact:true});
await chooser.getByRole("button",{name:"Visual effects",exact:true}).click();
const project=await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d");
await page.screenshot({path:path.join(output,"12-effects-options.png")});
return {body:await chooser.innerText(),groups:project.assetDiscovery.groups.filter(g=>["effects","sound"].includes(g.id))};
