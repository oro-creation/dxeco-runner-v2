import { exec } from "npm:@actions/exec";

function getTagNameOrRef(): string {
  const githubRef = Deno.env.get("GITHUB_REF");
  if (githubRef === undefined) {
    throw new Error("GITHUB_REF is not set");
  }
  return /^refs\/tags\/(.+)$/u.exec(githubRef)?.[1] ?? githubRef;
}

async function getOrCreateReleaseAndRelease(props: {
  tagNameOrRef: string;
  repositoryOwner: string;
  repositoryName: string;
}): Promise<{ releaseId: string; assets?: ReadonlyMap<string, string> }> {
  const response = await octokit.graphql<{
    repository: null | {
      id: string;
      releaseAssets: {
        nodes: ReadonlyArray<{
          id: string;
          name: string;
        }>;
      };
    };
  }>(
    `
query ($owner: String!, $name: String!) {
  repository(owner: $owner, name: $name) {
    release(tagName: "") {
      id
      releaseAssets(first: 100) {
        nodes {
          id
          name
        }
      }
    }
  }
}
`,
    {
      owner: repositoryOwner,
      repo: repositoryName,
    },
  );
  if (response.repository !== null) {
    return {
      releaseId: response.repository.id,
      assets: new Map(
        response.repository.releaseAssets.nodes.map((asset) => [
          asset.name,
          asset.id,
        ]),
      ),
    };
  }
  console.log(`not found release by tag (${tagNameOrRef}) creating...`);
  const release = await octokit.rest.repos.createRelease({
    owner: props.repositoryOwner,
    repo: props.repositoryName,
    tag_name: tagNameOrRef,
    make_latest: "true",
    generate_release_notes: true,
  });
  return { releaseId: release.data.id };
}

async function uploadOrUpdateReleaseAsset(props: {
  releaseId: number;
  repositoryOwner: string;
  repositoryName: string;
  name: string;
}): Promise<void> {
  await octokit.rest.repos.getReleaseAsset({
    owner: props.repositoryOwner,
    repo: props.repositoryName,
    release_id: props.releaseId,
    name: "sample",
  });
  await octokit.rest.repos.uploadReleaseAsset({
    owner: props.repositoryOwner,
    repo: props.repositoryName,
    release_id: props.releaseId,
    name: "sample",
    data: "only text?",
  });
}

const tagNameOrRef = getTagNameOrRef();
console.log("tagNameOrRef", tagNameOrRef);

const helpText = await new Deno.Command(Deno.execPath(), {
  args: ["compile", "--help"],
}).output();

const valuesText = /--target <target>[\w\W]+?\[possible values:([^\]]+)/gu.exec(
  new TextDecoder().decode(helpText.stdout),
)?.[1];

if (valuesText === undefined) {
  throw new Error("Failed to parse target possible values");
}
const possibleValues = valuesText.split(",").map((value) => value.trim());

for (const target of possibleValues) {
  await exec(Deno.execPath(), [
    "compile",
    "--target",
    target,
    "./cli.ts",
    "--output",
    // windows の場合はファイル名末尾に exe が付く
    target,
  ]);
}
const githubToken = Deno.env.get("GITHUB_TOKEN");
if (githubToken === undefined) {
  throw new Error("GITHUB_TOKEN is not set");
}
const octokit = getOctokit(githubToken);
const repositoryOwner = Deno.env.get("GITHUB_REPOSITORY_OWNER");
if (repositoryOwner === undefined) {
  throw new Error("GITHUB_REPOSITORY_OWNER is not set");
}
const repositoryName = Deno.env.get("GITHUB_REPOSITORY_NAME");
if (repositoryName === undefined) {
  throw new Error("GITHUB_REPOSITORY_NAME is not set");
}

const readme = await octokit.rest.repos.getReadme({
  owner: repositoryOwner,
  repo: repositoryName,
});
console.log("readme", readme);

await uploadOrUpdateReleaseAsset({
  repositoryOwner: repositoryOwner,
  repositoryName: repositoryName,
  releaseId: await getOrCreateRelease({
    repositoryName,
    repositoryOwner,
    tagNameOrRef,
  }),
});
