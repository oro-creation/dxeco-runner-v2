import { launch } from "https://esm.sh/jsr/@astral/astral@0.3.6";

onmessage = async () => {
  const browser = await launch({
    // headless: false
  });

  const page = await browser.newPage("https://api.dxeco.io/docs");

  await page.waitForNetworkIdle();
  await (await page.$('input[aria-label="Search"]'))?.type("auth");
  await page.waitForSelector('[data-role="search:results"] li');

  postMessage(
    await Promise.all(
      (
        await page.$$('[data-role="search:results"] li')
      ).map((e) => e.innerText())
    )
  );
};
