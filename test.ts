import { assertEquals, assertRejects } from "jsr:@std/assert";
import { getLogger } from "jsr:@std/log";
import { join } from "jsr:@std/url";
import { executeTypeScriptInWorker, TimeoutError } from "./mod.ts";

Deno.test("default", async () => {
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/default.ts"))
    ).text(),
    logger: getLogger("default"),
    timeout: 10000,
    workerName: "default",
    permission: {},
  });

  assertEquals(result, [
    { name: "アカウント1", email: "a1@example.com" },
    { name: "アカウント2", email: "a2@example.com" },
    { name: "アカウント3", email: "a3@example.com" },
  ]);
});

Deno.test("loop", async () => {
  await assertRejects(
    async () =>
      await executeTypeScriptInWorker({
        typeScriptCode: await (
          await fetch(import.meta.resolve("./example/loop.ts"))
        ).text(),
        logger: getLogger("loop"),
        timeout: 10000,
        workerName: "loop",
        permission: {},
      }),
    TimeoutError,
    "Timeout",
  );
});

Deno.test("throw", async () => {
  await assertRejects(
    async () =>
      await executeTypeScriptInWorker({
        typeScriptCode: await (
          await fetch(import.meta.resolve("./example/throw.ts"))
        ).text(),
        logger: getLogger("throw"),
        timeout: 10000,
        workerName: "throw",
        permission: {},
      }),
    Error,
    "always throw",
  );
});

Deno.test("fetch", async () => {
  const result = await executeTypeScriptInWorker<{ id: number }>({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/fetch.ts"))
    ).text(),
    logger: getLogger("fetch"),
    timeout: 10000,
    workerName: "fetch",
    permission: { net: ["dummyjson.com"] },
  });

  assertEquals(result.id, 1);
});

Deno.test("permission net", async () => {
  await assertRejects(
    async () =>
      await executeTypeScriptInWorker<{ id: number }>({
        typeScriptCode: await (
          await fetch(import.meta.resolve("./example/fetch.ts"))
        ).text(),
        logger: getLogger("permission net"),
        timeout: 10000,
        workerName: "permission net",
        permission: {},
      }),
    Error,
    "PermissionDenied",
  );
});

Deno.test("redaxios", async () => {
  const result = await executeTypeScriptInWorker<{ id: number }>({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/redaxios.ts"))
    ).text(),
    logger: getLogger("redaxios"),
    timeout: 10000,
    workerName: "redaxios",
    permission: { net: ["dummyjson.com"] },
  });

  assertEquals(result.id, 1);
});

Deno.test("ky", async () => {
  const result = await executeTypeScriptInWorker<{ id: number }>({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/ky.ts"))
    ).text(),
    logger: getLogger("ky"),
    timeout: 10000,
    workerName: "ky",
    permission: { net: ["dummyjson.com"] },
  });

  assertEquals(result.id, 1);
});

Deno.test("csv", async () => {
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/csv.ts"))
    ).text(),
    logger: getLogger("csv"),
    timeout: 10000,
    workerName: "csv",
    permission: {},
  });

  assertEquals(result, [
    ["a", "b", "c"],
    ["1", "2", "3"],
  ]);
});

Deno.test("domParser", async () => {
  const result = await executeTypeScriptInWorker<string[]>({
    typeScriptCode: await (
      await fetch(import.meta.resolve("./example/domParser.ts"))
    ).text(),
    logger: getLogger("domParser"),
    timeout: 10000,
    workerName: "domParser",
    permission: { net: ["www.npmjs.com"] },
  });

  assertEquals(result[0], "Installation");
});

// GitHub Action 上でのテストが失敗するので一時的にコメントアウト
// Deno.test("browser", async () => {
//   const result = await executeTypeScriptInWorker<string[]>({
//     typeScriptCode: await (
//       await fetch(import.meta.resolve("./example/browser.ts"))
//     ).text(),
//     logger: getLogger("browser"),
//     timeout: 100000,
//     workerName: "browser",
//     permission: {
//       env: true,
//       hrtime: false,
//       net: true,
//       ffi: false,
//       sys: false,
//       read: true,
//       run: true,
//       write: true,
//     },
//   });

//   console.log(result);

//   assertStringIncludes(result.join(","), "現在のユーザー情報");
// });

Deno.test("url base", () => {
  assertEquals(
    join(new URL("foo/sub", "https://example.com/api")),
    new URL("https://example.com/foo/sub"),
  );
});

Deno.test("url join", () => {
  assertEquals(
    join(new URL("https://example.com/api"), "foo/sub"),
    new URL("https://example.com/api/foo/sub"),
  );
});
