await page.goto(origin+"/?project=2f4b5384-9fad-48a2-a0a0-52e16ca0735d");
await page.getByRole("button",{name:"Preview & choose assets",exact:true}).click();
const chooser=page.getByRole("dialog",{name:"Choose assets",exact:true});
await chooser.getByRole("button",{name:"Fighting animation",exact:true}).click();
await chooser.locator("article.asset-option").filter({has:page.getByText("R15 Punching Animations",{exact:true})}).getByRole("button",{name:"Preview",exact:true}).click();
await expect(page.getByRole("dialog").last().locator("canvas")).toBeVisible({timeout:30000});
await page.screenshot({path:path.join(output,"10-actual-animation-preview.png")});
return {body:await page.getByRole("dialog").last().innerText(),canvas:await page.locator("canvas").evaluateAll(items=>items.map(c=>({width:c.width,height:c.height}))),ledger:await ledger()};
