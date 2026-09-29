mark('Correct the automation locator to the actual Send message and update plan button. Previous click timed out before any model call.');
await page.getByRole('button',{name:'Send message and update plan',exact:true}).click();
return {text:await page.locator('body').innerText()};
