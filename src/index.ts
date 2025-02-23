// This is the entrypoint for the the script.
// This essentially divides the bot into multiple shards for more efficiency.
import fs from "node:fs";
import ReadLine from "node:readline"; // Then we import the readline module, this is used later for the CLI.
import { promisify } from "node:util";
import { ShardingManager } from "discord.js"; // First, we import the ShardingManager.
import log from "./utils/log";
import { config } from "dotenv";
config();

(async () => {
  if (!fs.existsSync("./.env")) {
    // If the .env file doesn't exist, we create it.

    log({
      header: ".env file not found, starting setup wizard",
      type: "Warn",
    });

    const rl = ReadLine.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = promisify(rl.question).bind(rl);

    const token = await prompt("Enter your token: ");
    fs.writeFileSync("./.env", `TOKEN="${token}"`);

    const mongodbUri = await prompt("Enter your MongoDB URI: ");
    fs.appendFileSync("./.env", `\nMONGODB_URI="${mongodbUri}"`);

    const playerRoleId = await prompt("What ID does the player role have? ");
    fs.appendFileSync("./.env", `\nPLAYER_ROLE="${playerRoleId}"`);

    const onboardingChannelId = await prompt(
      "What ID does the onboarding channel have? "
    );
    fs.appendFileSync(
      "./.env",
      `\nONBOARDING_CHANNEL="${onboardingChannelId}"`
    );

    const rulesChannelId = await prompt(
      "What ID does the rules channel have? "
    );
    fs.appendFileSync("./.env", `\nRULES_CHANNEL="${rulesChannelId}"`);

    rl.close();

    log({
      header: "Created .env file",
      type: "Info",
    });
  }

  setTimeout(() => {
    const manager = new ShardingManager("./dist/bot.js", {
      // Then we create the ShardingManager with the bot entrypoint.
      token: process.env.TOKEN, // We use the token from the environment variables.
      respawn: true, // We make sure the bot will respawn if it crashes.
    });

    function spawn() {
      // This function spawns the shards.
      manager.spawn().catch((error) => {
        log({
          header: "Shard failed to launch",
          payload: error,
          processName: "Shard Manager",
          type: "Fatal",
        });
      });
    }
    spawn();

    manager.once("shardCreate", (shard) => {
      // This event is fired when a shard is spawned.
      shard.once("ready", async () => {
        // This event is fired when the shard is ready.
        const rl = ReadLine.createInterface({
          input: process.stdin,
          output: process.stdout,
          prompt: "",
        });
        rl.setPrompt("> ");

        rl.on("line", async (input: string) => {
          // When a line is typed.
          switch (input.split(" ")[0]) {
            case "help":
              console.log(
                "'exit' to quit and turn off the bot",
                "\n'help' for help",
                "\n'log <header> [options]' options are --payload and --folder"
              );
              break;

            case "exit": // Exit the bot.
              log({
                header: "Shutting down",
                type: "Warn",
              });
              await manager.broadcastEval((c) => c.destroy());
              console.clear();
              process.exit(0);
              break;

            case "log": // Log the inputs
              const logArr: string[] = input.split(" ");
              const header: string = logArr[1];
              const options: string[] = logArr.slice(2);
              let payload: string = "";
              let folder: string = "";
              for (let i = 0; i < options.length; i++) {
                if (options[i] === "--payload") {
                  for (
                    let j = i + 1;
                    j < options.length && options[j] != "--folder";
                    j++
                  ) {
                    payload += options[j] + " ";
                  }
                } else if (options[i] === "--folder") {
                  for (
                    let j = i + 1;
                    j < options.length && options[j] != "--payload";
                    j++
                  ) {
                    folder += options[j] + " ";
                  }
                }
              }
              log({
                header,
                payload,
                folder,
              });
              break;

            default: // Invalid command handling.
              log({
                header: "Invalid command",
                type: "Warn",
              });
              console.log(
                "Use 'exit' to quit and turn off the bot, or 'help' for help"
              );
              break;
          }
          rl.prompt();
        });
        setTimeout(() => {
          rl.prompt();
        }, 2000);
      });
    });
  }, 2000);
})();
