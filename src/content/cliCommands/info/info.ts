import { blue, blueBright, redBright } from "ansis";
import CLICommand, {
  CLIOption,
  CLICommandArgs,
} from "../../../models/core/cliCommand.js";
import log from "../../../utils/log.js";
import { execSync } from "child_process";
import path from "path";

export default class InfoCommand extends CLICommand {
  name: string = "info";
  description: string = "Displays information about the Aeonix.";
  options: CLIOption[] = [];
  acceptsPrimaryArg: boolean = false;
  async execute({
    aeonix,
  }: CLICommandArgs<typeof this.options>): Promise<void> {
    const deps = aeonix.packageJson.dependencies;
    const devDeps = aeonix.packageJson.devDependencies;
    log({
      header: "Info",
      processName: "CLI",
      payload: [
        blue`Version: ` + blueBright(aeonix.packageJson.version),
        blue`Git hash: ` +
          blueBright(execSync("git rev-parse --short HEAD").toString().trim()),
        blue`Installed at: ` +
          blueBright(
            path.join(import.meta.url, "..", "..", "..", "..").slice(8)
          ),
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
        " ",
      ],
      type: "Info",
    });
  }
}
