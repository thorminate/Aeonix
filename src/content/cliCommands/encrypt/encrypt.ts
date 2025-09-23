import run from "package-run";
import CLICommand, {
  CLICommandArgs,
  CLIOption,
} from "../../../models/core/cliCommand.js";
import log from "../../../utils/log.js";
import { config } from "@dotenvx/dotenvx";

export default class EncryptCommand extends CLICommand {
  name: string = "encrypt";
  description: string = "Encrypts the .env file.";
  options: CLIOption<string, (raw: string) => string | undefined>[] = [];
  async execute({
    aeonix,
  }: CLICommandArgs<typeof this.options>): Promise<void> {
    log({
      header: "Encrypting .env file...",
      type: "Info",
    });

    await run({
      command: "encrypt",
      silent: true,
    });

    log({
      header: "Refreshing process.env...",
      type: "Info",
    });

    config();

    log({
      header: "Reloading aeonix variables...",
      type: "Info",
    });

    aeonix.reloadEnvironmentVars();

    log({
      header: "Done",
      type: "Info",
    });
  }
}
