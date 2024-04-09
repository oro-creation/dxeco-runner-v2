import { join } from "jsr:@std/url";

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
  const res = await fetch(join(props.apiUrl, "auth", "current-user"), {
    headers: { "X-API-Key": props.apiKey },
  });
  return await res.json();
}

/**
 * ランナー登録
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerController_registerRunner
 */
export async function registerRunner(
  props: Readonly<{
    apiUrl: URL;
    apiKey: string;
    organizationId: string;
    name: string;
  }>
): Promise<{ id: string }> {
  const res = await fetch(join(props.apiUrl, "runners", "register"), {
    method: "POST",
    headers: {
      "X-API-Key": props.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      organizationId: props.organizationId,
      name: props.name,
    }),
  });
  return await res.json();
}

/**
 * ランナーアクティブ化
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerController_activateRunner
 */
export async function activateRunner(
  props: Readonly<{
    apiUrl: URL;
    apiKey: string;
    runnerId: string;
  }>
): Promise<void> {
  await fetch(join(props.apiUrl, "runners", props.runnerId, "activate"), {
    method: "POST",
    headers: {
      "X-API-Key": props.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: props.runnerId }),
  });
}

/**
 * ランナージョブ一覧
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerJobController_runnerJobs
 */
export async function getRunnerJobs(
  props: Readonly<{
    apiUrl: URL;
    apiKey: string;
    runnerId: string;
    organizationId: string;
  }>
): Promise<{
  data: ReadonlyArray<{
    id: string;
    status: string;
    runnableCode?: string;
  }>;
}> {
  const url = join(props.apiUrl, "runner-jobs");
  url.searchParams.set("organizationId", props.organizationId);
  url.searchParams.set("runnerId", props.runnerId);
  url.searchParams.set("type", "CustomAccountIntegration");
  url.searchParams.set("status", "Active");
  const res = await fetch(url, {
    headers: { "X-API-Key": props.apiKey },
  });
  return await res.json();
}

/**
 * ランナージョブ更新
 * @see https://api.dxeco.io/docs#tag/runner/operation/RunnerJobController_updateRunnerJob
 */
export async function updateRunnerJob(
  props: Readonly<{
    apiUrl: URL;
    apiKey: string;
    jobId: string;
    status: "Active" | "Done" | "Error" | "Timeout";
    errorReason?: string | undefined;
    result?: unknown;
  }>
): Promise<void> {
  await fetch(join(props.apiUrl, "runner-jobs", props.jobId), {
    method: "PUT",
    headers: {
      "X-API-Key": props.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: props.jobId,
      status: props.status,
      errorReason: props.errorReason,
      result: props.result,
    }),
  });
}
