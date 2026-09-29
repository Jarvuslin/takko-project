const dialog=page.getByRole("dialog",{name:"Choose assets",exact:true});
await dialog.getByLabel("Search for Fighting animation",{exact:true}).fill("punch animation");
await dialog.getByRole("button",{name:"Search again",exact:true}).click();
await expect(dialog.getByRole("button",{name:"Search again",exact:true})).toBeEnabled({timeout:30000});
const project=await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d");
return project.assetDiscovery.groups.find(g=>g.id==="combat");
