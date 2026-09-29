# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: surgical-ux.spec.ts >> paged browsing preserves scroll, chooses from preview and releases its renderer in a short window
- Location: tests\browser\surgical-ux.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Preview & choose assets', exact: true })

```

# Test source

```ts
  1  | import { expect, type Page } from '@playwright/test';
  2  | import AxeBuilder from '@axe-core/playwright';
  3  | import { assetChoiceFixture } from './asset-choices-fixture';
  4  | import { polishFixture } from './ui-polish-fixture';
  5  | 
  6  | export async function focusFlow(page:Page,origin='') {
  7  |  await page.goto(origin+'/');
  8  |  const input=page.locator('textarea').first(); await input.click();
  9  |  expect(await input.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('none');
  10 |  await input.press('Shift+Tab'); await page.keyboard.press('Tab');
  11 |  await expect(input).toBeFocused();
  12 |  expect(await input.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');
  13 |  expect(await input.evaluate(e=>getComputedStyle(e).outlineColor)).toBe('rgb(156, 187, 201)');
  14 | }
  15 | export async function questionFlow(page:Page,origin='',screenshot?:string) {
  16 |  const f=await polishFixture(page);await page.goto(origin+'/?project='+f.id);
  17 |  const q=page.getByRole('dialog',{name:'Question',exact:true});
  18 |  await expect(q).toBeVisible();
  19 |  await q.getByRole('radio',{name:'Fists + kicks',exact:true}).check();
  20 |  await q.getByRole('button',{name:'Next',exact:true}).click();
  21 |  await q.getByRole('checkbox',{name:'Hit effects',exact:true}).check();
  22 |  await q.getByRole('button',{name:'Back',exact:true}).click();
  23 |  await expect(q.getByRole('radio',{name:'Fists + kicks',exact:true})).toBeChecked();
  24 |  await q.getByLabel('Your answer',{exact:true}).fill('Fists + kicks, with a block and dodge');
  25 |  await q.getByRole('button',{name:'Next',exact:true}).click();
  26 |  await expect(q.getByRole('checkbox',{name:'Hit effects',exact:true})).toBeChecked();
  27 |  if(screenshot)await page.screenshot({path:screenshot});
  28 |  expect((await new AxeBuilder({page}).include('.clarification-flow').analyze()).violations).toEqual([]);
  29 |  await q.getByRole('button',{name:'Next',exact:true}).click();
  30 |  await q.getByRole('button',{name:'Skip',exact:true}).click();
  31 |  await expect(q).toBeHidden();
  32 |  await expect(page.locator('.clarifications')).toContainText('Fists + kicks, with a block and dodge');
  33 |  await expect(page.getByRole('button',{name:'Edit answers',exact:true})).toBeFocused();
  34 |  expect(f.calls).toEqual([]);
  35 | }
  36 | export async function browseFlow(page:Page,origin='',screenshot?:string) {
  37 |  await page.route('**/api/status',r=>r.fulfill({json:{studios:[],concepts:true,assetChoices:true,studioConnectionGate:false}}));
  38 |  const f=await assetChoiceFixture(page,origin);
> 39 |  await page.getByRole('button',{name:'Preview & choose assets',exact:true}).click();
     |                                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
  40 |  const browser=page.getByRole('dialog',{name:'Choose assets',exact:true});
  41 |  await expect(browser.getByRole('article')).toHaveCount(30);
  42 |  await expect(browser.getByRole('article').first()).toContainText('92% · 100 votes');
  43 |  await expect(page.locator('canvas')).toHaveCount(0);
  44 |  await browser.getByRole('button',{name:'Load more results',exact:true}).click();
  45 |  await expect(browser.getByRole('article')).toHaveCount(60);
  46 |  await browser.getByRole('article').nth(42).scrollIntoViewIfNeeded();
  47 |  const body=browser.locator(':scope > .dialog-body');
  48 |  const position=await body.evaluate(e=>e.scrollTop);
  49 |  const calls=f.calls.length;
  50 |  await browser.getByRole('article').nth(42).getByRole('button',{name:'Preview',exact:true}).click();
  51 |  let preview=page.getByRole('dialog',{name:'Practice dummy option 43',exact:true});
  52 |  await expect(preview.locator('canvas')).toHaveCount(1);
  53 |  await preview.getByRole('button',{name:'Back to results',exact:true}).click();
  54 |  await expect(page.locator('canvas')).toHaveCount(0);
  55 |  expect(await body.evaluate(e=>e.scrollTop)).toBe(position);
  56 |  expect(f.calls.slice(calls)).toEqual(['asset-preview']);
  57 |  await browser.getByRole('article').nth(43).getByRole('button',{name:'Preview',exact:true}).click();
  58 |  preview=page.getByRole('dialog',{name:'Practice dummy option 44',exact:true});
  59 |  await expect(preview.locator('canvas')).toHaveCount(1);
  60 |  await preview.getByRole('button',{name:'Reload preview',exact:true}).scrollIntoViewIfNeeded();
  61 |  await expect(preview.getByRole('button',{name:'Reload preview',exact:true})).toBeInViewport();
  62 |  await expect(preview.getByRole('button',{name:'Choose this asset',exact:true})).toBeInViewport();
  63 |  if(screenshot)await page.screenshot({path:screenshot});
  64 |  expect((await new AxeBuilder({page}).include('.asset-preview-dialog').analyze()).violations).toEqual([]);
  65 |  await preview.getByRole('button',{name:'Choose this asset',exact:true}).click();
  66 |  await expect(browser.getByRole('article').nth(43).getByRole('button',{name:'Selected ✓',exact:true})).toBeVisible();
  67 |  expect(f.project().assetDiscovery?.approved).not.toBe(true);
  68 |  await expect(browser.getByRole('article')).toHaveCount(60);
  69 |  await expect(browser.getByLabel('Search for Practice dummy')).toHaveValue('training dummy');
  70 |  await browser.getByRole('article').nth(43).getByRole('button',{name:'Preview',exact:true}).click();
  71 |  await preview.getByRole('button',{name:'Remove selection',exact:true}).click();
  72 |  await expect(preview.getByRole('button',{name:'Choose this asset',exact:true})).toBeEnabled();
  73 |  await page.keyboard.press('Escape');
  74 |  await expect(preview).toBeHidden();
  75 |  await expect(browser).toBeVisible();
  76 |  await expect(page.locator('canvas')).toHaveCount(0);
  77 |  await browser.getByLabel('Search for Practice dummy').fill('wooden dummy');
  78 |  await browser.getByRole('button',{name:'Search again',exact:true}).click();
  79 |  await expect(browser.getByRole('article')).toHaveCount(30);
  80 |  expect(f.project().assetDiscovery?.groups[0].query).toBe('wooden dummy');
  81 |  expect(f.errors).toEqual([]);
  82 |  await page.keyboard.press('Escape');
  83 | }
  84 | 
```