import { parse } from "https://esm.sh/jsr/@std/csv@0.224.0";
import { toFileUrl } from "https://esm.sh/jsr/@std/path@0.224.0";
import type { AdaptorAccount } from "https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/type.ts";

onmessage = async () => {
  const rows = parse(
    await (await fetch(
      toFileUrl(
        "CSVファイルのパスをここに入力(例: C:/Users/hoge/Desktop/hoge.csv",
      ),
    )).text(),
  );

  const result: AdaptorAccount[] = rows.map((columns) => ({
    email: columns[0], // 1列目がメールアドレス
    name: columns[1], // 2列目が名前
  }));
  postMessage(result);
};
