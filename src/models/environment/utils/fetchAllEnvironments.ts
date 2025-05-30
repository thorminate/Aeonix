import getAllFiles from "../../../utils/getAllFiles.js";
import path from "path";
import url from "url";
import Environment from "../environment.js";

export default async function fetchAllEnvironments() {
  const files = getAllFiles("dist/environments", false);

  const environments = [];

  for (const file of files) {
    const filePath = path.resolve(file);
    const fileUrl = url.pathToFileURL(filePath);
    const environment: Environment = (await import(fileUrl.toString())).default;

    environments.push(environment);
  }

  return environments;
}
