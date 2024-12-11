import ky from "npm:ky@1.7.3";

onmessage = async () => {
  // https://dummyjson.com/docs/products
  const res = ky.get("https://dummyjson.com/products/1");
  const json = await res.json();
  console.log(json);
  postMessage(json);
};
