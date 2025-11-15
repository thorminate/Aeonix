import { execSync } from "child_process";
import CLICommand from "../../../models/cli/cliCommand.js";
import log from "../../../utils/log.js";
import { rmSync } from "fs";

export default new CLICommand({
  name: "refresh",
  description: "Refreshes all caches and recompiles the Aeonix's source code.",
  options: [],
  acceptsPrimaryArg: false,
  execute: async ({ aeonix }) => {
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

    log({
      header: "Refreshing caches",
      processName: "CLI",
      type: "Info",
    });

    await aeonix.fullSave();

    await aeonix.refreshCaches();

    log({
      header: "Done",
      type: "Info",
    });
  },
});
