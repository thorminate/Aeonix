import { blue, blueBright, redBright } from "ansis";
import CLICommand from "../../../models/cli/cliCommand.js";
import { execSync } from "child_process";
import path from "path";

export default new CLICommand({
  name: "info",
  description: "Displays information about the Aeonix.",
  options: [],
  acceptsPrimaryArg: false,

  async execute({ aeonix }) {
    const deps = aeonix.packageJson.dependencies;
    const devDeps = aeonix.packageJson.devDependencies;
    aeonix.logger.info(
      "InfoCLICommand",
      `Aeonix ${aeonix.packageJson.version}`,

      blue`Version: ` + blueBright(aeonix.packageJson.version),
      blue`Git hash: ` +
        blueBright(execSync("git rev-parse --short HEAD").toString().trim()),
      blue`Installed at: ` +
        blueBright(path.join(import.meta.url, "..", "..", "..", "..").slice(8)),
      " ",
      redBright`Dependencies:`,
      "  Node.js: " + process.version,
      `  Discord.js: ${deps?.["discord.js"] || "N/A"}`,
      `  Mongoose: ${deps?.mongoose || "N/A"}`,
      `  Dotenvx: ${deps?.["@dotenvx/dotenvx"] || "N/A"}`,
      `  Ansis: ` + deps?.ansis || "N/A",
      `  TypeScript: ${deps?.typescript || "N/A"}`,
      `  Typegoose: ${deps?.["@typegoose/typegoose"] || "N/A"}`,
      `  Node Types: ${deps?.["@types/node"] || "N/A"}`,
      " ",
      blueBright`Dev Dependencies:`,
      `  ESLint: ${devDeps?.eslint || "N/A"}`,
      `  ESLint JS: ${devDeps?.["@eslint/js"] || "N/A"}`,
      `  TypeScript ESLint: ${devDeps?.["typescript-eslint"] || "N/A"}`,
      `  Globals: ${devDeps?.globals || "N/A"}`,
      " "
    );
  },
});
