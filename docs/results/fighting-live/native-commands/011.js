const dialog=page.getByRole("dialog",{name:"Choose assets",exact:true});
const candidate=dialog.locator("article.asset-option").filter({has:page.getByText("R15 Punching Animations",{exact:true})});
await candidate.getByRole("button",{name:"Preview",exact:true}).click();
await expect(page.getByRole("dialog").last()).toContainText("R15 Punching Animations");
await page.screenshot({path:path.join(output,"08-punch-preview.png")});
return {body:await page.getByRole("dialog").last().innerText()};
