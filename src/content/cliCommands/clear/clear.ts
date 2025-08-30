import CLICommand, { CLIOption } from "../../../models/core/cliCommand.js";
import log from "../../../utils/log.js";

export default class ClearCommand extends CLICommand {
  name: string = "clear";
  description: string = "Clears the console. (Log files are not affected)";
  options: CLIOption[] = [];
  acceptsPrimaryArg: boolean = false;
  async execute(): Promise<void> {
    log({
      header: "Clearing console",
      processName: "CLI",
      type: "Info",
    });
    process.stdout.write("\x1B[2J\x1B[0f");
    console.clear();
  }
}
