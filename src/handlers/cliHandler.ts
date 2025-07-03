import Aeonix from "../aeonix.js";
import { blue, blueBright, redBright } from "ansis";
import { execSync } from "child_process";
import { log } from "console";
import { rmSync } from "fs";
import path from "path";

export default async (aeonix: Aeonix) => {
  aeonix.rl.on("line", async (input: string) => {
    const inputArr: string[] = input.split(" ");
    const firstOptionIndex: number = inputArr.findIndex((arg) =>
      arg.includes("--")
    );

    // When a line is typed.
    switch (inputArr[0]?.toLowerCase().trim()) {
      case "help": {
        log({
          header: "Help Command",
          processName: "CLI",
          payload: [
            "'exit' to quit and turn off Aeonix",
            "'help' for help",
            "'log <header> [options]' options are --payload and --folder",
            "'clear' to clear the console",
            "'tsc' to recompile the bot's typescript files",
            "'info' to get information about the bot",
          ],
          type: "Info",
        });
        break;
      }

      case "clear": {
        log({
          header: "Clearing console",
          processName: "CLI",
          type: "Info",
        });
        process.stdout.write("\x1B[2J\x1B[0f");
        console.clear();
        break;
      }

      case "exit": {
        // Exit aeonix.
        await aeonix.exit();
        break;
      }

      case "log": {
        // Log the inputs
        if (firstOptionIndex === -1) {
          log({
            header: inputArr.slice(1).join(" "),
            processName: "CLI",
            type: "Info",
          });
          return;
        }
        const header: string = inputArr.slice(1, firstOptionIndex).join(" ");

        const options: string[] = inputArr.slice(firstOptionIndex);
        let payload: string = "";
        let processName: string = "";
        let type:
          | "Info"
          | "Warn"
          | "Error"
          | "Fatal"
          | "Verbose"
          | "Debug"
          | "Silly" = "Info";
        for (let i = 0; i < options.length; i++) {
          if (options[i] === "--payload") {
            for (
              let j = i + 1;
              j < options.length &&
              options[j] != "--processName" &&
              options[j] != "--type";
              j++
            ) {
              payload += options[j];
            }
          } else if (options[i] === "--processName") {
            for (
              let j = i + 1;
              j < options.length &&
              options[j] != "--payload" &&
              options[j] != "--type";
              j++
            ) {
              processName += options[j];
            }
          } else if (options[i] === "--type") {
            if (
              options[i + 1] !== "Fatal" &&
              options[i + 1] !== "Error" &&
              options[i + 1] !== "Warn" &&
              options[i + 1] !== "Info" &&
              options[i + 1] !== "Verbose" &&
              options[i + 1] !== "Debug" &&
              options[i + 1] !== "Silly"
            ) {
              log({
                header: "Invalid type: " + options[i + 1],
                processName: "CLI",
                type: "Warn",
              });
              return;
            }
            type = options[i + 1] as
              | "Info"
              | "Warn"
              | "Error"
              | "Fatal"
              | "Verbose"
              | "Debug"
              | "Silly";
          }
        }
        log({
          header,
          payload,
          processName,
          type,
        });
        break;
      }

      case "tsc": {
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
        break;
      }

      case "info": {
        const deps = aeonix.packageJson.dependencies;
        log({
          header: "Info",
          processName: "CLI",
          payload: [
            blue`Version: ` + blueBright(aeonix.packageJson.version),
            blue`Git hash: ` +
              blueBright(
                execSync("git rev-parse --short HEAD").toString().trim()
              ),
            blue`Installed at: ` +
              blueBright(path.join(import.meta.url, "..").slice(8)),
            " ",
            redBright`Dependencies:`,
            "  Node.js: " + process.version,
            `  Discord.js: ${deps["discord.js"].replace("^", "v")}`,
            `  Mongoose: ${deps.mongoose.replace("^", "v")}`,
            `  Dotenvx: ${deps["@dotenvx/dotenvx"].replace("^", "v")}`,
            `  Ansis: ` + deps.ansis.replace("^", "v"),
            `  TypeScript: ${deps.typescript.replace("^", "v")}`,
            " ",
          ],
          type: "Info",
        });
        break;
      }

      default: {
        // Invalid command handling.
        log({
          header: "Invalid command: " + input,
          processName: "CLI",
          payload: ["'exit' to quit and turn off Aeonix, or 'help' for help"],
          type: "Warn",
        });
        break;
      }
    }

    aeonix.rl.prompt();
  });
  aeonix.rl.prompt();
};
