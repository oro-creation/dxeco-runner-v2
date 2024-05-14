onmessage = async () => {
  // https://dummyjson.com/docs/products
  const res = await fetch("https://dummyjson.com/products/1");
  const json = await res.json();
  console.log(json);
  postMessage(json);
};
