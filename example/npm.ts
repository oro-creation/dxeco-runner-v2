import { parse } from "npm:csv-parse";

onmessage = () => {
  const result = parse(
    `a,b,c
1,2,3`
  );
  console.log(result);
  postMessage(result);
};
