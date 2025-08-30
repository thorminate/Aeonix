import CLICommand, {
  CLICommandArgs,
  CLIOption,
} from "../../../models/core/cliCommand.js";

export default class ExitCommand extends CLICommand {
  name: string = "exit";
  description: string = "Turns off the Aeonix.";
  options: CLIOption[] = [];
  acceptsPrimaryArg: boolean = false;
  async execute({
    aeonix,
  }: CLICommandArgs<typeof this.options>): Promise<void> {
    aeonix.exit();
  }
}
