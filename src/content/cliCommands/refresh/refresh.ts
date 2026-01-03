import { execSync } from "child_process";
import CLICommand from "../../../models/cli/cliCommand.js";
import { rmSync } from "fs";

export default new CLICommand({
  name: "refresh",
  description: "Refreshes all caches and recompiles the Aeonix's source code.",
  options: [],
  acceptsPrimaryArg: false,
  execute: async ({ aeonix }) => {
    const log = aeonix.logger.for("RefreshCLICommand");
    log.info("Refreshing caches and recompiling...");

    rmSync("./dist", { recursive: true, force: true });
    try {
      execSync("tsc", { stdio: "inherit" });
    } catch (e) {
      log.error("Recompilation failed", e);
    }

    await aeonix.fullSave();

    await aeonix.refreshCaches();

    log.info("Done!");
  },
});
