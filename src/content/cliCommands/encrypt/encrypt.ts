import run from "package-run";
import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";
import { config } from "@dotenvx/dotenvx";

export default new CLICommand({
  name: "encrypt",
  description: "Encrypts the .env file.",
  acceptsPrimaryArg: false,
  options: [],
  async execute({ aeonix }) {
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
  },
});
