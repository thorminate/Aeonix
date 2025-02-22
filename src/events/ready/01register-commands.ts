// Register, edit and delete commands
import { Client } from "discord.js";
import areCommandsDifferent from "../../utils/areCommandsDifferent";
import getApplicationCommands from "../../utils/getApplicationCommands";
import getLocalCommands from "../../utils/getLocalCommands";
import log from "../../utils/log";

export default async (bot: Client) => {
  try {
    // Define local commands and application commands
    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      bot,
      "1267928656877977670"
    );

    // loop through all local commands
    for (const localCommand of localCommands) {
      if (localCommand.name === undefined || !localCommand.name) {
        continue;
      }

      const { name, description, options } = localCommand;

      // check if command already exists and store in a variable
      const existingCommand = await applicationCommands.cache.find(
        (cmd: any) => cmd.name === name
      );

      // if command exists, check if it's set to be deleted
      if (existingCommand) {
        if (localCommand.deleted) {
          // if it's set to be deleted, then delete it
          await applicationCommands.delete(existingCommand.id);
          console.log(`Deleted command "${name}".`);
          continue;
        }
        // if commands are different, then update it.
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          // log edited command
          console.log(`Edited command "${name}".`);
        }
      } else {
        // if command is set to be deleted, then skip registering it.
        if (localCommand.deleted) {
          console.log(
            `Skipping to register command "${name}" as its set to delete.`
          );
          continue;
        }
        // register command
        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`Registered command "${name}".`);
      }
    }
  } catch (error) {
    console.log(`There was an error: ${error}`); // Log the error
    log({
      header: "Error registering commands",
      payload: `${error}`,
      type: "error",
    });
  }
};
