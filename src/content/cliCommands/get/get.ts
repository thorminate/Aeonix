import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";

export default new CLICommand({
  name: "get",
  description: "Gets a config value.",
  options: [],
  acceptsPrimaryArg: true,
  execute: async ({ primaryArgs, aeonix }) => {
    if (!primaryArgs[0]) {
      log({
        header: "Missing argument, requires a config key",
        type: "Error",
      });
      return;
    }
    if (!(primaryArgs[0] in aeonix.config)) {
      log({
        header: "Invalid config key",
        type: "Error",
      });
      return;
    }

    log({
      header: `Got config value ${primaryArgs[0]}`,
      payload: aeonix.config[
        primaryArgs[0] as keyof typeof aeonix.config
      ] as unknown,
    });
  },
});
