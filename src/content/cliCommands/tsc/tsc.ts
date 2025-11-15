import { rmSync } from "fs";
import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";
import { execSync } from "child_process";

export default new CLICommand({
  name: "tsc",
  description: "Recompiles the Aeonix's source code.",
  options: [],
  acceptsPrimaryArg: false,
  async execute() {
    log({
      header: "Recompiling",
      processName: "CLI",
      type: "Info",
    });

    rmSync("./dist", { recursive: true, force: true });
    try {
      execSync("tsc", { stdio: "inherit" });
    } catch (e) {
      log({
        header: "Recompilation failed",
        processName: "CLI",
        payload: e,
        type: "Error",
      });
    }
  },
});
