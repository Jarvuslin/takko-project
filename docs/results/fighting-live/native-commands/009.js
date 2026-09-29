const dialog=page.getByRole("dialog",{name:"Choose assets",exact:true});
await dialog.locator('input[type="text"], input:not([type])').fill("punch animation pack");
await dialog.getByRole("button",{name:"Search again",exact:true}).click();
await expect(dialog.getByRole("button",{name:"Search again",exact:true})).toBeEnabled({timeout:30000});
await page.screenshot({path:path.join(output,"07-punch-search.png")});
const p=await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d");
return {body:await dialog.innerText(),group:p.assetDiscovery.groups.find(g=>g.id==="combat")};
