import run from "package-run";
import CLICommand from "../../../models/cli/cliCommand.js";
import { config } from "@dotenvx/dotenvx";

export default new CLICommand({
  name: "encrypt",
  description: "Encrypts the .env file.",
  acceptsPrimaryArg: false,
  options: [],
  async execute({ aeonix }) {
    const log = aeonix.logger.for("EncryptCLICommand");
    log.info("Encrypting .env file...");

    await run({
      command: "encrypt",
      silent: true,
    });

    log.info("Reloading environment variables...");

    config();

    aeonix.reloadEnvironmentVars();

    log.info("Done!");
  },
});
