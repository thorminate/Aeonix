import CLICommand from "../../../models/cli/cliCommand.js";
import { LogType } from "../../../utils/log.js";

export default new CLICommand({
  name: "log",
  description: "Logs a message.",
  options: [
    {
      name: "payload",
      description: "The payload to log.",
    },
    {
      name: "processName",
      description: "The process name to log.",
    },
    {
      name: "type",
      description: "The log type.",
      transform: (value: string) => {
        const allowedTypes = [
          "Fatal",
          "Error",
          "Warn",
          "Info",
          "Verbose",
          "Debug",
          "Silly",
        ];
        return (allowedTypes.includes(value) ? value : "Info") as LogType;
      },
    },
  ] as const,
  acceptsPrimaryArg: true,
  async execute({ options, primaryArgs, aeonix }): Promise<void> {
    aeonix.logger.log(
      (options["type"] ?? "Info") as LogType,
      options["processName"] ?? "LogCLICommand",
      primaryArgs.join(" ") || "Aeonix Log",
      options["payload"] ?? ""
    );
  },
});
