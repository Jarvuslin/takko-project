const dialog=page.getByRole("dialog").last();
await expect(dialog.getByText("Loading preview…",{exact:true})).toHaveCount(0,{timeout:60000});
await page.screenshot({path:path.join(output,"09-punch-preview-loaded.png")});
return {body:await dialog.innerText(),preview:(await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d")).assetDiscovery.groups.find(g=>g.id==="combat").options.find(a=>a.assetId==="12061946559")};
