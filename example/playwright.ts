import { chromium } from "npm:playwright-core";

onmessage = async () => {
  const browser = await chromium.launch({
    headless: false,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://api.dxeco.io/docs");
  page.locator('input[aria-label="Search"]').fill("auth");
  await page.waitForSelector('[data-role="search:results"] li');

  postMessage(
    await page.locator('[data-role="search:results"] li').allTextContents(),
  );
};
