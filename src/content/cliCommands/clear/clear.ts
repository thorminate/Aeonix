import aeonix from "../../../index.js";
import CLICommand from "../../../models/cli/cliCommand.js";

export default new CLICommand({
  name: "clear",
  description: "Clears the console. (Log files are not affected)",
  options: [],
  acceptsPrimaryArg: false,
  async execute() {
    aeonix.logger.info("ClearCLICommand", "Clearing console...");
    process.stdout.write("\x1B[2J\x1B[0f");
    console.clear();
  },
});
