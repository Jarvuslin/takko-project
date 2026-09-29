const project=await api("/projects/2f4b5384-9fad-48a2-a0a0-52e16ca0735d");
return {url:page.url(),body:await page.locator("body").innerText(),project:project.assetDiscovery,errors:await ledger()};
