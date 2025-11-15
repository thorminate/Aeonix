import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";

export default new CLICommand({
  name: "clear",
  description: "Clears the console. (Log files are not affected)",
  options: [],
  acceptsPrimaryArg: false,
  async execute() {
    log({
      header: "Clearing console",
      processName: "CLI",
      type: "Info",
    });
    process.stdout.write("\x1B[2J\x1B[0f");
    console.clear();
  },
});
