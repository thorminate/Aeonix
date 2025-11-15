import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";

export default new CLICommand({
  name: "fetch",
  description: "Fetches data from the Aeonix's database.",
  options: [],
  acceptsPrimaryArg: true,
  execute: async ({ primaryArgs, aeonix }) => {
    if (!primaryArgs[0]) {
      log({
        header:
          "Missing argument, requires a fetchable type (player, environment)",
        type: "Error",
      });
      return;
    }
    switch (primaryArgs[0]) {
      case "player": {
        if (!primaryArgs[1]) {
          log({
            header: "Missing argument, requires a player ID",
            type: "Error",
          });
          return;
        }

        log({
          header: "Fetched player data",
          type: "Info",
          payload: await aeonix.players.get(primaryArgs[1]),
        });
        break;
      }
      case "env":
      case "environment": {
        if (!primaryArgs[1]) {
          log({
            header: "Missing argument, requires an environment type",
            type: "Error",
          });
          return;
        }

        log({
          header: "Fetched environment data",
          type: "Info",
          payload: await aeonix.environments.get(primaryArgs[1]),
        });
        break;
      }
    }
  },
});
