import CLICommand, { CLICommandArgs } from "../../../models/core/cliCommand.js";
import log, { LogType } from "../../../utils/log.js";
import tuplify from "../../../utils/tuplify.js";

export default class LogCommand extends CLICommand {
  name: string = "log";
  description: string = "Logs a message.";
  options = tuplify([
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
  ]);
  acceptsPrimaryArg: boolean = true;
  async execute({
    options,
    primaryArg,
  }: CLICommandArgs<typeof this.options>): Promise<void> {
    log({
      header: primaryArg || "Aeonix Log",
      payload: options["payload"] ?? undefined,
      processName: options["processName"] ?? undefined,
      type: (options["type"] ?? "Info") as LogType,
      folder: options["folder"] ?? undefined,
    });
  }
}
