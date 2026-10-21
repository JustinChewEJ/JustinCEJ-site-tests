import { test, expect, Page } from '@playwright/test';

const repoEndpoint = /https:\/\/api\.github\.com\/users\/[^/]+\/repos(?:\?|$)/;
async function mockRepos(page: Page, body: unknown, status = 200) {
  await page.route(repoEndpoint, route => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }));
}
const toggle = (page: Page) => page.locator('nav button');

const pageIds = ['hero', 'about', 'experience', 'skills', 'projects', 'repos', 'contact'];
async function expectOnlyVisible(page: Page, id: string) {
  for (const other of pageIds) {
    if (other === id) await expect(page.locator(`#${other}`)).toBeVisible();
    else await expect(page.locator(`#${other}`)).toBeHidden();
  }
}

test('SPEC.md:4 — all seven page ids exist', async ({ page }) => {
  await page.goto('./');
  for (const id of pageIds) await expect(page.locator(`#${id}`)).toHaveCount(1);
});

test('SPEC.md:4 — no hash shows only #hero; each hash shows only its page', async ({ page }) => {
  await page.goto('./');
  await expectOnlyVisible(page, 'hero');
  for (const id of pageIds) {
    await page.goto(`./#${id}`);
    await expectOnlyVisible(page, id);
  }
});

test('SPEC.md:4 — browser back and forward move between pages', async ({ page }) => {
  await page.goto('./');
  await page.goto('./#projects');
  await page.goto('./#contact');
  await page.goBack();
  await expectOnlyVisible(page, 'projects');
  await page.goBack();
  await expectOnlyVisible(page, 'hero');
  await page.goForward();
  await expectOnlyVisible(page, 'projects');
});

test('SPEC.md:5 — no horizontal scroll at 375px on any page', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const id of pageIds) {
    await page.goto(`./#${id}`);
    await expect(page.locator(`#${id}`)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `#${id}`).toBe(true);
  }
});

test('SPEC.md:6 — public repository card includes all required fields', async ({ page }) => {
  await mockRepos(page, [{ id: 123, name: 'checker-repository', description: 'Independent fixture description', language: 'TypeScript', stargazers_count: 42, html_url: 'https://github.com/JustinChewEJ/checker-repository', private: false, fork: false, updated_at: '2026-10-06T00:00:00Z' }]);
  await page.goto('./#repos');
  const repos = page.locator('#repos');
  await expect(repos.getByText('checker-repository', { exact: true })).toBeVisible();
  await expect(repos.getByText('Independent fixture description', { exact: true })).toBeVisible();
  await expect(repos.getByText('TypeScript', { exact: true })).toBeVisible();
  await expect(repos.getByText(/\b42\b/)).toBeVisible();
  await expect(repos.locator('a[href="https://github.com/JustinChewEJ/checker-repository"]')).toBeVisible();
});

test('SPEC.md:6 — empty repository response shows a plain message', async ({ page }) => {
  await mockRepos(page, []);
  await page.goto('./#repos');
  await expect(page.locator('#repos')).toContainText(/no (?:public )?repositories/i);
});

test('SPEC.md:6 — failed repository request shows a plain message', async ({ page }) => {
  await mockRepos(page, { message: 'Fixture failure' }, 503);
  await page.goto('./#repos');
  await expect(page.locator('#repos')).toContainText(/(?:unable|couldn.t|failed|error|unavailable)/i);
});

test('SPEC.md:7 — hero and contact each provide email, GitHub and LinkedIn links', async ({ page }) => {
  for (const section of ['hero', 'contact']) {
    await page.goto(section === 'hero' ? './' : `./#${section}`);
    for (const prefix of ['mailto:', 'https://github.com/', 'https://www.linkedin.com/']) {
      await expect(page.locator(`#${section} a[href^="${prefix}"]`).first()).toBeVisible();
    }
  }
});

test('SPEC.md:8 — every GitHub and LinkedIn link opens a new tab', async ({ page }) => {
  await mockRepos(page, [{ name: 'fixture', description: 'Fixture', language: 'HTML', stargazers_count: 1, html_url: 'https://github.com/JustinChewEJ/fixture', private: false, fork: false }]);
  await page.goto('./#repos');
  await expect(page.locator('#repos a[href="https://github.com/JustinChewEJ/fixture"]')).toBeVisible();
  const links = page.locator('a[href*="github.com"], a[href*="linkedin.com"]');
  expect(await links.count()).toBeGreaterThan(0);
  for (const link of await links.all()) await expect(link).toHaveAttribute('target', '_blank');
});

test('SPEC.md:9 — rendered design uses no gradients', async ({ page }) => {
  await page.goto('./');
  // Computed styles are available for hidden pages too, so one load covers every page.
  const gradients = await page.locator('*').evaluateAll(elements => elements.flatMap(el => [null, '::before', '::after'].filter(pseudo => /gradient\(/i.test(getComputedStyle(el, pseudo).backgroundImage)).map(pseudo => `${el.tagName}#${el.id}${pseudo ?? ''}`)));
  expect(gradients).toEqual([]);
});

test('SPEC.md:9 — arrow icons (manual definition required)', async () => {
  test.skip(true, 'SPEC does not define arrow icons or permitted icon representations; see CHECKER-NOTES.md.');
});

test('SPEC.md:12 — navigation button toggles body.dark and changes light/dark colours', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('body')).not.toHaveClass(/\bdark\b/);
  const colours = () => page.locator('body').evaluate(el => { const style = getComputedStyle(el); return [style.color, style.backgroundColor]; });
  const light = await colours();
  await toggle(page).click();
  await expect(page.locator('body')).toHaveClass(/\bdark\b/);
  await expect.poll(colours).not.toEqual(light);
  const dark = await colours();
  expect(dark[0]).not.toBe(dark[1]);
  await toggle(page).click();
  await expect(page.locator('body')).not.toHaveClass(/\bdark\b/);
  await expect.poll(colours).toEqual(light);
});

test('SPEC.md:13 — selected mode survives same-tab reload; fresh session is light', async ({ page, browser }) => {
  await page.goto('./');
  await toggle(page).click();
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/\bdark\b/);
  const fresh = await browser.newContext();
  try {
    const newPage = await fresh.newPage();
    await newPage.goto(process.env.BASE_URL!);
    await expect(newPage.locator('body')).not.toHaveClass(/\bdark\b/);
  } finally { await fresh.close(); }
});

test('SPEC.md:14 — keyboard toggle has visible focus and aria-pressed state', async ({ page }) => {
  await page.goto('./');
  const button = toggle(page);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  for (let i = 0; i < 20 && !(await button.evaluate(el => el === document.activeElement)); i++) await page.keyboard.press('Tab');
  await expect(button).toBeFocused();
  expect(await button.evaluate(el => { const s = getComputedStyle(el); return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 && s.outlineColor !== 'transparent') || s.boxShadow !== 'none'; })).toBe(true);
  await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('body')).toHaveClass(/\bdark\b/);
  await page.keyboard.press('Space');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(page.locator('body')).not.toHaveClass(/\bdark\b/);
});

