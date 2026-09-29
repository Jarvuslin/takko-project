await expect(page.getByRole('button',{name:'Preview & choose assets',exact:true})).toBeEnabled({timeout:90000});
mark('Agent recommendations remain empty. Open optional manual selection to test how far the rest of the workflow can proceed. This is a disclosed fallback.');
await page.getByRole('button',{name:'Preview & choose assets',exact:true}).click();
await page.screenshot({path:path.join(output,'06-asset-choices.png'),fullPage:true});
return {text:await page.getByRole('dialog').innerText()};
