const dialog=page.getByRole("dialog",{name:"Choose assets",exact:true});
return {inputs:await dialog.locator("input").evaluateAll(items=>items.map(x=>({id:x.id,label:x.getAttribute("aria-label"),value:x.value}))),project:(await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d")).assetDiscovery};
