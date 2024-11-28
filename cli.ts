import { Command } from "jsr:@cliffy/command@1.0.0-rc.7";
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
  .option("--interval <interval:number>", "Jobs polling interval (ms)", {
    default: 30000,
  })
  .option("--timeout <timeout:number>", "Timeout (ms)", {
    default: 300000,
  })
  .action(async ({ name, apiKey, apiUrl, interval, timeout }) => {
    await runner({
      name,
      apiKey,
      apiUrl: new URL(apiUrl),
      interval,
      timeout,
    });
  })
  .parse();
