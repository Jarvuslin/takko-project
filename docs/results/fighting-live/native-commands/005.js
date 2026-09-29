await page.getByText("More details",{exact:true}).count().then(async n=>{if(n) await page.getByText("More details",{exact:true}).click();});
await page.screenshot({path:path.join(output,"03-live-concept-failure.png")});
return {body:await page.locator("body").innerText(),project:await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d")};
