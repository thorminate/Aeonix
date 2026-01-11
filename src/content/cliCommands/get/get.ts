import CLICommand from "#cli/cliCommand.js";

export default new CLICommand({
  name: "get",
  description: "Gets a config value.",
  options: [],
  acceptsPrimaryArg: true,
  execute: async ({ primaryArgs, aeonix }) => {
    const log = aeonix.logger.for("GetCLICommand");
    if (!primaryArgs[0]) {
      log.error("Missing argument, requires a config key");
      return;
    }
    if (primaryArgs[0] === "time") {
      log.info(
        `Got current time:\n Time: ${aeonix.time.currentTime}\n Day: ${aeonix.time.currentDay}\n Month: ${aeonix.time.currentMonth}\n Year: ${aeonix.time.currentYear}`
      );
      return;
    }

    if (!(primaryArgs[0] in aeonix.config)) {
      log.error("Invalid config key");
      return;
    }

    log.info(
      `Got config value ${primaryArgs[0]}`,
      aeonix.config[primaryArgs[0] as keyof typeof aeonix.config] as unknown
    );
  },
});
