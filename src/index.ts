// This is the entrypoint for the the script.
// This essentially divides the bot into multiple shards for more efficiency.
import { ShardingManager } from "discord.js"; // First, we import the ShardingManager.
import * as ReadLine from "node:readline"; // Then we import the readline module, this is used later for the CLI.

const manager = new ShardingManager("./dist/src/bot.js", {
  // Then we create the ShardingManager with the bot entrypoint.
  token: process.env.TOKEN, // We use the token from the environment variables.
  respawn: true, // We make sure the bot will respawn if it crashes.
});

manager.on("shardCreate", (shard) => {
  // This event is fired when a shard is spawned.
  shard.on("spawn", () => {
    shard.on("ready", async () => {
      // This event is fired when the shard is ready.
      console.clear(); // Clear the console.
      console.log(
        `Logged in as ${await shard.fetchClientValue("user.tag")}!`,
        `\n   System Info:`,
        `\n     Running on ${await shard.fetchClientValue(
          "guilds.cache.size"
        )} server(s)!`,
        `\n     Running with ${await shard.fetchClientValue(
          "users.cache.size"
        )} member(s)!`,
        `\n     API Latency: ${await shard.fetchClientValue("ws.ping")}ms`,
        `\n     Shards: ${await shard.fetchClientValue("shard.count")}`
      ); // Log that the the information.

      const rl = ReadLine.createInterface({
        // Create the readline interface.
        input: process.stdin, // input
        output: process.stdout, // output
      });
      rl.setPrompt("> "); // Set the prompt.
      rl.prompt(); // Give the prompt.

      rl.on("line", (input: string) => {
        // When a line is typed.
        switch (
          input.split(" ")[0] // Switch on the first word in the line.
        ) {
          case "help": // Give info on the CLI commands.
            console.log(
              "'exit' to quit and turn off the bot",
              "\n'help' for help",
              "\n'clear' to clear the console",
              "\n'echo <text>' to echo text",
              "\n'eval <code>' to evaluate code"
            );
            break;

          case "clear": // Clear the console.
            console.clear();
            break;

          case "echo": // Echo the rest of the line.
            const echo = input.split(" ")[1];
            if (!echo) console.log("Nothing to echo");
            else console.log(echo);
            break;

          case "exit": // Exit the bot.
            console.log("Exit command received, shutting down...");
            rl.question("Are you sure? (y/n) ", (answer) => {
              if (answer.toLowerCase() === "y") {
                manager.broadcastEval((c) => c.destroy());
                setTimeout(() => {
                  console.clear();
                  process.exit();
                }, 1000);
              } else {
                console.log("Aborted.");
              }
            });
            break;

          default: // Invalid command handling.
            console.error("Invalid command");
            console.log(
              "Use 'exit' to quit and turn off the bot, or 'help' for help"
            );
            break;
        }

        rl.prompt(); // re-give the prompt.
      });
    });
  });
});

manager.spawn().catch((error) => {
  // Spawn the shards. Catch errors.
  console.error("The shard failed to launch:"); // Log the error.
  console.error(error.stack, error.message, error.name, error.cause, error); // Log the error.
});
