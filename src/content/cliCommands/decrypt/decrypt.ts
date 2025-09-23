import run from "package-run";
import CLICommand, { CLIOption } from "../../../models/core/cliCommand.js";
import log from "../../../utils/log.js";

export default class EncryptCommand extends CLICommand {
  name: string = "decrypt";
  description: string = "Decrypts the .env file.";
  options: CLIOption<string, (raw: string) => string | undefined>[] = [];
  async execute(): Promise<void> {
    log({
      header: "Decrypting .env file...",
      type: "Info",
    });

    await run({
      command: "decrypt",
      silent: true,
    });

    log({
      header: "Done",
      type: "Info",
    });
  }
}
