import { bundle } from "jsr:@deno/emit";
import { delay } from "jsr:@std/async";
import { encodeBase64 } from "jsr:@std/encoding/base64";
import { getLogger, Logger } from "jsr:@std/log";
import {
  activateRunner,
  getCurrentUser,
  getRunnerJobs,
  registerRunner,
  updateRunnerJob,
} from "./api.ts";

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
    apiUrl?: URL;
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
  }>,
) {
  const logger = getLogger();

  const {
    name,
    apiKey,
    apiUrl = new URL("https://api.dxeco.io/api"),
    interval = 30000,
    timeout = 30000,
  } = props;

  try {
    logger.info("Starting dxeco-runner...");

    const { organizationId } = await getCurrentUser({ apiKey, apiUrl });

    // Register as a runner
    const { id: runnerId } = await registerRunner({
      apiUrl,
      apiKey,
      organizationId,
      name,
    });

    logger.info(`Registration complete: ${runnerId}`);

    // Activate every 30 seconds
    setInterval(async () => {
      await activateRunner({
        apiUrl,
        apiKey,
        runnerId,
        logger,
      });
    }, 30000);

    logger.info(`Waiting for jobs...`);

    // Polls its own jobs every 30 seconds
    do {
      const { data: jobs } = await getRunnerJobs({
        apiKey,
        apiUrl,
        organizationId,
        runnerId,
        logger,
      });

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
            workerName: `job-${job.id}`,
          });

          await updateRunnerJob({
            apiUrl,
            apiKey,
            jobId: job.id,
            status: "Done",
            result,
          });
        } catch (e) {
          logger.error(`Job error: ${e}`);
          if (e instanceof TimeoutError) {
            await updateRunnerJob({
              apiUrl,
              apiKey,
              jobId: job.id,
              status: "Timeout",
            });
            continue;
          }
          if (e instanceof Error) {
            logger.info(`Job error: ${e.message}`);

            await updateRunnerJob({
              apiUrl,
              apiKey,
              jobId: job.id,
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
    workerName: string;
    // permission: Deno.PermissionOptions;
  }>,
): Promise<T> {
  const dataUrl = `data:text/typescript;base64,${
    encodeBase64(
      props.typeScriptCode,
    )
  }`;

  const bundled = (await bundle(dataUrl)).code;

  return await executeJavaScriptInWorker({
    javaScriptBundledCode: bundled,
    timeout: props.timeout,
    logger: props.logger,
    workerName: props.workerName,
    // permission: props.permission,
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
    workerName: string;
    // permission: Deno.PermissionOptions;
  }>,
) =>
  new Promise<T>((resolve, reject) => {
    const blobUrl = URL.createObjectURL(
      new Blob([props.javaScriptBundledCode], {
        type: "text/javascript",
      }),
    );

    const worker = new Worker(import.meta.resolve(blobUrl), {
      type: "module",
      name: props.workerName,
      // deno: {
      //   permissions: props.permission,
      // },
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
      e.preventDefault();
      props.logger.error(`Job error: ${e}`);

      clearTimeout(timeoutId);
      worker.terminate();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      reject(new Error(e.message));
    };

    worker.postMessage({});

    const timeoutId = setTimeout(() => {
      worker.terminate();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }

      reject(new TimeoutError());
    }, props.timeout);
  });

export class TimeoutError extends Error {
  constructor() {
    super("Timeout");
  }
}
