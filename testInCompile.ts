import {
  assertEquals,
  assertRejects,
  assertStringIncludes,
} from "jsr:@std/assert";
import { getLogger } from "jsr:@std/log";
import { executeTypeScriptInWorker, TimeoutError } from "./mod.ts";

{
  console.group("default");
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await Deno.readTextFile("./example/default.ts"),
    logger: getLogger("default"),
    timeout: 10000,
    workerName: "default",
  });

  assertEquals(result, [
    { name: "アカウント1", email: "a1@example.com" },
    { name: "アカウント2", email: "a2@example.com" },
    { name: "アカウント3", email: "a3@example.com" },
  ]);
  console.groupEnd();
}

{
  console.group("loop");
  await assertRejects(
    async () =>
      await executeTypeScriptInWorker({
        typeScriptCode: await Deno.readTextFile("./example/loop.ts"),
        logger: getLogger("loop"),
        timeout: 10000,
        workerName: "loop",
      }),
    TimeoutError,
    "Timeout",
  );
  console.groupEnd();
}

{
  console.group("throw");
  await assertRejects(
    async () =>
      await executeTypeScriptInWorker({
        typeScriptCode: await Deno.readTextFile("./example/throw.ts"),
        logger: getLogger("throw"),
        timeout: 10000,
        workerName: "throw",
      }),
    Error,
    "always throw",
  );
  console.groupEnd();
}

{
  console.group("fetch");
  const result = await executeTypeScriptInWorker<{ id: number }>({
    typeScriptCode: await Deno.readTextFile("./example/fetch.ts"),
    logger: getLogger("fetch"),
    timeout: 10000,
    workerName: "fetch",
  });

  assertEquals(result.id, 1);
  console.groupEnd();
}

{
  console.group("redaxios");
  const result = await executeTypeScriptInWorker<{ id: number }>({
    typeScriptCode: await Deno.readTextFile("./example/redaxios.ts"),
    logger: getLogger("redaxios"),
    timeout: 10000,
    workerName: "redaxios",
  });

  assertEquals(result.id, 1);
  console.groupEnd();
}

{
  console.group("ky");
  const result = await executeTypeScriptInWorker<{ id: number }>({
    typeScriptCode: await Deno.readTextFile("./example/ky.ts"),
    logger: getLogger("ky"),
    timeout: 10000,
    workerName: "ky",
  });

  assertEquals(result.id, 1);
  console.groupEnd();
}

{
  console.group("csv");
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await Deno.readTextFile("./example/csv.ts"),
    logger: getLogger("csv"),
    timeout: 10000,
    workerName: "csv",
  });

  assertEquals(result, [
    ["a", "b", "c"],
    ["1", "2", "3"],
  ]);
  console.groupEnd();
}

{
  console.group("domParser");
  const result = await executeTypeScriptInWorker<string[]>({
    typeScriptCode: await Deno.readTextFile("./example/domParser.ts"),
    logger: getLogger("domParser"),
    timeout: 10000,
    workerName: "domParser",
  });

  assertEquals(result[0], "dom-parser");
  console.groupEnd();
}

{
  console.group("browser");
  const result = await executeTypeScriptInWorker<string[]>({
    typeScriptCode: await Deno.readTextFile("./example/browser.ts"),
    logger: getLogger("browser"),
    timeout: 100000,
    workerName: "browser",
  });
  console.log(result);
  assertStringIncludes(result.join(","), "現在のユーザー情報");
  console.groupEnd();
}

{
  console.group("playwright");
  const result = await executeTypeScriptInWorker<string[]>({
    typeScriptCode: await Deno.readTextFile("./example/playwright.ts"),
    logger: getLogger("playwright"),
    timeout: 100000,
    workerName: "playwright",
  });
  console.log(result);
  assertStringIncludes(result.join(","), "現在のユーザー情報");
  console.groupEnd();
}
