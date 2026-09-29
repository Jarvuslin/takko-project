await page.getByRole("dialog").last().getByRole("button",{name:"Back to results",exact:true}).click();
const chooser=page.getByRole("dialog",{name:"Choose assets",exact:true});
await chooser.getByRole("button",{name:"Sound effects",exact:true}).click();
await chooser.locator("article.asset-option").filter({has:page.getByText("Punch Impact 1",{exact:true})}).getByRole("button",{name:"Preview",exact:true}).click();
const dialog=page.getByRole("dialog").last();
await expect(dialog.getByRole("heading",{name:"Punch Impact 1",exact:true})).toBeVisible();
await expect(dialog.getByText("Loading preview…",{exact:true})).toHaveCount(0,{timeout:60000});
await page.screenshot({path:path.join(output,"15-sfx-preview.png")});
return {body:await dialog.innerText(),audioPlayers:await dialog.locator("audio").count(),link:await dialog.getByRole("link",{name:"Listen on Creator Store",exact:true}).getAttribute("href")};
