import axios from "https://esm.sh/redaxios@0.5.1";

onmessage = async () => {
  // https://dummyjson.com/docs/products
  const res = await axios.get("https://dummyjson.com/products/1");
  const json = res.data;
  console.log(json);
  postMessage(json);
};
