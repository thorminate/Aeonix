import run from "package-run";
import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";

export default new CLICommand({
  name: "decrypt",
  description: "Decrypts the .env file.",
  options: [],
  acceptsPrimaryArg: false,
  async execute() {
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
  },
});
