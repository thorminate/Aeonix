// Register, edit and delete commands
import areCommandsDifferent from "../../commands/areCommandsDifferent.js";
import getApplicationCommands from "../../commands/getApplicationCommands.js";
import getLocalCommands from "../../commands/getLocalCommands.js";
import log from "../../utils/log.js";
import Command from "../../commands/command.js";
import Event, { EventParams } from "../../models/Core/Event.js";

export default new Event({
  callback: async (event: EventParams) => {
    const localCommands: Command[] = await getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      event.aeonix,
      "1267928656877977670"
    );

    for (const localCommand of localCommands) {
      if (localCommand.data.name === undefined || !localCommand.data.name) {
        continue;
      }

      const { name, description, options } = localCommand.data.toJSON();

      const existingCommand = applicationCommands.cache.find(
        (cmd: any) => cmd.name === name
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          log({
            header: `Deleted command, ${name}`,
            processName: "CommandRegistrant",
            type: "Info",
          });
          continue;
        }
        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          log({
            header: `Edited command, ${name}`,
            processName: "CommandRegistrant",
            type: "Info",
          });
          continue;
        }
      } else {
        if (localCommand.deleted) {
          continue;
        }
        await applicationCommands.create({
          name,
          description,
          options,
        });

        log({
          header: `Registered command, ${name}`,
          processName: "CommandRegistrant",
          type: "Info",
        });
      }
    }
    log({
      header: "Commands A-OK",
      processName: "CommandRegistrant",
      type: "Info",
    });
  },
  onError: async (e) => {
    log({
      header: "Error registering commands",
      processName: "CommandRegistrant",
      payload: e,
      type: "Error",
    });
  },
});
