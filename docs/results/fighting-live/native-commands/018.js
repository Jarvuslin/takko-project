await page.screenshot({path:path.join(output,"13-current-ui.png")});
return {body:await page.locator("body").innerText(),url:page.url(),dialogs:await page.getByRole("dialog").count(),storage:await page.evaluate(()=>Object.fromEntries(Object.entries(sessionStorage).filter(([k])=>k.startsWith("takko-asset-choices"))))};
