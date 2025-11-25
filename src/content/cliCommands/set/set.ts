import CLICommand from "../../../models/cli/cliCommand.js";
import ms, { StringValue } from "ms";

export default new CLICommand({
  name: "set",
  description: "Sets a config value.",
  options: [],
  acceptsPrimaryArg: true,
  async execute({ primaryArgs, aeonix }) {
    const log = aeonix.logger.for("SetCLICommand");

    if (!primaryArgs[0]) {
      log.error("Missing argument, requires a config key");
      return;
    }

    switch (primaryArgs[0]) {
      case "tickRate": {
        if (!primaryArgs[1]) {
          log.error(
            "Missing argument, requires a parsable ms value (1s, 6h, 4w)"
          );
          return;
        }
        const int = ms(primaryArgs[1] as StringValue);
        if (!int) {
          log.error(
            "Invalid argument, requires a parsable ms value (1s, 6h, 4w)"
          );
          return;
        }
        aeonix.config.set("tickRate", int);
        aeonix.reloadTicker(aeonix.config.tickRate);

        log.info(`Set the tickrate to ${ms(int, { long: true })}`);
        break;
      }
      default: {
        log.error("Invalid config key");
        break;
      }
    }
  },
});
