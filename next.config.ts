import type { NextConfig } from "next";

const repositoryBasePath = "/carriers-fco-impact-explorer-react";
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGitHubPagesBuild ? repositoryBasePath : "",
  assetPrefix: isGitHubPagesBuild ? `${repositoryBasePath}/` : undefined,
};

export default nextConfig;
