import CLICommand, { CLIOption } from "../../../models/core/cliCommand.js";
import log from "../../../utils/log.js";

export default class HelpCommand extends CLICommand {
  name: string = "help";
  description: string = "Displays a list of available commands.";
  options: CLIOption[] = [];
  acceptsPrimaryArg: boolean = false;
  async execute(): Promise<void> {
    log({
      header: "Help Command",
      processName: "CLI",
      payload: [
        "'exit' to quit and turn off Aeonix",
        "'help' for help",
        "'log <header> [options]' options are --payload and --folder",
        "'clear' to clear the console",
        "'tsc' to recompile the bot's typescript files",
        "'info' to get information about the bot",
      ],
      type: "Info",
    });
  }
}
