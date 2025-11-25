import CLICommand from "../../../models/cli/cliCommand.js";

// TODO: convert all logs to use the new logger system

export default new CLICommand({
  name: "fetch",
  description: "Fetches data from the Aeonix's database.",
  options: [],
  acceptsPrimaryArg: true,
  execute: async ({ primaryArgs, aeonix }) => {
    const log = aeonix.logger.for("FetchCLICommand");
    if (!primaryArgs[0]) {
      log.error(
        "Missing argument, requires a fetchable type (player, environment)"
      );
      return;
    }
    switch (primaryArgs[0]) {
      case "player": {
        if (!primaryArgs[1]) {
          log.error("Missing argument, requires a player id");
          return;
        }

        log.info(
          "Fetched player data",
          await aeonix.players.get(primaryArgs[1])
        );
        break;
      }
      case "env":
      case "environment": {
        if (!primaryArgs[1]) {
          log.error("Missing argument, requires an environment type");
          return;
        }

        log.info(
          "Fetched environment data",
          await aeonix.environments.get(primaryArgs[1])
        );
        break;
      }
    }
  },
});
