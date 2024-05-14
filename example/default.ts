/// <reference lib="deno.worker" />

// TODO GitHub リポジトリを公開後に GitHub の raw URL をimportするようにする
import type { AdaptorAccount } from "../type.ts";

onmessage = () => {
  const result: AdaptorAccount[] = [
    { name: "アカウント1", email: "a1@example.com" },
    { name: "アカウント2", email: "a2@example.com" },
    { name: "アカウント3", email: "a3@example.com" },
  ];
  postMessage(result);
};
