import { parseFromString } from "https://cdn.skypack.dev/dom-parser?dts";

onmessage = async () => {
  const dom = parseFromString(
    await (await fetch("https://www.npmjs.com/package/dom-parser")).text()
  );
  postMessage(dom.getElementsByTagName("h2").map((e) => e.textContent));
};
