# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui-polish.spec.ts >> dialog custom input, focus loop, Escape and restored draft work without submission
- Location: tests\browser\ui-polish.spec.ts:35:1

# Error details

```
Error: expect(locator).toHaveValue(expected) failed

Locator: getByRole('dialog').getByLabel('Your answer', { exact: true })
Expected: "A staff with a defensive kick"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toHaveValue" getByRole('dialog').getByLabel('Your answer', { exact: true }) with timeout 5000ms
  - waiting for getByRole('dialog').getByLabel('Your answer', { exact: true })

```

```yaml
- complementary:
  - link "Takko home":
    - /url: /
    - text: takko
  - button "New project"
  - button "Marketplace"
  - navigation "Workspace":
    - button "Models"
    - button "Presets"
- main:
  - text: Your projects
  - combobox "Open project":
    - option "New project"
    - 'option "UI QA: Practice punches and kicks in a training yard. Offline fi" [selected]'
  - region "Game architecture":
    - strong: Game architecture
    - text: clarification · Game architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 0 systems · 0 connections
    - button "Connections"
    - button "Add system"
    - strong: Start with your first game system
    - paragraph: Describe your game to Takko, or add a system using the toolbar.
    - button "Ask Takko"
    - img "System connections"
    - button "Zoom out canvas": −
    - text: 100%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
  - 'heading "UI QA: Practice punches and kicks in a training yard. Offline fi" [level=1]'
  - region "Project conversation":
    - strong: Takko
    - text: clarification
    - button "Latest ↓"
    - button "History"
    - text: $0.0000 / $2.0000
    - article:
      - strong: You
      - text: r1 · 02:44 PM
      - paragraph: "UI QA: Practice punches and kicks in a training yard. Offline fixture."
    - group: Preview an animation clip
    - region "Studio in conversation"
    - group: Edit original brief
    - button "Update concept from request"
    - button "Configure models"
    - region "Your game concept":
      - heading "Practice arena" [level=2]
      - paragraph: Practice punches and kicks on a training dummy. Land a combo and see clear feedback.
      - paragraph: "Look and feel: Bright, stylized training yard."
      - region "Clarifications":
        - strong: Clarifications
        - text: 1/3 answered
        - term: What combat style should the player use?
        - definition: A staff with a defensive kick
        - button "Edit answers"
        - dialog "Help Takko shape the game":
          - heading "Help Takko shape the game" [level=2]
          - paragraph: A few choices to guide the next plan.
          - button "Close dialog"
          - text: 1 of 3
          - progressbar "Question progress"
          - heading "Your choice" [level=3]
          - group "What combat style should the player use?":
            - text: What combat style should the player use?
            - radio "Fists only"
            - text: Fists only
            - radio "Fists + kicks"
            - text: Fists + kicks
            - radio "Weapons"
            - text: Weapons
            - button "Other…" [pressed]
            - text: Your answer
            - textbox "Your answer":
              - /placeholder: Describe what you have in mind
              - text: A staff with a defensive kick
            - button "Choose for me"
          - button "Later"
          - button "Continue"
      - heading "First thing to try" [level=3]
      - paragraph: Land a hit and see the dummy react.
      - group: How you’ll check it after building
      - paragraph: This is a proposed direction. Your full request stays in scope.
      - button "Update my concept" [disabled]
    - paragraph: Your build plan appears after planning.
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - button "Browse Marketplace assets"
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import AxeBuilder from "@axe-core/playwright";
  3   | import { polishFixture } from "./ui-polish-fixture";
  4   | 
  5   | test("focused decisions retain choices, support multiple and skip, and save a compact receipt", async ({page},info) => {
  6   |   const f=await polishFixture(page);
  7   |   await page.goto('/?project='+f.id);
  8   |   await page.getByRole('button',{name:'Answer questions',exact:true}).click();
  9   |   const dialog=page.getByRole('dialog',{name:'Help Takko shape the game'});
  10  |   await expect(dialog.getByRole('button',{name:'Continue',exact:true})).toBeDisabled();
  11  |   await dialog.getByRole('radio',{name:'Fists + kicks',exact:true}).check();
  12  |   await dialog.getByRole('button',{name:'Continue',exact:true}).click();
  13  |   await dialog.getByRole('checkbox',{name:'Impact sounds',exact:true}).check();
  14  |   await dialog.getByRole('checkbox',{name:'Hit effects',exact:true}).check();
  15  |   await dialog.getByRole('button',{name:'Back',exact:true}).click();
  16  |   await expect(dialog.getByRole('radio',{name:'Fists + kicks',exact:true})).toBeChecked();
  17  |   await dialog.getByRole('button',{name:'Continue',exact:true}).click();
  18  |   await expect(dialog.getByRole('checkbox',{name:'Hit effects',exact:true})).toBeChecked();
  19  |   await dialog.screenshot({path:`docs/results/ui-polish/questions-${info.project.name}.png`});
  20  |   expect((await new AxeBuilder({page}).include('.clarification-flow').analyze()).violations).toEqual([]);
  21  |   await dialog.getByRole('button',{name:'Continue',exact:true}).click();
  22  |   await dialog.getByRole('button',{name:'Skip',exact:true}).click();
  23  |   await expect(dialog.getByText('Skipped',{exact:true})).toBeVisible();
  24  |   await dialog.getByRole('button',{name:'Confirm answers',exact:true}).click();
  25  |   expect(f.calls).toEqual([]);
  26  |   await expect(page.getByRole('button',{name:'Edit answers',exact:true})).toBeFocused();
  27  |   await page.reload();
  28  |   await expect(page.locator('.clarifications')).toContainText('Fists + kicks');
  29  |   await page.getByRole('button',{name:'Update my concept',exact:true}).click();
  30  |   await expect(page.locator('.saved-clarifications')).toContainText('Fists + kicks');
  31  |   expect(f.calls).toEqual(['PATCH','concept']);
  32  |   await page.screenshot({path:`docs/results/ui-polish/receipt-${info.project.name}.png`});
  33  | });
  34  | 
  35  | test("dialog custom input, focus loop, Escape and restored draft work without submission", async ({page})=>{
  36  |   const f=await polishFixture(page);
  37  |   await page.goto('/?project='+f.id);
  38  |   await page.getByRole('button',{name:'Answer questions',exact:true}).click();
  39  |   const d=page.getByRole('dialog');
  40  |   await d.getByRole('button',{name:'Other…',exact:true}).click();
  41  |   await d.getByLabel('Your answer',{exact:true}).fill('A staff with a defensive kick');
  42  |   await d.getByRole('button',{name:'Continue',exact:true}).press('Tab');
  43  |   await expect(d.getByRole('button',{name:'Close dialog',exact:true})).toBeFocused();
  44  |   await d.getByRole('button',{name:'Close dialog',exact:true}).press('Shift+Tab');
  45  |   await expect(d.getByRole('button',{name:'Continue',exact:true})).toBeFocused();
  46  |   await page.keyboard.press('Escape');
  47  |   await expect(d).toBeHidden();
  48  |   await expect(page.getByRole('button',{name:'Edit answers',exact:true})).toBeFocused();
  49  |   await page.getByRole('button',{name:'Edit answers',exact:true}).click();
> 50  |   await expect(d.getByLabel('Your answer',{exact:true})).toHaveValue('A staff with a defensive kick');
      |                                                          ^ Error: expect(locator).toHaveValue(expected) failed
  51  |   expect(f.calls).toEqual([]);
  52  | });
  53  | 
  54  | test("one simple decision stays inline and custom answers remain available",async({page})=>{
  55  |   const f=await polishFixture(page,'simple');
  56  |   await page.goto('/?project='+f.id);
  57  |   await expect(page.getByRole('dialog')).toHaveCount(0);
  58  |   await page.getByRole('radio',{name:'R6',exact:true}).check();
  59  |   await expect(page.getByRole('radio',{name:'R6',exact:true})).toBeChecked();
  60  |   await page.getByRole('button',{name:'Other…',exact:true}).click();
  61  |   await page.getByLabel('Your answer',{exact:true}).fill('Let players choose their rig');
  62  |   await page.getByRole('button',{name:'Update my concept',exact:true}).click();
  63  |   expect(f.project().answers.rig).toBe('Let players choose their rig');
  64  | });
  65  | 
  66  | test("panel pointer and keyboard resize respect bounds and survive reload",async({page},info)=>{
  67  |   test.skip(info.project.name==='mobile','The phone uses stacked panels instead of a horizontal divider.');
  68  |   await page.setViewportSize({width:1440,height:900});
  69  |   const f=await polishFixture(page,'build');
  70  |   await page.goto('/?project='+f.id);
  71  |   const separator=page.getByRole('separator',{name:'Resize Takko panel'});
  72  |   const chat=page.getByRole('region',{name:'Project conversation'});
  73  |   await separator.press('Home');
  74  |   await expect(separator).toHaveAttribute('aria-valuenow','320');
  75  |   await separator.press('ArrowLeft');
  76  |   await expect(separator).toHaveAttribute('aria-valuenow','336');
  77  |   const box=(await separator.boundingBox())!;
  78  |   await page.mouse.move(box.x+6,box.y+100); await page.mouse.down();
  79  |   await page.mouse.move(150,box.y+150,{steps:5}); await page.mouse.up();
  80  |   await expect(separator).toHaveAttribute('aria-valuenow','640');
  81  |   expect((await chat.boundingBox())!.width).toBe(640);
  82  |   await page.reload(); await expect(separator).toHaveAttribute('aria-valuenow','640');
  83  |   await page.setViewportSize({width:860,height:640});
  84  |   expect((await page.getByRole('region',{name:'Game architecture'}).boundingBox())!.width).toBeGreaterThanOrEqual(379);
  85  |   expect((await chat.boundingBox())!.width).toBeGreaterThanOrEqual(320);
  86  |   await expect(page.getByRole('textbox',{name:'Message',exact:true})).toBeVisible();
  87  |   await page.screenshot({path:'docs/results/ui-polish/minimum-desktop.png'});
  88  |   await page.setViewportSize({width:1440,height:900});
  89  |   await expect(separator).toHaveAttribute('aria-valuenow','640');
  90  |   await separator.dblclick(); await expect(separator).toHaveAttribute('aria-valuenow','400');
  91  | });
  92  | 
  93  | test("inspector, source, Studio, plan and composer stay usable",async({page},info)=>{
  94  |   const f=await polishFixture(page,'build'); await page.goto('/?project='+f.id);
  95  |   await page.getByRole('button',{name:'Edit Combat',exact:true}).click();
  96  |   const inspector=page.getByRole('complementary',{name:'Architecture inspector'});
  97  |   await expect(inspector.getByLabel('System name',{exact:true})).toBeVisible();
  98  |   await expect(inspector.getByLabel('From',{exact:true})).toHaveCount(0);
  99  |   await inspector.getByRole('button',{name:'Connections',exact:true}).click();
  100 |   await expect(inspector.getByLabel('From',{exact:true})).toBeVisible();
  101 |   await inspector.getByRole('button',{name:'Close inspector'}).click();
  102 |   for(const name of ['Source','Studio','Build']) {
  103 |     await page.getByRole('button',{name:name+' details',exact:true}).click();
  104 |     await expect(page.getByRole('dialog',{name:name+' details'})).toBeVisible();
  105 |     await page.getByRole('button',{name:'Close dialog',exact:true}).click();
  106 |   }
  107 |   await page.locator('.compact-plan > summary').click();
  108 |   await expect(page.locator('.compact-plan')).toContainText('Complete');
  109 |   const composer=page.getByRole('textbox',{name:'Message',exact:true});
  110 |   await composer.fill('Keep the training yard small'); await composer.press('Shift+Enter'); await composer.press('x');
  111 |   await expect(composer).toHaveValue('Keep the training yard small\nx');
  112 |   expect(f.calls).toEqual([]);
  113 |   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  114 |   await page.screenshot({path:`docs/results/ui-polish/workspace-${info.project.name}.png`});
  115 | });
  116 | 
```