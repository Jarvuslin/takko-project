await page.getByLabel('Message',{exact:true}).fill('Resolve the mechanics decisions with these defaults: use the normal third-person Roblox camera, keep the target dummy fixed in place, and keep a session-only hit counter with no reset button. Every accepted punch on the dummy increments it once. These settle the three open mechanics questions.');
mark('Resolve the three proposed mechanics questions through a normal targeted chat edit.');
await page.getByRole('button',{name:'Send message and update plan',exact:true}).click();
return {sent:true};
