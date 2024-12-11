import { parse } from "jsr:@std/csv@1.0.4";

onmessage = async () => {
  const result = parse(
    await Deno.readTextFile("./example/sample.csv"),
  );
  console.log(result);
  postMessage(result);
};
