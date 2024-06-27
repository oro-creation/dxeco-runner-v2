import { assertEquals, assertRejects } from "jsr:@std/assert";
import { getLogger } from "jsr:@std/log";
import { executeTypeScriptInWorker, TimeoutError } from "./mod.ts";

{
  console.group("default");
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/default.ts"))
    ).text(),
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
        typeScriptCode: await (
          await fetch(import.meta.resolve("./example/loop.ts"))
        ).text(),
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
        typeScriptCode: await (
          await fetch(import.meta.resolve("./example/throw.ts"))
        ).text(),
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
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/fetch.ts"))
    ).text(),
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
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/redaxios.ts"))
    ).text(),
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
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/ky.ts"))
    ).text(),
    logger: getLogger("ky"),
    timeout: 10000,
    workerName: "ky",
  });

  assertEquals(result.id, 1);
  console.groupEnd();
}

{
  console.log("csv");
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/csv.ts"))
    ).text(),
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
  console.log("domParser");
  const result = await executeTypeScriptInWorker<string[]>({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/domParser.ts"))
    ).text(),
    logger: getLogger("domParser"),
    timeout: 10000,
    workerName: "domParser",
  });

  assertEquals(result[0], "Installation");
  console.groupEnd();
}

// GitHub Action 上でのテストが失敗するので一時的にコメントアウト
// {
//   console.log("browser");
//   const result = await executeTypeScriptInWorker<string[]>({
//     typeScriptCode: await (
//       await fetch(import.meta.resolve("./example/browser.ts"))
//     ).text(),
//     logger: getLogger("browser"),
//     timeout: 100000,
//     workerName: "browser",
//   });
//   console.log(result);
//   assertStringIncludes(result.join(","), "現在のユーザー情報");
//   console.groupEnd();
// }
