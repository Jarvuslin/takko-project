const chooser=page.getByRole("dialog",{name:"Choose assets",exact:true});
await chooser.locator("article.asset-option").filter({has:page.getByText("Hit vfx m1 boxing",{exact:true})}).getByRole("button",{name:"Preview",exact:true}).click();
const dialog=page.getByRole("dialog").last();
await expect(dialog.getByRole("heading",{name:"Hit vfx m1 boxing",exact:true})).toBeVisible();
await expect(dialog.getByText("Loading preview…",{exact:true})).toHaveCount(0,{timeout:60000});
await page.screenshot({path:path.join(output,"14-vfx-preview.png")});
return {body:await dialog.innerText(),asset:(await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d")).assetDiscovery.groups.find(g=>g.id==="effects").options.find(a=>a.assetId==="86089736228455")};
