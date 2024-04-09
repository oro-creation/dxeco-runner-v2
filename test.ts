import { assertEquals } from "jsr:@std/assert";
import { getLogger } from "jsr:@std/log";
import { executeTypeScriptInWorker } from "./mod.ts";

Deno.test("default", async () => {
  const result = await executeTypeScriptInWorker({
    typeScriptCode: await Deno.readTextFile("./example/default.ts"),
    logger: getLogger("default"),
    timeout: 1000,
  });

  assertEquals(result, [
    { name: "アカウント1", email: "a1@example.com" },
    { name: "アカウント2", email: "a2@example.com" },
    { name: "アカウント3", email: "a3@example.com" },
  ]);
});
