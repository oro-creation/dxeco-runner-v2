import ky from "https://esm.sh/ky@1.2.4";
import type { AdaptorAccount } from "https://raw.githubusercontent.com/oro-creation/dxeco-runner-v2/main/type.ts";

onmessage = async () => {
  // axios: @see https://github.com/axios/axios
  const { data: members } =
    await (await ky.get("https://api.dxeco.io/api/members?limit=-1", {
      searchParams: {
        organizationId: "組織IDをここに入力",
      },
      headers: {
        "X-API-Key": "APIキーをここに入力",
      },
    })).json<{
      data: Array<{
        name: string;
        email: string;
      }>;
    }>();

  const result: AdaptorAccount[] = members.map((v) => ({
    name: v.name,
    email: v.email,
  }));
  postMessage(result);
};
