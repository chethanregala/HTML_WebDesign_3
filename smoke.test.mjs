/* Temporary smoke test for TĀVA demo 03 (not part of the app build). */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:5183';
const TOTAL = 36; // dishes in src/data/menu.ts
const SHOTS = 'C:/Users/Regala Chethan/AppData/Local/Temp/opencode/demo03-shots';
mkdirSync(SHOTS, { recursive: true });

const results = [];
const consoleErrors = [];

function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(`[console] ${msg.text()}`);
});
page.on('pageerror', (err) => consoleErrors.push(`[pageerror] ${err.message}`));

const noOverflow = async (label) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(`No horizontal overflow — ${label}`, overflow <= 1, `overflow=${overflow}px`);
};

/* ------------------------------ HOME ----------------------------- */
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
check('Home H1 present', (await page.locator('h1').first().innerText()).includes('point of view'));
check('Ghost wordmark rendered', await page.locator('.hero__ghost').isVisible());
check('Composition rendered', await page.locator('.composition').isVisible());
await noOverflow('home desktop');
await page.screenshot({ path: `${SHOTS}/01-home-hero.png` });

await page.evaluate(() => document.getElementById('experience').scrollIntoView());
await page.waitForTimeout(900);
await page.screenshot({ path: `${SHOTS}/02-home-experience.png` });

await page.evaluate(() => document.getElementById('menu-preview').scrollIntoView());
await page.waitForTimeout(900);
await page.screenshot({ path: `${SHOTS}/03-home-menu-preview.png` });

await page.evaluate(() => document.getElementById('story').scrollIntoView());
await page.waitForTimeout(900);
await page.screenshot({ path: `${SHOTS}/04-home-story.png` });

await page.evaluate(() => document.getElementById('private-dining').scrollIntoView());
await page.waitForTimeout(900);
await page.screenshot({ path: `${SHOTS}/05-home-private.png` });

await page.evaluate(() => document.getElementById('visit').scrollIntoView());
await page.waitForTimeout(900);
await page.screenshot({ path: `${SHOTS}/06-home-visit.png` });

await page.evaluate(() => document.querySelector('.site-footer').scrollIntoView());
await page.waitForTimeout(700);
await page.screenshot({ path: `${SHOTS}/07-footer.png` });

/* --------------------------- MENU PAGE --------------------------- */
await page.click('nav[aria-label="Primary navigation"] a[href="/menu"]');
await page.waitForTimeout(800);
check('Menu route heading', (await page.locator('h2').first().innerText()).includes('Find your next favourite'));
const totalCards = await page.locator('.menu-card').count();
check('All dishes listed', totalCards === TOTAL, `cards=${totalCards}`);
await noOverflow('menu desktop');
await page.screenshot({ path: `${SHOTS}/08-menu-all.png`, fullPage: false });

/* search */
await page.fill('#menu-search-input', 'Paneer');
await page.waitForTimeout(350);
let count = await page.locator('.menu-card').count();
check('Search "Paneer" returns results', count > 0 && count < TOTAL, `cards=${count}`);
const paneerNames = await page.locator('.menu-card__name').allInnerTexts();
check('Search matches dish names', paneerNames.some((n) => n.toLowerCase().includes('paneer')), paneerNames.join(' | '));

await page.fill('#menu-search-input', 'Vegan');
await page.waitForTimeout(350);
const veganTags = await page.locator('.menu-card .tag--vegan').count();
count = await page.locator('.menu-card').count();
check('Search "Vegan" filters to vegan dishes', count > 0 && veganTags === count, `cards=${count} veganTags=${veganTags}`);

await page.fill('#menu-search-input', 'Something light');
await page.waitForTimeout(350);
check('Intent search "Something light" works', (await page.locator('.menu-card').count()) > 0, `cards=${await page.locator('.menu-card').count()}`);

await page.fill('#menu-search-input', 'Dessert');
await page.waitForTimeout(350);
const dessertCats = await page.locator('.menu-card__category').allInnerTexts();
check(
  'Search "Dessert" finds desserts',
  dessertCats.length > 0 && dessertCats.every((c) => c.toLowerCase() === 'desserts'),
  dessertCats.join(', '),
);

await page.fill('#menu-search-input', 'Spicy');
await page.waitForTimeout(350);
check('Search "Spicy" returns results', (await page.locator('.menu-card').count()) > 0);

await page.click('.menu-search__clear');
await page.waitForTimeout(300);
check('Clear search restores list', (await page.locator('.menu-card').count()) === TOTAL);

