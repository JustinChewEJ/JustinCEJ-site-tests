import { test, expect, Page } from '@playwright/test';

const button = (page: Page) => page.getByRole('button', { name: 'Back to top', exact: true, includeHidden: true });
// #projects is the longest page; a 700px-tall window makes it scrollable.
async function openLongPage(page: Page, size = { width: 1280, height: 700 }) {
  await page.setViewportSize(size);
  await page.goto('./#projects');
  await expect(page.locator('#projects')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)).toBe(true);
}
async function scrollTo(page: Page, top: number) {
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), top);
  await expect.poll(() => page.evaluate(() => Math.round(window.scrollY))).toBe(top);
}

test('SPEC.md:17 — a back-to-top button is available while scrolling a long page', async ({ page }) => {
  await openLongPage(page);
  await scrollTo(page, 400);
  await expect(button(page)).toBeVisible();
});

test('SPEC.md:18 — hidden on a page no taller than the window', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto('./#contact');
  await expect(page.locator('#contact')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(true);
  await expect(button(page)).toHaveCount(1);
  await expect(button(page)).toBeHidden();
});

test('SPEC.md:18 — on a long page, hidden below 200px of scroll and visible from 200px', async ({ page }) => {
  await openLongPage(page);
  await expect(button(page)).toBeHidden();
  await scrollTo(page, 199);
  await expect(button(page)).toBeHidden();
  await scrollTo(page, 200);
  await expect(button(page)).toBeVisible();
});

test('SPEC.md:19 — clicking returns the current page to the top, keeps it open and hides the button', async ({ page }) => {
  await openLongPage(page);
  await scrollTo(page, 400);
  await button(page).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  expect(new URL(page.url()).hash).toBe('#projects');
  await expect(page.locator('#projects')).toBeVisible();
  await expect(button(page)).toBeHidden();
});

test('SPEC.md:20 — accessible Back to top name, keyboard activation and visible focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openLongPage(page);
  await scrollTo(page, 400);
  await expect(button(page)).toBeVisible();
  for (let i = 0; i < 60 && !(await button(page).evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(button(page)).toBeFocused();
  expect(await button(page).evaluate(el => { const s = getComputedStyle(el); return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && s.outlineColor !== 'transparent') || s.boxShadow !== 'none'; })).toBe(true);
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(button(page)).toBeHidden();
});

test('SPEC.md:21 — small round icon button, no gradients or horizontal overflow at 375px', async ({ page }) => {
  await openLongPage(page, { width: 375, height: 812 });
  await scrollTo(page, 400);
  await expect(button(page)).toBeVisible();
  const appearance = await button(page).evaluate(el => {
    const styles = [getComputedStyle(el), getComputedStyle(el, '::before'), getComputedStyle(el, '::after')];
    const rect = el.getBoundingClientRect();
    return {
      gradients: styles.some(s => /gradient\(/i.test(s.backgroundImage)),
      icon: el.querySelector('svg') !== null && el.textContent!.trim() === '',
      round: parseFloat(styles[0].borderTopLeftRadius) >= rect.width / 2 - 1,
      width: rect.width, height: rect.height,
      left: rect.left, right: rect.right, viewport: window.innerWidth,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  expect(appearance.gradients).toBe(false);
  expect(appearance.icon).toBe(true);
  expect(appearance.round).toBe(true);
  expect(appearance.width).toBeLessThanOrEqual(64);
  expect(Math.abs(appearance.width - appearance.height)).toBeLessThanOrEqual(1);
  expect(appearance.left).toBeGreaterThanOrEqual(0);
  expect(appearance.right).toBeLessThanOrEqual(appearance.viewport);
  expect(appearance.overflow).toBe(false);
});
