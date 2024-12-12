import type { AdaptorAccount } from "https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/type.ts";
import ky from "npm:ky@1.7.3";

onmessage = async () => {
  // ky: @see https://github.com/sindresorhus/ky
  const { data: members } = await (await ky.get<{
    data: Array<{
      name: string;
      email: string;
    }>;
  }>("https://api.dxeco.io/api/members", {
    searchParams: {
      limit: -1,
      organizationId: "組織IDをここに入力",
    },
    headers: {
      "X-API-Key": "APIキーをここに入力",
    },
  })).json();

  const result: AdaptorAccount[] = members.map((v) => ({
    name: v.name,
    email: v.email,
  }));
  postMessage(result);
};
