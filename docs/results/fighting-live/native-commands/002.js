const current = await api("/models");
await api("/models", "PUT", {profiles:current.profiles.map(({hasKey,...model})=>model),routes:current.routes,budgetMicros:4400000,generationBudgetMicros:4400000,repairLimit:current.repairLimit,presets:current.presets,activePresetId:current.activePresetId});
await page.reload();
await page.getByRole("textbox",{name:"Game idea",exact:true}).fill("A simple fist-fighting practice game. Find suitable fist-fighting animations from the Roblox Creator Store, a training dummy asset, and VFX and SFX for attacks and impacts. Let me preview and select the Marketplace assets before building. Show a clear on-screen hit counter that increases by exactly one every time a punch hits the dummy, and never on a miss. Use a clean readable game UI. No weapons, kicks, PvP or AI opponents. Use sensible defaults for other details.");
await page.getByRole("button",{name:"Create project",exact:true}).click();
await page.waitForURL(/project=/);
return {url:page.url(),body:await page.locator("body").innerText()};
