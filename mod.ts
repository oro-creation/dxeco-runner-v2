import { LoadResponse } from "jsr:@deno/cache-dir";
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

const moduleCacheEntryCode: string = "";
const moduleCache = new Map<string, LoadResponse>();

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
  if (moduleCacheEntryCode !== props.typeScriptCode) {
    moduleCache.clear();
  }

  const dataUrl = `data:text/typescript;base64,${
    encodeBase64(
      props.typeScriptCode,
    )
  }`;

  const bundled = (await bundle(dataUrl, {
    load: async (
      specifier,
      _isDynamic,
      _cacheSetting,
      _checksum,
    ) => {
      const moduleInCache = moduleCache.get(specifier);
      if (moduleInCache) {
        return moduleInCache;
      }
      props.logger.info(`Fetch ${specifier}`);
      const response = await fetch(specifier);
      const module: LoadResponse = {
        specifier,
        content: await response.text(),
        kind: "module",
        headers: Object.fromEntries(response.headers.entries()),
      };
      moduleCache.set(specifier, module);
      return module;
    },
  })).code;

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
    const dataUrl = `data:text/javascript;base64,${
      encodeBase64(props.javaScriptBundledCode)
    }`;

    const worker = new Worker(import.meta.resolve(dataUrl), {
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

      resolve(e.data);
    };
    worker.onerror = (e) => {
      e.preventDefault();
      props.logger.error(`Job error: ${e}`);

      clearTimeout(timeoutId);
      worker.terminate();

      reject(new Error(e.message));
    };

    worker.postMessage({});

    const timeoutId = setTimeout(() => {
      worker.terminate();

      reject(new TimeoutError());
    }, props.timeout);
  });

export class TimeoutError extends Error {
  constructor() {
    super("Timeout");
  }
}
