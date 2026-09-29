import fs from 'node:fs';
import path from 'node:path';
import { _electron, expect } from '@playwright/test';
import { polishFixture } from '../tests/browser/ui-polish-fixture';
const output=path.resolve(process.argv[2]??'docs/results/surgical-ux/native-short-question');fs.mkdirSync(output,{recursive:true});
const app=await _electron.launch({executablePath:path.resolve('release/takko-surgical-ux-20260922/Takko-win32-x64/Takko.exe'),args:['--user-data-dir='+path.resolve('.forge/surgical-ux-native/short-question')]});
try {
 const page=await app.firstWindow();await page.waitForURL('http://127.0.0.1:*/');const origin=new URL(page.url()).origin;
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].setSize(860,640));
 const f=await polishFixture(page);const q=f.project().concept!.questions[0];
 q.prompt='Which training details should guide this game? '.repeat(12);
 q.options=Array.from({length:20},(_,i)=>`Training detail ${i+1}`);
 await page.goto(origin+'/?project='+f.id);
 const dialog=page.getByRole('dialog',{name:'Question',exact:true});
 await dialog.getByRole('radio',{name:'Training detail 20',exact:true}).check();
 await dialog.getByLabel('Your answer',{exact:true}).fill('Detailed custom response. '.repeat(100));
 const answerLength=(await dialog.getByLabel('Your answer',{exact:true}).inputValue()).length;
 await expect(dialog.getByRole('button',{name:'Next',exact:true})).toBeInViewport();
 await expect(dialog.getByRole('heading',{name:'Question',exact:true})).toBeInViewport();
 await page.screenshot({path:path.join(output,'long-question.png')});
 await dialog.getByRole('button',{name:'Next',exact:true}).click();
 await expect(dialog).toContainText('Which feedback matters most?');
 await page.keyboard.press('Escape');
 await expect(dialog).toBeHidden();
 expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
 fs.writeFileSync(path.join(output,'report.json'),JSON.stringify({passed:true,offlineFixture:true,options:20,customAnswerCharacters:answerLength,headerAndActionsVisible:true,bodyLockReleased:true,paidCalls:0},null,2));
}finally{await app.close();}
