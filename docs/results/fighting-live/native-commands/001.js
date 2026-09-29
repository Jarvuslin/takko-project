await page.screenshot({path:path.join(output,"01-welcome.png")});
return { body: await page.locator("body").innerText(), studios: await api("/marketplace/studios") };
