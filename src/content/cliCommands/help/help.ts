import CLICommand, {
  CLICommandArgs,
  CLIOption,
} from "../../../models/core/cliCommand.js";
import log from "../../../utils/log.js";
import renderTree, { CommandTree } from "../../../utils/treeRenderer.js";
export default class HelpCommand extends CLICommand {
  name: string = "help";
  description: string = "Displays a list of available commands.";
  options: CLIOption[] = [];
  acceptsPrimaryArg: boolean = false;
  async execute({
    aeonix,
  }: CLICommandArgs<typeof this.options>): Promise<void> {
    const allCommands = Array.from(aeonix.cli.cache.values());
    const commandTree: CommandTree = {
      name: "Commands",
      children: allCommands.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        children: cmd.options.map((option) => ({
          name: `--${option.name}`,
          description: option.description,
        })) as CommandTree[],
      })),
    };
    log({
      header: "Help Command",
      processName: "CLI",
      payload: renderTree(commandTree),
      type: "Info",
    });
  }
}
