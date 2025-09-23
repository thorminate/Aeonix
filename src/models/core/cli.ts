import log from "../../utils/log.js";
import path from "path";
import Aeonix from "../../aeonix.js";
import { fileURLToPath, pathToFileURL } from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import CLICommand, { CLIOption, CLIOptionResult } from "./cliCommand.js";
import ConcreteConstructor from "./concreteConstructor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default class CLI {
  aeonix: Aeonix;
  cache = new Map<string, CLICommand>();
  folder = path.join(__dirname, "..", "..", "content", "cliCommands");

  constructor(aeonix: Aeonix) {
    this.aeonix = aeonix;
  }

  async init() {
    const folders = await getAllFiles(this.folder, true);

    for (const folder of folders) {
      const folderName = path.basename(folder);
      const filePath = path.resolve(folder, folderName + ".js");
      const fileUrl = pathToFileURL(filePath);

      const imported = (await import(fileUrl.toString()))
        .default as ConcreteConstructor<CLICommand>;

      if (!imported) {
        log({
          header: `CLI Command, ${folderName}, does not have a default import! Skipping...`,
          processName: "AeonixCLI",
          type: "Warn",
        });
        continue;
      }

      const inst = new imported();
      if (!inst) {
        log({
          header: `CLI Command, ${folderName}, does not return a constructible class! Skipping...`,
          processName: "AeonixCLI",
          type: "Warn",
        });
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
      const primaryInputArr = inputArr.slice(
        1,
        firstOptionIndex == -1 ? 2 : firstOptionIndex
      );

      const primaryInput = primaryInputArr.join(" ");
      const options = inputArr.slice(
        firstOptionIndex == -1 ? 1 + primaryInputArr.length : firstOptionIndex
      );
      const providedOptions: CLIOptionResult<CLIOption[]> = {};

      const commandToExecute = this.cache.get(command ?? "");

      if (!commandToExecute) {
        log({
          header: `Command ${command} not found!`,
          processName: "AeonixCLI",
          type: "Warn",
        });
        this.aeonix.rl.prompt();
        return;
      }

      if (
        commandToExecute.primaryArg === undefined &&
        primaryInput.length > 0
      ) {
        log({
          header: `Command ${command} does not accept a primary argument! Use --flags to pass options.`,
          processName: "AeonixCLI",
          type: "Warn",
        });
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
            log({
              header: `Option ${optionName} not found in schema!`,
              processName: "AeonixCLI",
              type: "Warn",
            });
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
            log({
              header: `Invalid value for option ${optionName}!`,
              processName: "AeonixCLI",
              type: "Warn",
            });
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
          primaryArg: primaryInput,
        });
      } catch (e) {
        log({
          header: `Error executing command ${command}`,
          processName: "AeonixCLI",
          payload: e,
          type: "Error",
        });
        this.aeonix.rl.prompt();
        return;
      }

      this.aeonix.rl.prompt();
    });
    this.aeonix.rl.prompt();
  }
}
