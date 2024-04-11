import { parse } from "https://esm.sh/csv-parse@5.5.5/sync";

onmessage = () => {
  const result = parse(
    `a,b,c
1,2,3`
  );
  console.log(result);
  postMessage(result);
};
