import { parseFromString } from "https://esm.sh/dom-parser@1.1.5";

onmessage = async () => {
  const dom = parseFromString(
    await (await fetch("https://www.npmjs.com/package/dom-parser")).text(),
  );
  postMessage(dom.getElementsByTagName("h2").map((e) => e.textContent));
};
