import { parse } from "https://deno.land/std@0.223.0/csv/mod.ts";

onmessage = () => {
  const result = parse(
    `a,b,c
1,2,3`
  );
  console.log(result);
  postMessage(result);
};
