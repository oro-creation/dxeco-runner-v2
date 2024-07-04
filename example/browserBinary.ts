import { launch } from "https://esm.sh/jsr/@astral/astral@0.3.6";

onmessage = async () => {
  const browser = await launch({
    path: "/usr/bin/chromium-browser",
    args: [
      "--headless=new",
      "--ignore-certificate-errors", // 自己証明書の警告をスキップ
      "--no-sandbox", // rootユーザーで実行する場合必須
    ],
  });

  const page = await browser.newPage("https://api.dxeco.io/docs");

  await page.waitForNetworkIdle();
  await (await page.$('input[aria-label="Search"]'))?.type("auth");
  await page.waitForSelector('[data-role="search:results"] li');

  postMessage(
    await Promise.all(
      (
        await page.$$('[data-role="search:results"] li')
      ).map((e) => e.innerText()),
    ),
  );
};
