import { bundle } from "https://deno.land/x/emit@0.38.3/mod.ts";
import { delay } from "jsr:@std/async";
import { Logger, getLogger } from "jsr:@std/log";
import { join } from "jsr:@std/path";
import axios from "npm:axios";

export async function runner(
  props: Readonly<{
    /**
     * Runner name
     */
    name: string;
    /**
     * API Key
     */
    apiKey: string;
    /**
     * API URL
     * @default https://api.dxeco.io/api
     */
    apiUrl?: string;
    /**
     * Jobs polling interval
     * @default 30000
     */
    interval?: number;
    /**
     * timeout
     * @default 30000
     */
    timeout?: number;
  }>
) {
  const logger = getLogger();

  const {
    name,
    apiKey,
    apiUrl = "https://api.dxeco.io/api",
    interval = 30000,
    timeout = 30000,
  } = props;

  try {
    logger.info("Starting dxeco-runner...");

    // Preparing API client
    const api = axios.create({
      baseURL: apiUrl,
      headers: {
        "X-API-Key": apiKey,
      },
    });

    // Get my user context
    const {
      data: { organizationId },
    } = await api.get<{
      id: string;
      organizationId: string;
    }>("/auth/current-user");

    // Register as a runner
    const {
      data: { id: runnerId },
    } = await api.post<{
      id: string;
    }>("/runners/register", {
      organizationId,
      name,
    });

    logger.info(`Registration complete: ${runnerId}`);

    // Activate every 30 seconds
    setInterval(async () => {
      try {
        await api.post<{
          id: string;
        }>(`/runners/${runnerId}/activate`, {
          id: runnerId,
        });
      } catch (e) {
        if (e instanceof Error) {
          logger.error(`Activation failed: ${e.message}\n${e.stack}`);
        }
      }
    }, 30000);

    logger.info(`Waiting for jobs...`);

    // Polls its own jobs every 30 seconds
    do {
      const jobs = await (async () => {
        try {
          const {
            data: { data: jobs },
          } = await api.get<{
            data: Array<{
              id: string;
              status: string;
              runnableCode?: string;
            }>;
          }>("/runner-jobs", {
            params: {
              organizationId,
              runnerId,
              type: "CustomAccountIntegration",
              status: "Active",
            },
          });
          return jobs;
        } catch (e) {
          if (e instanceof Error) {
            logger.error(
              `Getting runner-jobs failed: ${e.message}\n${e.stack}`
            );
          }
          return [];
        }
      })();

      if (jobs.length > 0) {
        logger.info(`Jobs found: ${jobs.map((v) => v.id).join(", ")}`);
      }

      for (const job of jobs) {
        try {
          logger.info(`Job started: ${job.id}`);

          if (!job.runnableCode) {
            throw new Error("Runnable code not found");
          }

          const result = await executeTypeScriptInWorker({
            typeScriptCode: job.runnableCode,
            timeout,
            logger: getLogger(`job-${job.id}`),
          });

          await api.put(`/runner-jobs/${job.id}`, {
            id: job.id,
            status: "Done",
            result,
          });
        } catch (e) {
          logger.error(`Job error: ${e}`);
          if (e instanceof Error) {
            logger.info(`Job error: ${e.message}`);

            await api.put(`/runner-jobs/${job.id}`, {
              id: job.id,
              status: "Error",
              errorReason: e.stack,
            });

            continue;
          }
        }
      }

      await delay(interval);
    } while (true);
  } catch (e) {
    if (e instanceof Error) {
      logger.error(`${e.message}\n${e.stack}`);
    }
  }
}

/**
 * DenoのTypeScriptコードをWeb Workerで実行します
 */
export async function executeTypeScriptInWorker<T>(
  props: Readonly<{
    typeScriptCode: string;
    timeout: number;
    logger: Logger;
  }>
): Promise<T> {
  const dirPath = await Deno.makeTempDir();

  const runnableCodePath = join(dirPath, "mod.ts");
  await Deno.writeTextFile(runnableCodePath, props.typeScriptCode);

  const bundled = (await bundle(runnableCodePath)).code;

  return await executeJavaScriptInWorker({
    javaScriptBundledCode: bundled,
    timeout: props.timeout,
    logger: props.logger,
  });
}

/**
 * バンドル済みのJavaScriptコードをWeb Workerで実行します
 */
const executeJavaScriptInWorker = <T>(
  props: Readonly<{
    javaScriptBundledCode: string;
    timeout: number;
    logger: Logger;
  }>
) =>
  new Promise<T>((resolve, reject) => {
    const blobUrl = URL.createObjectURL(
      new Blob([props.javaScriptBundledCode], {
        type: "text/javascript",
      })
    );

    const worker = new Worker(import.meta.resolve(blobUrl), {
      type: "module",
    });

    worker.onmessage = (e) => {
      props.logger.info(`Job done ${e.data}`);

      clearTimeout(timeoutId);
      worker.terminate();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      resolve(e.data);
    };
    worker.onerror = (e) => {
      props.logger.error(`Job error: ${e}`);

      clearTimeout(timeoutId);
      worker.terminate();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      reject(e);
    };

    worker.postMessage({});

    const timeoutId = setTimeout(() => {
      worker.terminate();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      reject(new Error("Timeout"));
    }, props.timeout);
  });
