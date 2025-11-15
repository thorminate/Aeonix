import path from "path";
import CLICommand from "../../../models/cli/cliCommand.js";
import log, { LogType } from "../../../utils/log.js";

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
      name: "folder",
      description: "The folder to save the log into.",
      transform: (value: string) =>
        path.isAbsolute(value) ? value : undefined,
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
  async execute({ options, primaryArgs }): Promise<void> {
    log({
      header: primaryArgs.join(" ") || "Aeonix Log",
      payload: options["payload"] ?? undefined,
      processName: options["processName"] ?? undefined,
      type: (options["type"] ?? "Info") as LogType,
      folder: options["folder"] ?? undefined,
    });
  },
});
