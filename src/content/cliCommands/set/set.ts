import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";
import ms, { StringValue } from "ms";

export default new CLICommand({
  name: "set",
  description: "Sets a config value.",
  options: [],
  acceptsPrimaryArg: true,
  async execute({ primaryArgs, aeonix }) {
    if (!primaryArgs[0]) {
      log({
        header: "Missing argument",
        processName: "CLI",
        type: "Error",
      });
    }

    switch (primaryArgs[0]) {
      case "tickRate": {
        if (!primaryArgs[1]) {
          log({
            header:
              "Missing argument, requires a parsable ms value (1s, 6h, 4w)",
            processName: "CLI",
            type: "Error",
          });
          return;
        }
        const int = ms(primaryArgs[1] as StringValue);
        if (!int) {
          log({
            header:
              "Invalid argument, requires a parsable ms value (1s, 6h, 4w)",
            processName: "CLI",
            type: "Error",
          });
          return;
        }
        aeonix.config.set("tickRate", int);
        aeonix.reloadTicker(aeonix.config.tickRate);

        log({
          header: `Set the tickrate to ${ms(int, { long: true })}`,
          processName: "CLI",
          type: "Info",
        });
        break;
      }
      default: {
        log({
          header: "Invalid argument",
          processName: "CLI",
          type: "Error",
        });
        break;
      }
    }
  },
});
