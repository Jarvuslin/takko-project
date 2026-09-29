await page.screenshot({path:path.join(output,'09-selection-result.png'),fullPage:true});
return {text:await page.locator('body').innerText(),selected:await page.locator('article.selected').allTextContents()};
