await page.getByRole("button",{name:"Shape my idea",exact:true}).click();
return {body:await page.locator("body").innerText(),ledger:await ledger()};
