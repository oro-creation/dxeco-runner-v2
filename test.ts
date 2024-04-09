import { assertEquals, assertRejects } from "jsr:@std/assert";
import { getLogger } from "jsr:@std/log";
import { join } from "jsr:@std/url";
import { TimeoutError, executeTypeScriptInWorker } from "./mod.ts";

Deno.test("default", async () => {
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await Deno.readTextFile("./example/default.ts"),
    logger: getLogger("default"),
    timeout: 10000,
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
        typeScriptCode: await Deno.readTextFile("./example/loop.ts"),
        logger: getLogger("loop"),
        timeout: 10000,
      }),
    TimeoutError,
    "Timeout"
  );
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
