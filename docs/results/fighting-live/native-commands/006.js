await page.getByRole("button", {name:"Preview & choose assets",exact:true}).click();
await expect(page.getByRole("dialog",{name:"Choose assets",exact:true})).toBeVisible();
await page.screenshot({path:path.join(output,"04-asset-chooser.png")});
return {body:await page.getByRole("dialog",{name:"Choose assets",exact:true}).innerText()};
