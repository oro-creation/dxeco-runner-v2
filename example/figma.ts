import type { AdaptorAccount } from "https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/type.ts";
import ky from "npm:ky@1.7.3";
import { chromium } from "npm:playwright-core";

// 事前に deno run -A npm:playwright install を実行してください

onmessage = async () => {
  const email = "メールアドレスをここに入力";
  const password = "パスワードをここに入力";
  const teamId = "チームIDをここに入力";

  const browser = await chromium.launch({
    // headless: false,
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://www.figma.com/login");

  await page.locator("input[name=email]").fill(email);
  await page.locator("input[name=password]").fill(password);
  await page.locator("button[type=submit]").click();
  await page.waitForTimeout(10000);

  const cookies = await context.cookies("https://www.figma.com");
  const cookie = cookies.map((v) => `${v.name}=${v.value}`).join(";");

  const res = await ky.get(
    `https://www.figma.com/api/teams/${teamId}/members`,
    {
      headers: {
        cookie,
      },
    },
  );

  const body = await res.json<{
    error: boolean;
    meta: Array<{
      id?: string;
      email: string;
      name?: string;
    }>;
    status: number;
    message: string;
  }>();

  if (body.status !== 200) {
    throw new Error(`${body.status}: ${body.message}`);
  }

  const data = body.meta
    .map((v): AdaptorAccount => ({
      name: v.name ?? v.email,
      email: v.email,
    }));

  postMessage(data);
};
