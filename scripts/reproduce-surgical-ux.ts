import fs from 'node:fs';
import path from 'node:path';
import { _electron } from '@playwright/test';
import { assetChoiceFixture } from '../tests/browser/asset-choices-fixture';
import { polishFixture } from '../tests/browser/ui-polish-fixture';
const output = path.resolve('docs/results/surgical-ux/before');
fs.mkdirSync(output, {recursive:true});
const app = await _electron.launch({executablePath:path.resolve('release/takko-asset-choices-20260921-ready/Takko-win32-x64/Takko.exe'),args:['--user-data-dir='+path.resolve('.forge/surgical-ux-before')]});
const report:any = {};
try {
 const page = await app.firstWindow(); await page.waitForURL('http://127.0.0.1:*/');
 const origin = new URL(page.url()).origin;
 report.identity = await app.evaluate(({app})=>({exe:app.getPath('exe'),packaged:app.isPackaged}));
 const composer=page.locator('textarea').first(); await composer.click();
 report.mouseFocus=await composer.evaluate(e=>({visible:e.matches(':focus-visible'),outline:getComputedStyle(e).outline}));
 await page.screenshot({path:path.join(output,'click-focus.png')});
 await page.route('**/api/status',async r=>{const response=await r.fetch();await r.fulfill({json:{...await response.json(),studioConnectionGate:false}})});
 await assetChoiceFixture(page, origin);
 await page.getByRole('button',{name:'Preview & choose assets',exact:true}).click();
 const dialog=page.getByRole('dialog',{name:'Choose assets'});
 await dialog.getByRole('button',{name:'Preview',exact:true}).first().click();
 await page.waitForTimeout(700);
 report.preview=await dialog.evaluate(e=>({dialog:{height:e.clientHeight,scrollHeight:e.scrollHeight,overflow:getComputedStyle(e).overflow},body:Array.from(e.querySelectorAll('.asset-choices-workspace')).map(b=>({height:b.clientHeight,scrollHeight:b.scrollHeight,overflow:getComputedStyle(b).overflow,minHeight:getComputedStyle(b).minHeight})),chooseButton:Array.from(e.querySelectorAll('button')).some(b=>b.textContent?.includes('Choose this asset'))}));
 await page.screenshot({path:path.join(output,'preview-clipped.png')});
 const q=await polishFixture(page); await page.goto(origin+'/?project='+q.id);
 report.questionAutoOpen=await page.getByRole('dialog').count();
 await page.getByRole('button',{name:'Answer questions',exact:true}).click();
 await page.screenshot({path:path.join(output,'question.png')});
}finally{fs.writeFileSync(path.join(output,'reproduction.json'),JSON.stringify(report,null,2));await app.close();}
