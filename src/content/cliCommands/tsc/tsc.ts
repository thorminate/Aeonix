import { rmSync } from "fs";
import CLICommand, { CLIOption } from "../../../models/core/cliCommand.js";
import log from "../../../utils/log.js";
import { execSync } from "child_process";

export default class TscCommand extends CLICommand {
  name: string = "tsc";
  description: string = "Recompiles the Aeonix's source code.";
  options: CLIOption[] = [];
  acceptsPrimaryArg: boolean = false;
  async execute(): Promise<void> {
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
  }
}
