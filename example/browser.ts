import { launch } from "https://deno.land/x/astral@0.3.5/mod.ts";

onmessage = async () => {
  const browser = await launch({
    // headless: false
  });

  const page = await browser.newPage("https://api.dxeco.io/docs");

  await page.waitForNetworkIdle();
  await (await page.$('input[aria-label="Search"]'))?.type("auth");
  await page.waitForTimeout(1000);

  postMessage(
    await Promise.all(
      (
        await page.$$('[data-role="search:results"] li')
      ).map((e) => e.innerText())
    )
  );
};
