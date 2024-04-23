import { Command } from "https://deno.land/x/cliffy@v1.0.0-rc.4/command/mod.ts";
import { runner } from "./mod.ts";

await new Command()
  .name("dxeco-runner")
  .version("v2.0.0")
  .option("--name <name>", "API Key", {
    required: true,
  })
  .option("--api-key <apiKey>", "The host name for the local server.", {
    required: true,
  })
  .option("--api-url <apiUrl>", "API URL", {
    default: "https://api.dxeco.io/api",
  })
  .option("--interval <interval:number>", "Jobs polling interval", {
    default: 30000,
  })
  .action(async ({ name, apiKey, apiUrl, interval }) => {
    await runner({
      name,
      apiKey,
      apiUrl: new URL(apiUrl),
      interval,
    });
  })
  .parse();
