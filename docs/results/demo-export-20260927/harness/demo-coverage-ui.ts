import fs from 'node:fs';import {chromium,expect} from '@playwright/test';import {assetChoiceFixture} from '../tests/browser/asset-choices-fixture';import {workspacePage} from '../tests/workspace-page';import {inspectSnapshot} from '../src/marketplace/inspection';
const out='docs/results/demo-export-20260927';const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});
try{await workspacePage(page,async()=>{
 const f=await assetChoiceFixture(page,'http://127.0.0.1:4319');
 await expect.poll(()=>f.project().assetDiscovery?.groups.length??0).toBeGreaterThan(0);
 const original=JSON.parse(fs.readFileSync('docs/results/opencode-motion-live-20260926/inspection-evidence/14056318312.json','utf8'));
 const limits=inspectSnapshot(original.snapshot).limitations!;
 f.project().assetDiscovery!.groups[0].options[0].inspectionLimitations=limits;
 await page.reload();await page.getByRole('button',{name:'Preview & choose assets'}).click();
 const dialog=page.getByRole('dialog',{name:'Choose assets'});
 await dialog.getByRole('region',{name:'Practice dummy',exact:true}).getByRole('button',{name:'Preview',exact:true}).first().click();
 const preview=page.getByRole('dialog',{name:'Practice dummy option 1',exact:true});const choose=preview.getByRole('button',{name:'Choose this asset',exact:true});
 await expect(choose).toBeDisabled();await expect(preview.getByText(/Inspection coverage limitation:/)).toBeVisible();
 await page.screenshot({path:out+'/coverage-before-ack.png',fullPage:true});
 await preview.getByRole('checkbox',{name:'I acknowledge that uninspected content remains unknown.'}).check();await expect(choose).toBeEnabled();await choose.click();
 await expect(preview).toBeHidden();
 const stored=await page.evaluate(()=>Object.entries(sessionStorage));
 if(!JSON.stringify(stored).includes('acknowledgeInspectionLimitations'))throw Error('Acknowledgment not persisted');
 fs.writeFileSync(out+'/coverage-ui.json',JSON.stringify({at:new Date().toISOString(),passed:true,source:'real run-11 inspection through production scanner, mocked asset preview UI',limitations:limits,checks:['choose disabled before acknowledgment','limitation visible','choose enabled after acknowledgment','acknowledgment persisted'],browserErrors:f.errors},null,2));
});}finally{await browser.close();}
