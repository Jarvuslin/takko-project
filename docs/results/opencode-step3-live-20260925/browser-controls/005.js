const text='Keep this minimal: the default player avatar, selected stationary dummy, one punch action with its animation, successful-hit sound, and hit counter. Use a plain floor and the default Roblox camera. Remove the reset-counter control, dummy flinch, arena decoration, movement restrictions, and custom clothing. The selected assets provide the appearance. Keep the counter for this play session. Preserve the selected assets and keep all three proposal sections consistent with these limits.';
fs.writeFileSync(path.join(output,'scope-edit.txt'),text);
const message=page.getByRole('textbox',{name:'Message',exact:true});
await message.fill(text);
mark('One authorized surgical proposal edit removes model-invented extra scope while retaining the four requested elements and selections.');
await message.press('Enter');
await page.waitForTimeout(700);
return {text:await page.locator('body').innerText()};
