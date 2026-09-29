await page.getByRole("button",{name:"Preview & choose assets",exact:true}).click();
const chooser=page.getByRole("dialog",{name:"Choose assets",exact:true});
await chooser.getByRole("button",{name:"Fighting animation ✓",exact:true}).click();
await chooser.locator("article.asset-option").filter({has:page.getByText("R15 Punching Animations",{exact:true})}).getByRole("button",{name:"Preview",exact:true}).click();
const controls=page.getByRole("dialog").last().locator(".viewport-controls");
await expect(controls).toBeVisible();
const sizes=await controls.locator("button").evaluateAll(items=>items.map(b=>({width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height,font:parseFloat(getComputedStyle(b).fontSize)})));
for(const size of sizes){expect(size.width).toBeGreaterThanOrEqual(36);expect(size.height).toBeGreaterThanOrEqual(36);expect(size.font).toBeGreaterThanOrEqual(12);}
return sizes;
