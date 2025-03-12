// Register, edit and delete commands
import { Client } from "discord.js";
import areCommandsDifferent from "../../utils/areCommandsDifferent";
import getApplicationCommands from "../../utils/getApplicationCommands";
import getLocalCommands from "../../utils/getLocalCommands";
import log from "../../utils/log";
import { Event } from "../../handlers/eventHandler";

export default async (event: Event) => {
  try {
    // Define local commands and application commands
    const localCommands = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      event.bot,
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
          log({
            header: `Deleted command, ${name}`,
            type: "Info",
          });
          continue;
        }
        // if commands are different, then update it.
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          // log edited command
          log({
            header: `Edited command, ${name}`,
            type: "Info",
          });
          continue;
        }
      } else {
        // if command is set to be deleted, then skip registering it.
        if (localCommand.deleted) {
          log({
            header: `Skipped registering command, ${name}, as it is set to be deleted`,
            type: "Info",
          });
          continue;
        }
        // register command
        await applicationCommands.create({
          name,
          description,
          options,
        });

        log({
          header: `Registered command, ${name}`,
          type: "Info",
        });
      }
    }
  } catch (error) {
    log({
      header: "Error registering commands",
      payload: `${error}`,
      type: "Error",
    });
  }
};
