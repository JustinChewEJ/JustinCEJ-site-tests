import { test, expect, Page } from '@playwright/test';

const button = (page: Page) => page.getByRole('button', { name: 'Back to top', exact: true, includeHidden: true });
async function scrollPastHero(page: Page) {
  await page.locator('#hero').evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().bottom + 1, behavior: 'instant' }));
  await expect.poll(() => page.locator('#hero').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
}

test('SPEC.md:17 — a back-to-top button is available while scrolling independently of the footer link', async ({ page }) => {
  await page.goto('./');
  await scrollPastHero(page);
  await expect(button(page)).toBeVisible();
});

test('SPEC.md:18 — visibility follows the hero bottom edge, not its top edge', async ({ page }) => {
  await page.goto('./');
  await expect(button(page)).toHaveCount(1);
  await expect(button(page)).toBeHidden();
  await page.locator('#hero').evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().bottom - 20, behavior: 'instant' }));
  await expect.poll(() => page.locator('#hero').evaluate(el => el.getBoundingClientRect().bottom)).toBeGreaterThan(0);
  await expect(button(page)).toBeHidden();
  await page.locator('#hero').evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().bottom, behavior: 'instant' }));
  await expect.poll(() => page.locator('#hero').evaluate(el => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(0);
  await expect(button(page)).toBeVisible();
});

test('SPEC.md:19 — clicking returns to page top and hides the button', async ({ page }) => {
  await page.goto('./');
  await scrollPastHero(page);
  await expect(button(page)).toBeVisible();
  await button(page).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(button(page)).toBeHidden();
});

test('SPEC.md:20 — accessible Back to top name, keyboard activation and visible focus', async ({ page }) => {
  await page.goto('./');
  await scrollPastHero(page);
  await expect(button(page)).toHaveCount(1);
  await expect(button(page)).toBeVisible();
  for (let i = 0; i < 60 && !(await button(page).evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(button(page)).toBeFocused();
  expect(await button(page).evaluate(el => { const s = getComputedStyle(el); return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && s.outlineColor !== 'transparent') || s.boxShadow !== 'none'; })).toBe(true);
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(button(page)).toBeHidden();
});

test('SPEC.md:21 — responsive button has no gradients, arrows or horizontal overflow at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('./');
  await scrollPastHero(page);
  await expect(button(page)).toBeVisible();
  const appearance = await button(page).evaluate(el => {
    const styles = [getComputedStyle(el), getComputedStyle(el, '::before'), getComputedStyle(el, '::after')];
    const rect = el.getBoundingClientRect();
    return { gradients: styles.some(s => /gradient\(/i.test(s.backgroundImage)), arrows: /[\u2190-\u21ff\u27f0-\u27ff\u2900-\u297f\u2b00-\u2b11]/u.test(el.textContent! + styles.map(s => s.content).join('')), left: rect.left, right: rect.right, width: window.innerWidth, overflow: document.documentElement.scrollWidth > window.innerWidth };
  });
  expect(appearance.gradients).toBe(false);
  expect(appearance.arrows).toBe(false);
  expect(appearance.left).toBeGreaterThanOrEqual(0);
  expect(appearance.right).toBeLessThanOrEqual(appearance.width);
  expect(appearance.overflow).toBe(false);
});
