import { test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockProviderConnections } from './provider-fixture';

test('diagnose dialog contrast during entrance animation', async ({ page }) => {
  await mockProviderConnections(page);
  await page.goto('/#models');
  await page.getByRole('button', { name: 'Add model', exact: true }).click();
  const samples = [];
  await page.getByRole('dialog').evaluate(dialog => {
    (dialog as HTMLElement).style.animation = 'none';
    void (dialog as HTMLElement).offsetWidth;
    (dialog as HTMLElement).style.animation = 'takko-dialog-in 140ms ease-out both';
  });
  for (const time of [60, 140]) {
    await page.getByRole('dialog').evaluate((dialog, time) => {
      for (const animation of dialog.getAnimations()) {
        animation.pause();
        animation.currentTime = time;
      }
    }, time);
    samples.push({ time, opacity: await page.getByRole('dialog').evaluate(el => getComputedStyle(el).opacity), violations: (await new AxeBuilder({ page }).include('dialog').analyze()).violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.failureSummary) })) });
  }
  console.log(JSON.stringify(samples, null, 2));
});
