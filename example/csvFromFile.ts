import type { AdaptorAccount } from "https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/type.ts";
import { parse } from "jsr:@std/csv@1.0.4";

onmessage = async () => {
  const rows = parse(
    await Deno.readTextFile(
      "CSVファイルのパスをここに入力(例: C:/Users/hoge/Desktop/hoge.csv",
    ),
  );

  const result: AdaptorAccount[] = rows.map((columns) => ({
    email: columns[0], // 1列目がメールアドレス
    name: columns[1], // 2列目が名前
  }));
  postMessage(result);
};
