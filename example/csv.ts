import { parse } from "https://esm.sh/jsr/@std/csv@0.224.0";

onmessage = () => {
  const result = parse(
    `a,b,c
1,2,3`
  );
  console.log(result);
  postMessage(result);
};
