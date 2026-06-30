/// <reference lib="deno.worker" />

// TODO GitHub リポジトリを公開後に GitHub の raw URL をimportするようにする
import type {
  AccountAdaptorResult,
  AdaptorAccount,
  AdaptorCustomField,
} from "../type.ts";

onmessage = () => {
  // アカウントカスタムフィールド定義（任意）。
  // ここで宣言した code は SaaS の Application.accountCustomFields に upsert され、
  // source = Integration が付与される（CSV インポートからは更新不可になる）。
  // accounts[].values のキーには、ここまたは事前に設定されているコードを指定すること。
  const fields: AdaptorCustomField[] = [
    { code: "role", name: "権限ロール", type: "Text" },
  ];

  const accounts: AdaptorAccount[] = [
    {
      name: "アカウント1",
      email: "a1@example.com",
      values: { role: "admin" },
    },
    {
      name: "アカウント2",
      email: "a2@example.com",
      values: { role: "member" },
    },
    { name: "アカウント3", email: "a3@example.com" },
  ];

  // 旧仕様（AdaptorAccount[] のまま postMessage）も後方互換で受け付けるが、
  // 新規ランナーでは AccountAdaptorResult を推奨。
  const result: AccountAdaptorResult = { fields, accounts };
  postMessage(result);
};
