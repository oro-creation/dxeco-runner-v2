import { launch } from "https://esm.sh/jsr/@astral/astral@0.3.6";
import ky from "https://esm.sh/ky@1.2.4";
import type { AdaptorAccount } from "https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/type.ts";

onmessage = async () => {
  const email = "メールアドレスをここに入力";
  const password = "パスワードをここに入力";
  const teamId = "チームIDをここに入力";

  // astral: @see https://astral.deno.dev/
  const browser = await launch({
    // headless: false
  });
  const page = await browser.newPage("https://www.figma.com/login");

  await (await page.$("input[name=email]"))?.type(email);
  await (await page.$("input[name=password]"))?.type(password);
  await (await page.$("button[type=submit]"))?.click();
  await page.waitForTimeout(10000);

  const cookies = await page.cookies("https://www.figma.com");
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
    throw new Error(`\${body.status}: ${body.message}`);
  }

  const data = body.meta
    .map((v): AdaptorAccount => ({
      name: v.name ?? v.email,
      email: v.email,
    }));

  postMessage(data);
};