/* combined filters */
await page.click('.filters .filter-group:has-text("Dietary") button:has-text("Vegan")');
await page.waitForTimeout(300);
const veganOnly = await page.locator('.menu-card .tag--vegan').count();
const cardCountVegan = await page.locator('.menu-card').count();
check('Dietary filter (Vegan) works', cardCountVegan > 0 && veganOnly === cardCountVegan, `cards=${cardCountVegan}`);

await page.click('.filters .filter-group:has-text("Flavour profile") button:has-text("Fresh")');
await page.waitForTimeout(300);
const combined = await page.locator('.menu-card').count();
check('Combined dietary + flavour filter narrows results', combined > 0 && combined <= cardCountVegan, `cards=${combined}`);

/* price filter */
await page.locator('.filters__head .text-btn').click();
await page.waitForTimeout(300);
await page.locator('#price-max').evaluate((el) => {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  setter?.call(el, '400');
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForTimeout(400);
const prices = await page.locator('.menu-card__price').allInnerTexts();
const numericPrices = prices.map((p) => Number(p.replace(/[^\d]/g, '')));
check('Max price filter applied', numericPrices.every((p) => p <= 400), `max=${Math.max(...numericPrices)}`);

/* sorting */
await page.locator('.filters__head .text-btn').click();
await page.waitForTimeout(250);
await page.selectOption('#menu-sort', 'price-asc');
await page.waitForTimeout(350);
let sortPrices = (await page.locator('.menu-card__price').allInnerTexts()).map((p) => Number(p.replace(/[^\d]/g, '')));
check('Sort price low→high', sortPrices.every((p, i) => i === 0 || sortPrices[i - 1] <= p), sortPrices.slice(0, 5).join(','));
await page.selectOption('#menu-sort', 'price-desc');
await page.waitForTimeout(350);
sortPrices = (await page.locator('.menu-card__price').allInnerTexts()).map((p) => Number(p.replace(/[^\d]/g, '')));
check('Sort price high→low', sortPrices.every((p, i) => i === 0 || sortPrices[i - 1] >= p), sortPrices.slice(0, 5).join(','));
await page.selectOption('#menu-sort', 'alpha');
await page.waitForTimeout(350);
const alphaNames = await page.locator('.menu-card__name').allInnerTexts();
check('Sort alphabetical', alphaNames.every((n, i) => i === 0 || alphaNames[i - 1].localeCompare(n) <= 0), alphaNames.slice(0, 3).join(','));
await page.selectOption('#menu-sort', 'recommended');
await page.waitForTimeout(300);

/* empty state */
await page.fill('#menu-search-input', 'zzzznotadish');
await page.waitForTimeout(350);
check('Empty state shown', await page.locator('.menu-empty').isVisible());
await page.screenshot({ path: `${SHOTS}/09-menu-empty.png` });
await page.click('.menu-empty button:has-text("Clear all filters")');
await page.waitForTimeout(300);
check('Clear filters from empty state', (await page.locator('.menu-card').count()) === TOTAL);

/* ------------------------- DISH DETAIL DRAWER -------------------- */
await page.locator('.menu-card__trigger').first().click();
await page.waitForTimeout(500);
check('Dish drawer opens', await page.locator('.dish-drawer').isVisible());
check('Drawer shows ingredients', (await page.locator('.ingredient-list li').count()) > 0);
check('Drawer shows allergen disclaimer', (await page.locator('.dish-drawer__disclaimer').count()) > 0);
await page.screenshot({ path: `${SHOTS}/10-dish-drawer.png` });

await page.keyboard.press('Escape');
await page.waitForTimeout(400);
check('Escape closes dish drawer', (await page.locator('.dish-drawer').count()) === 0);

/* open dish with customizations, add to cart */
const paneerCard = page.locator('.menu-card', { hasText: 'Paneer Makhani' });
await paneerCard.locator('.menu-card__trigger').click();
await page.waitForTimeout(450);
const optionCount = await page.locator('.option').count();
check('Customisation options rendered', optionCount > 0, `options=${optionCount}`);
/* choose a paid add-on if present */
const sideOption = page.locator('.option', { hasText: 'Kachumber salad' });
if (await sideOption.count()) await sideOption.first().click();
await page.locator('.stepper__btn[aria-label^="Increase"]').last().click();
await page.waitForTimeout(200);
await page.click('.dish-drawer__submit');
await page.waitForTimeout(600);
check('Add to cart shows confirmation', await page.locator('.cart-toast').isVisible());
const navCount = await page.locator('.cart-trigger__count').innerText();
check('Nav cart count = 2', navCount === '2', `count=${navCount}`);
await page.screenshot({ path: `${SHOTS}/11-cart-toast.png` });

/* ---------------------------- CART ------------------------------- */
await page.click('.cart-trigger');
await page.waitForTimeout(500);
check('Cart drawer opens', await page.locator('.cart-drawer').isVisible());
const subtotal1 = await page.locator('.cart-summary__value').innerText();
check('Subtotal displayed', subtotal1.startsWith('₹'), subtotal1);
await page.screenshot({ path: `${SHOTS}/12-cart-drawer.png` });

await page.locator('.cart-line .stepper__btn[aria-label^="Increase"]').click();
await page.waitForTimeout(300);
const navCount2 = await page.locator('.cart-trigger__count').innerText();
check('Quantity increase updates nav count', navCount2 === '3', `count=${navCount2}`);

/* persistence across reload */
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const navCount3 = await page.locator('.cart-trigger__count').innerText();
check('Cart persists after reload', navCount3 === '3', `count=${navCount3}`);

/* corrupted storage handled gracefully */
await page.evaluate(() => localStorage.setItem('tava.cart.v1', '{not json'));
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(600);
check('Corrupted localStorage falls back to empty', (await page.locator('.cart-trigger__count').count()) === 0);
await page.evaluate(() => localStorage.removeItem('tava.cart.v1'));

/* ------------------------ ORDER ENQUIRY -------------------------- */
await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
await page.locator('.menu-card__trigger').first().click();
await page.waitForTimeout(400);
await page.click('.dish-drawer__submit');
await page.waitForTimeout(400);
await page.goto(`${BASE}/order`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
check('Order step 1 shows cart review', await page.locator('.order-line').count() > 0);
await noOverflow('order step 1');
await page.screenshot({ path: `${SHOTS}/13-order-step1.png` });

await page.click('button:has-text("Choose order type")');
await page.waitForTimeout(400);
const deliveryDisabled = await page.locator('.type-card.is-disabled').count();
check('Delivery option disabled when not configured', deliveryDisabled === 1, `disabled=${deliveryDisabled}`);
await page.screenshot({ path: `${SHOTS}/14-order-type.png` });
await page.click('.type-card:has-text("Pickup")');
await page.click('button:has-text("Continue")');
await page.waitForTimeout(400);

/* validation errors */
await page.click('button:has-text("Review request")');
await page.waitForTimeout(350);
const errorCount = await page.locator('.field__error').filter({ hasText: /\w/ }).count();
check('Order details validation shows errors', errorCount >= 2, `errors=${errorCount}`);
await page.screenshot({ path: `${SHOTS}/15-order-validation.png` });

await page.fill('input[autocomplete="name"]', 'Aarav Mehta');
await page.fill('input[type="tel"]', '+91 98765 43210');
await page.fill('input[type="time"]', '20:00');
await page.click('button:has-text("Review request")');
await page.waitForTimeout(450);
check('Order review step reached', await page.locator('.review-grid').isVisible());
await page.screenshot({ path: `${SHOTS}/16-order-review.png` });

await page.click('button:has-text("Send order enquiry")');
await page.waitForTimeout(600);
const preview = await page.locator('.enquiry-result__preview').innerText();
check('Order enquiry message generated', preview.includes('Order enquiry') && preview.includes('Aarav Mehta'), preview.split('\n')[0]);
check('WhatsApp action offered', await page.locator('button:has-text("Open WhatsApp to send")').isVisible());
check('No fake success claim', !(await page.locator('text=/order (confirmed|received|placed)/i').count()));
await page.screenshot({ path: `${SHOTS}/17-order-result.png` });

/* -------------------------- RESERVATION -------------------------- */
await page.goto(`${BASE}/reserve`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
check('Reservation step 1 occasion grid', await page.locator('.occasion-card').count() === 6);
check('Reservation notice shown', (await page.locator('.reservation-notice').first().innerText()).includes('not a confirmed booking'));
await page.screenshot({ path: `${SHOTS}/18-reserve-step1.png` });

await page.click('button:has-text("Guest details")');
await page.waitForTimeout(350);
const resErrors = await page.locator('.field__error, .form-alert--error').filter({ hasText: /\w/ }).count();
check('Occasion validation blocks progress', resErrors >= 1, `errors=${resErrors}`);

await page.click('.occasion-card:has-text("Anniversary")');
await page.click('button:has-text("Guest details")');
await page.waitForTimeout(400);
/* invalid guest count */
await page.fill('input[type="number"]', '0');
await page.click('button:has-text("Date & time")');
await page.waitForTimeout(350);
const guestError = await page.locator('.field__error').filter({ hasText: /guest/i }).count();
check('Guest count validation', guestError > 0);
await page.fill('input[type="number"]', '4');
await page.fill('input[autocomplete="name"]', 'Nisha Rao');
await page.fill('input[type="tel"]', '9876543210');
await page.click('button:has-text("Date & time")');
await page.waitForTimeout(400);

/* past date blocked */
const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
await page.fill('input[type="date"]', yesterday);
await page.click('button:has-text("Preferences")');
await page.waitForTimeout(350);
const dateError = await page.locator('.field__error').filter({ hasText: /passed/i }).count();
check('Past date rejected', dateError > 0);

const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
await page.fill('input[type="date"]', tomorrow);
await page.locator('.wizard-step select').first().selectOption({ index: 3 });
await page.click('button:has-text("Preferences")');
await page.waitForTimeout(400);
check('Step 4 preferences reached', await page.locator('textarea').first().isVisible());
await page.locator('textarea').first().fill('Window seat if possible.');
await page.click('button:has-text("Review request")');
await page.waitForTimeout(450);
check('Reservation review reached', await page.locator('.review-grid').isVisible());
await page.screenshot({ path: `${SHOTS}/19-reserve-review.png` });

await page.click('button:has-text("Send reservation enquiry")');
await page.waitForTimeout(600);
const resPreview = await page.locator('.enquiry-result__preview').innerText();
check('Reservation message generated', resPreview.includes('Table reservation enquiry') && resPreview.includes('Anniversary'), resPreview.split('\n')[1] ?? '');
await page.screenshot({ path: `${SHOTS}/20-reserve-result.png` });

/* ------------------------ PRIVATE DINING ------------------------- */
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
await page.evaluate(() => document.getElementById('private-dining').scrollIntoView());
await page.waitForTimeout(700);
await page.click('button:has-text("PLAN YOUR EXPERIENCE")');
await page.waitForTimeout(500);
check('Private dining modal opens', await page.locator('.enquiry-modal').isVisible());
await page.click('.enquiry-modal button:has-text("Prepare enquiry")');
await page.waitForTimeout(400);
const pdErrors = await page.locator('.enquiry-modal .field__error').filter({ hasText: /\w/ }).count();
check('Private dining validation', pdErrors >= 2, `errors=${pdErrors}`);
await page.screenshot({ path: `${SHOTS}/21-private-form.png` });
await page.fill('.enquiry-modal input[autocomplete="name"]', 'Kabir Shah');
await page.fill('.enquiry-modal input[type="tel"]', '+91 90000 00000');
await page.fill('.enquiry-modal input[type="number"]', '16');
await page.click('.enquiry-modal button:has-text("Prepare enquiry")');
await page.waitForTimeout(600);
const pdPreview = await page.locator('.enquiry-result__preview').innerText();
check('Private dining message generated', pdPreview.includes('Private dining enquiry'), pdPreview.split('\n')[0]);
await page.screenshot({ path: `${SHOTS}/22-private-result.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
check('Escape closes private dining modal', (await page.locator('.enquiry-modal').count()) === 0);

/* ------------------------ CATEGORY LINK -------------------------- */
await page.goto(`${BASE}/menu?cat=desserts`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const dessertCards = await page.locator('.menu-card').count();
const cats = await page.locator('.menu-card__category').allInnerTexts();
check(
  'Category deep-link preselects filter',
  dessertCards > 0 && cats.every((c) => c.toLowerCase() === 'desserts'),
  `${dessertCards} cards`,
);
await page.screenshot({ path: `${SHOTS}/23-menu-category.png` });

/* --------------------------- 404 --------------------------------- */
await page.goto(`${BASE}/does-not-exist`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
check('404 route renders', (await page.locator('h1').innerText()).includes('isn’t set'));

/* ------------------------ MOBILE NAV ----------------------------- */
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mpage = await mobile.newPage();
mpage.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(`[mobile console] ${msg.text()}`);
});
mpage.on('pageerror', (err) => consoleErrors.push(`[mobile pageerror] ${err.message}`));

await mpage.goto(BASE, { waitUntil: 'networkidle' });
await mpage.waitForTimeout(700);
const mOverflow = await mpage.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
check('No horizontal overflow — mobile home', mOverflow <= 1, `overflow=${mOverflow}px`);
await mpage.screenshot({ path: `${SHOTS}/30-mobile-home.png` });

await mpage.click('.nav-toggle');
await mpage.waitForTimeout(600);
check('Mobile drawer opens', await mpage.locator('.nav-drawer__panel').isVisible());
const bodyOverflow = await mpage.evaluate(() => getComputedStyle(document.body).overflow);
check('Background scroll locked', bodyOverflow === 'hidden', `overflow=${bodyOverflow}`);
await mpage.screenshot({ path: `${SHOTS}/31-mobile-drawer.png` });
await mpage.click('.nav-drawer__link:has-text("Discover Menu")');
await mpage.waitForTimeout(900);
check('Mobile nav closes after navigation', (await mpage.locator('.nav-drawer').count()) === 0);
check('Mobile navigated to menu', mpage.url().includes('/menu'));

const mOverflow2 = await mpage.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
check('No horizontal overflow — mobile menu', mOverflow2 <= 1, `overflow=${mOverflow2}px`);
await mpage.screenshot({ path: `${SHOTS}/32-mobile-menu.png` });

/* mobile filters sheet */
await mpage.click('.menu-explorer__filter-toggle');
await mpage.waitForTimeout(600);
check('Mobile filter sheet opens', await mpage.locator('.filter-sheet').isVisible());
await mpage.screenshot({ path: `${SHOTS}/33-mobile-filters.png` });
await mpage.click('.filter-sheet button:has-text("Show")');
await mpage.waitForTimeout(500);

/* mobile drawer dish detail */
await mpage.locator('.menu-card__trigger').first().click();
await mpage.waitForTimeout(500);
check('Mobile dish drawer opens', await mpage.locator('.dish-drawer').isVisible());
const dialogBox = await mpage.locator('.dialog--sheet-right').boundingBox();
check('Mobile drawer fits viewport', dialogBox && dialogBox.width <= 390, `width=${dialogBox?.width}`);
await mpage.screenshot({ path: `${SHOTS}/34-mobile-dish.png` });
await mpage.keyboard.press('Escape');

/* mobile reservation */
await mpage.goto(`${BASE}/reserve`, { waitUntil: 'networkidle' });
await mpage.waitForTimeout(600);
const mOverflow3 = await mpage.evaluate(
  () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
);
check('No horizontal overflow — mobile reserve', mOverflow3 <= 1, `overflow=${mOverflow3}px`);
await mpage.screenshot({ path: `${SHOTS}/35-mobile-reserve.png` });

/* ------------------- other viewport spot checks ------------------ */
for (const [w, h, label] of [
  [360, 800, '360x800'],
  [430, 932, '430x932'],
  [768, 1024, '768x1024'],
  [1024, 768, '1024x768'],
  [1366, 768, '1366x768'],
  [1920, 1080, '1920x1080'],
]) {
  const vp = await browser.newContext({ viewport: { width: w, height: h } });
  const vpPage = await vp.newPage();
  vpPage.on('pageerror', (err) => consoleErrors.push(`[${label} pageerror] ${err.message}`));
  await vpPage.goto(BASE, { waitUntil: 'networkidle' });
  await vpPage.waitForTimeout(500);
  const ov = await vpPage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(`No horizontal overflow — ${label}`, ov <= 1, `overflow=${ov}px`);
  if (label === '768x1024' || label === '1920x1080') {
    await vpPage.screenshot({ path: `${SHOTS}/40-${label}-home.png` });
  }
  await vpPage.goto(`${BASE}/menu`, { waitUntil: 'networkidle' });
  await vpPage.waitForTimeout(400);
  const ov2 = await vpPage.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  check(`No horizontal overflow — ${label} menu`, ov2 <= 1, `overflow=${ov2}px`);
  if (label === '768x1024' || label === '1920x1080') {
    await vpPage.screenshot({ path: `${SHOTS}/41-${label}-menu.png` });
  }
  await vp.close();
}

/* --------------------------- REPORT ------------------------------ */
const failed = results.filter((r) => !r.ok);
console.log('\n=== SUMMARY ===');
console.log(`Total: ${results.length} | Passed: ${results.length - failed.length} | Failed: ${failed.length}`);
if (failed.length) {
  console.log('FAILURES:');
  failed.forEach((f) => console.log(` - ${f.name} ${f.detail}`));
}
console.log(`Console/page errors: ${consoleErrors.length}`);
consoleErrors.slice(0, 20).forEach((e) => console.log(` - ${e}`));

await browser.close();
process.exit(failed.length || consoleErrors.length ? 1 : 0);
