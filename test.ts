import { assertEquals, assertRejects } from "jsr:@std/assert";
import { getLogger } from "jsr:@std/log";
import { join } from "jsr:@std/url";
import { TimeoutError, executeTypeScriptInWorker } from "./mod.ts";

Deno.test("default", async () => {
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
      }),
    TimeoutError,
    "Timeout"
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
      }),
    Error,
    "always throw"
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
  });

  assertEquals(result[0], "Installation");
});

Deno.test("url base", () => {
  assertEquals(
    join(new URL("foo/sub", "https://example.com/api")),
    new URL("https://example.com/foo/sub")
  );
});

Deno.test("url join", () => {
  assertEquals(
    join(new URL("https://example.com/api"), "foo/sub"),
    new URL("https://example.com/api/foo/sub")
  );
});
