import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

onmessage = async () => {
  const dom = new DOMParser().parseFromString(
    await (await fetch("https://www.npmjs.com/package/dom-parser")).text(),
    "text/html",
  );
  postMessage(dom?.getElementsByTagName("h2").map((e) => e.textContent));
};
