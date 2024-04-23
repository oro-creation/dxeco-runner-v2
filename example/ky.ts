import ky from "https://esm.sh/ky@1.2.4";

onmessage = async () => {
  // https://dummyjson.com/docs/products
  const res = ky.get("https://dummyjson.com/products/1");
  const json = await res.json();
  console.log(json);
  postMessage(json);
};
