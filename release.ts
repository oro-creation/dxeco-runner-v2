import { Command } from "jsr:@cliffy/command@1.0.0-rc.4";
import { exec } from "npm:@actions/exec";
import ky from "npm:ky";

/**
 * https://docs.github.com/ja/rest/releases/assets?apiVersion=2022-11-28#list-release-assets
 *
 * Deno で `@octokit/core` を使うと
 * ```txt
 * Uncaught (in promise) HttpError: Not Found - https://docs.github.com/rest
 * ```
 * エラーが発生してしまうので fetch を使って実装
 */
const listReleaseAssets = async (parameter: {
  githubRepository: string;
  releaseId: number;
  githubToken: string;
}): Promise<
  ReadonlyArray<{ readonly id: number; readonly name: string }>
> => {
  return await (await ky.get(
    `https://api.github.com/repos/${parameter.githubRepository}/releases/${parameter.releaseId}/assets`,
    {
      headers: {
        Authorization: `Bearer ${parameter.githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  )).json();
};

/**
 * https://docs.github.com/ja/rest/releases/assets?apiVersion=2022-11-28#delete-a-release-asset
 * Deno で `@octokit/core` を使うと
 * ```txt
 * Uncaught (in promise) HttpError: Not Found - https://docs.github.com/rest
 * ```
 * エラーが発生してしまうので fetch を使って実装
 */
const deleteReleaseAsset = async (parameter: {
  readonly githubRepository: string;
  readonly githubToken: string;
  readonly assetId: number;
}): Promise<void> => {
  const response = await ky.delete(
    `https://api.github.com/repos/${parameter.githubRepository}/releases/assets/${parameter.assetId}`,
    {
      headers: {
        Authorization: `Bearer ${parameter.githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  const text = await response.text();
  console.log(text);
};

/**
 * https://docs.github.com/ja/rest/releases/assets?apiVersion=2022-11-28#upload-a-release-asset
 * Deno で `@octokit/core` を使うと
 * ```txt
 * Uncaught (in promise) HttpError: Not Found - https://docs.github.com/rest
 * ```
 * エラーが発生してしまうので fetch を使って実装
 */
const uploadReleaseAsset = async (parameter: {
  readonly githubRepository: string;
  readonly githubToken: string;
  readonly name: string;
  readonly releaseId: number;
  readonly body: Uint8Array;
}): Promise<void> => {
  await ky.post(
    `https://uploads.github.com/repos/${parameter.githubRepository}/releases/${parameter.releaseId}/assets`,
    {
      searchParams: {
        name: parameter.name,
      },
      headers: {
        Authorization: `Bearer ${parameter.githubToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/octet-stream",
      },
      body: parameter.body,
    },
  );
};

new Command().option(
  "--releaseId <value:integer>",
  "database id of the release.",
  { required: true },
).option(
  "--githubToken <value>",
  "",
  { required: true },
).env(
  "GITHUB_REPOSITORY <value>",
  "",
  { required: true },
).action(async ({ githubRepository, releaseId, githubToken }) => {
  const helpText = await new Deno.Command(Deno.execPath(), {
    args: ["compile", "--help"],
  }).output();

  const valuesText = /--target <target>[\w\W]+?\[possible values:([^\]]+)/gu
    .exec(
      new TextDecoder().decode(helpText.stdout),
    )?.[1];

  if (valuesText === undefined) {
    throw new Error("Failed to parse target possible values");
  }
  const possibleValues = valuesText.split(",").map((value) => value.trim());

  const assets = await listReleaseAssets({
    githubRepository,
    releaseId,
    githubToken,
  });

  for (const target of possibleValues) {
    await exec(Deno.execPath(), [
      "compile",
      "-A",
      "--unstable-worker-options",
      "--target",
      target,
      "--output",
      target,
      "./cli.ts",
    ]);

    const fileName = target.includes("windows") ? `${target}.exe` : target;

    const asset = assets.find((asset) => asset.name === fileName);
    if (asset !== undefined) {
      await deleteReleaseAsset({
        assetId: asset.id,
        githubRepository,
        githubToken,
      });
    }
    await uploadReleaseAsset({
      githubRepository,
      releaseId,
      githubToken,
      name: fileName,
      body: await Deno.readFile(fileName),
    });
  }
}).parse();
