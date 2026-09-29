await page.screenshot({path:path.join(output,"02-project.png")});
return {body:await page.locator("body").innerText(),projects:await api("/projects")};
