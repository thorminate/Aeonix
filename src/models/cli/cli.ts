import path from "path";
import Aeonix from "../../aeonix.js";
import { fileURLToPath, pathToFileURL } from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import CLICommand, { CLIOption, CLIOptionResult } from "./cliCommand.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class CLI {
  aeonix: Aeonix;
  cache = new Map<string, CLICommand>();
  folder = path.join(__dirname, "..", "..", "content", "cliCommands");

  constructor(aeonix: Aeonix) {
    this.aeonix = aeonix;
  }

  async init() {
    const log = this.aeonix.logger.for("CLI");
    const folders = await getAllFiles(this.folder, true);

    for (const folder of folders) {
      const folderName = path.basename(folder);
      const filePath = path.resolve(folder, folderName + ".js");
      const fileUrl = pathToFileURL(filePath);

      const inst = (
        await import(
          fileUrl.toString() + "?t=" + Date.now() + "&debug=fromCliInit"
        )
      ).default as CLICommand;

      if (!inst) {
        log.warn(
          `CLI Command, ${folderName}, does not have a default import! Skipping...`
        );
        continue;
      }

      this.cache.set(inst.name, inst);
    }

    this.aeonix.rl.on("line", async (input: string) => {
      const inputArr: string[] = input.trim().split(" ");
      const firstOptionIndex: number = inputArr.findIndex((arg) =>
        arg.includes("--")
      );

      const command = inputArr[0]?.toLowerCase().trim();
      const primaryInputs = inputArr.slice(
        1,
        firstOptionIndex == -1 ? inputArr.length : firstOptionIndex
      );
      const options = inputArr.slice(
        firstOptionIndex == -1 ? 1 + primaryInputs.length : firstOptionIndex
      );
      const providedOptions: CLIOptionResult<CLIOption[]> = {};

      const commandToExecute = this.cache.get(command ?? "");

      if (!commandToExecute) {
        log.warn(`Command ${command} not found!`);
        this.aeonix.rl.prompt();
        return;
      }

      if (!commandToExecute.acceptsPrimaryArg && primaryInputs.length > 0) {
        log.warn(
          `Command ${command} does not accept a primary argument! Use --flags to pass options.`
        );
        return;
      }

      let currentOptionIndex = 0;

      // Generate option object from firstOptionIndex
      if (firstOptionIndex !== -1) {
        while (true) {
          const optionName = options[currentOptionIndex]?.trim().slice(2);
          if (!optionName) {
            continue;
          }

          const option = commandToExecute.options.find(
            (opt) => opt.name === optionName
          );

          if (!option) {
            log.warn(`Option ${optionName} not found in schema!`);
            return;
          }

          const nextArrElements = options.slice(currentOptionIndex + 1);
          let nextOptionIndex = nextArrElements.findIndex((arg) =>
            arg.includes("--")
          );

          let scheduledForStop = false;

          if (nextOptionIndex === -1) {
            nextOptionIndex = nextArrElements.length;
            scheduledForStop = true;
          }

          const optionValue = nextArrElements
            .slice(0, nextOptionIndex)
            .join(" ");

          const transformedValue = option.transform
            ? option.transform(optionValue)
            : optionValue;

          if (!transformedValue) {
            log.warn(`Invalid value for option ${optionName}!`);
            return;
          }

          providedOptions[optionName] = transformedValue;

          currentOptionIndex += nextOptionIndex + 1;

          if (scheduledForStop) {
            break;
          }
        }
      }

      try {
        await commandToExecute.execute({
          aeonix: this.aeonix,
          options: providedOptions,
          primaryArgs: primaryInputs,
        });
      } catch (e) {
        log.error(`Error executing command ${command}`, e);
        this.aeonix.rl.prompt();
        return;
      }

      this.aeonix.rl.prompt();
    });
    this.aeonix.rl.prompt();
  }
}
