import { runner } from "./mod.ts";

await runner({
  name: "TestRunner",
  apiKey: "dummy",
  apiUrl: new URL("http://localhost:4000/api"),
  interval: 5000,
  timeout: 10000,
});
