import CLICommand from "#cli/cliCommand.js";
import renderTree, { Tree } from "#utils/treeRenderer.js";

export default new CLICommand({
  name: "help",
  description: "Displays a list of available commands.",
  options: [],
  acceptsPrimaryArg: false,
  async execute({ aeonix }) {
    const allCommands = Array.from(aeonix.cli.cache.values());
    const commandTree: Tree = {
      name: "Commands",
      children: allCommands.map((cmd) => ({
        name: cmd.name,
        description: cmd.description,
        children: cmd.options.map((option) => ({
          name: `--${option.name}`,
          description: option.description,
        })),
      })),
    };
    aeonix.logger.info(
      "HelpCLICommand",
      "All commands: ",
      renderTree(commandTree)
    );
  },
});
