import log from "../../utils/log.js";
import Command from "../../utils/command.js";
import Event, { EventParams } from "../../models/Core/Event.js";
import path from "path";
import url from "url";
import { Aeonix } from "../../aeonix.js";
import { ApplicationCommand } from "discord.js";
import getAllFiles from "../../utils/getAllFiles.js";

export async function findLocalCommands() {
  let localCommands: Command[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "commands")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Command = (await import(fileUrl.toString())).default;

    localCommands.push(commandObject);
  }

  return localCommands;
}

async function getApplicationCommands(aeonix: Aeonix, guildId: string) {
  const applicationCommands = (await aeonix.guilds.fetch(guildId)).commands; // get global commands
  await applicationCommands.fetch(); // fetch commands
  return applicationCommands; // return commands
}

function areChoicesDifferent(existingChoices: any[], localChoices: any[]) {
  for (const localChoice of localChoices) {
    const existingChoice = existingChoices?.find(
      (choice: { name: any }) => choice.name === localChoice.name
    );

    if (!existingChoice) {
      return true;
    }

    if (localChoice.value !== existingChoice.value) {
      return true;
    }
  }
  return false;
}

function areOptionsDifferent(existingOptions: any[], localOptions: any[]) {
  // Define the areOptionsDifferent function.
  for (const localOption of localOptions) {
    // Loop through the localOptions array.
    const existingOption = existingOptions?.find(
      // Find the option in the existingOptions array.
      (option: any) => option.name === localOption.name // If the option name matches the localOption name, return true.
    );

    if (!existingOption) {
      // If the existingOption is not found, return true.
      return true;
    }

    if (
      localOption.description !== existingOption.description || // If the localOption description is different from the existingOption description, return true.
      localOption.type !== existingOption.type || // If the localOption type is different from the existingOption type, return true.
      (localOption.required || false) !== existingOption.required || // If the localOption required is different from the existingOption required, return true.
      (localOption.choices?.length || 0) !==
        (existingOption.choices?.length || 0) || // If the localOption choices length is different from the existingOption choices length, return true.
      areChoicesDifferent(
        // If the areChoicesDifferent function returns true, return true.
        localOption.choices || [],
        existingOption.choices || []
      )
    ) {
      return true;
    }
  }
  return false;
}

function areCommandsDifferent(
  existingCommand: ApplicationCommand,
  localCommand: Command
) {
  if (
    existingCommand.description !== localCommand.data.description ||
    existingCommand.options?.length !==
      (localCommand.data.options?.length || 0) ||
    areOptionsDifferent(
      existingCommand.options,
      localCommand.data.options || []
    )
  ) {
    return true;
  }

  return false;
}

export default new Event({
  callback: async (event: EventParams) => {
    const localCommands: Command[] = await findLocalCommands();
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
