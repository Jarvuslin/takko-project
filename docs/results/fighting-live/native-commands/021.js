const chooser=page.getByRole("dialog",{name:"Choose assets",exact:true});
await chooser.getByLabel("Search for Visual effects",{exact:true}).fill("hit vfx");
await chooser.getByRole("button",{name:"Search again",exact:true}).click();
await expect(chooser.getByRole("button",{name:"Search again",exact:true})).toBeEnabled({timeout:30000});
return (await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d")).assetDiscovery.groups.find(g=>g.id==="effects");
