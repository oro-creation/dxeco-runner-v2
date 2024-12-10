import { Logger } from "jsr:@std/log";
import ky from "npm:ky";

/**
 * 現在のユーザー情報
 * @see https://api.dxeco.io/docs#tag/auth/operation/AuthApiController_currentUser
 */
export async function getCurrentUser(props: {
  apiUrl: URL;
  apiKey: string;
}): Promise<{
  id: string;
  organizationId: string;
}> {
  const res = await ky.get("auth/current-user", {
    prefixUrl: props.apiUrl,
    headers: { "X-API-Key": props.apiKey },
  });
  return await res.json();
}

/**
 * ランナー登録
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerController_registerRunner
 */
export async function registerRunner(props: {
  apiUrl: URL;
  apiKey: string;
  organizationId: string;
  name: string;
}): Promise<{ id: string }> {
  const res = await ky.post("runners/register", {
    prefixUrl: props.apiUrl,
    headers: {
      "X-API-Key": props.apiKey,
    },
    json: {
      organizationId: props.organizationId,
      name: props.name,
    },
  });
  return await res.json();
}

/**
 * ランナーアクティブ化
 * エラー発生時はloggerに出力
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerController_activateRunner
 */
export async function activateRunner(props: {
  apiUrl: URL;
  apiKey: string;
  runnerId: string;
  logger: Logger;
}): Promise<void> {
  try {
    await ky.post(
      `runners/${props.runnerId}/activate`,
      {
        prefixUrl: props.apiUrl,
        headers: {
          "X-API-Key": props.apiKey,
        },
        json: { id: props.runnerId },
      },
    );
  } catch (error) {
    props.logger.error(`Failed to activate runner: ${error}`);
  }
}

/**
 * ランナージョブ一覧
 * エラー発生時は空配列を返し、loggerに出力
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerJobController_runnerJobs
 */
export async function getRunnerJobs(props: {
  apiUrl: URL;
  apiKey: string;
  runnerId: string;
  organizationId: string;
  logger: Logger;
}): Promise<{
  data: ReadonlyArray<{
    id: string;
    status: string;
    runnableCode?: string;
  }>;
}> {
  try {
    // なぜか fetch を使うと connection closed before message completed ERRORが出るため ky で代用
    const res = ky.get("runner-jobs", {
      prefixUrl: props.apiUrl,
      searchParams: {
        organizationId: props.organizationId,
        runnerId: props.runnerId,
        status: "Active",
        limit: -1,
      },
      headers: { "X-API-Key": props.apiKey },
    });
    return await res.json();
  } catch (e) {
    props.logger.error(`Failed to get runner jobs: ${e}`);
    return { data: [] };
  }
}

/**
 * ランナージョブ更新
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerJobController_updateRunnerJob
 */
export async function updateRunnerJob(props: {
  apiUrl: URL;
  apiKey: string;
  jobId: string;
  status: "Active" | "Done" | "Error" | "Timeout";
  errorReason?: string | undefined;
  result?: unknown;
}): Promise<void> {
  await ky.put(`runner-jobs/${props.jobId}`, {
    prefixUrl: props.apiUrl,
    headers: {
      "X-API-Key": props.apiKey,
      "Content-Type": "application/json",
    },
    json: {
      id: props.jobId,
      status: props.status,
      errorReason: props.errorReason,
      result: props.result,
    },
  });
}
