import { exec, getExecOutput } from "npm:@actions/exec";
import { getOctokit } from "npm:@actions/github";

console.log("env", Deno.env.toObject());

const helpText = await getExecOutput(Deno.execPath(), ["compile", "--help"]);

const valuesText = /--target <target>[\w\W]+?\[possible values:([^\]]+)/gu.exec(
  helpText.stdout
)?.[1];

if (valuesText === undefined) {
  throw new Error("Failed to parse target possible values");
}
const possibleValues = valuesText.split(",").map((value) => value.trim());

for (const target of possibleValues) {
  await exec(Deno.execPath(), ["compile", "--target", target]);
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

const response = await octokit.rest.repos.getReadme({
  owner: repositoryOwner,
  repo: repositoryName,
});
console.log(response);
