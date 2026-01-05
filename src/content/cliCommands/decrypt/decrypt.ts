import run from "package-run";
import CLICommand from "#cli/cliCommand.js";
import aeonix from "#root/index.js";

export default new CLICommand({
  name: "decrypt",
  description: "Decrypts the .env file.",
  options: [],
  acceptsPrimaryArg: false,
  async execute() {
    const log = aeonix.logger.for("DecryptCLICommand");
    log.info("Decrypting .env file...");

    await run({
      command: "decrypt",
      silent: true,
    });

    log.info("Done!");
  },
});
