import { parse } from "https://esm.sh/jsr/@std/csv@1.0.4";

onmessage = () => {
  const result = parse(
    `a,b,c
1,2,3`,
  );
  console.log(result);
  postMessage(result);
};
