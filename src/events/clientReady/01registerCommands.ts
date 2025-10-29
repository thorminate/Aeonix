import log from "../../utils/log.js";
import Event from "../../models/core/event.js";
import {
  ApplicationCommand,
  ApplicationCommandChoicesOption,
  ApplicationCommandOption,
  ApplicationCommandOptionBase,
} from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../models/core/interaction.js";
import Aeonix from "../../aeonix.js";

async function getApplicationCommands(aeonix: Aeonix, guildId: string) {
  const applicationCommands = (await aeonix.guilds.fetch(guildId)).commands; // get global commands
  await applicationCommands.fetch(); // fetch commands
  return applicationCommands; // return commands
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function areChoicesDifferent(existingChoices: any[], localChoices: any[]) {
  for (const localChoice of localChoices) {
    const existingChoice = existingChoices?.find(
      (choice: { name: string }) => choice.name === localChoice.name
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
function areOptionsDifferent(
  existingOptions: (ApplicationCommandOption & {
    nameLocalized?: string;
    descriptionLocalized?: string;
  })[],
  localOptions: ApplicationCommandOption[]
) {
  for (const localOption of localOptions) {
    const existingOption = existingOptions?.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (option: any) => option.name === localOption.name
    );

    if (!existingOption) {
      return true;
    }

    if (
      localOption.description !== existingOption.description ||
      localOption.type !== existingOption.type ||
      ((localOption as ApplicationCommandOptionBase).required || false) !==
        (existingOption as ApplicationCommandOptionBase).required ||
      ((localOption as ApplicationCommandChoicesOption).choices?.length ||
        0) !==
        ((existingOption as ApplicationCommandChoicesOption).choices?.length ||
          0) ||
      areChoicesDifferent(
        (
          localOption as ApplicationCommandChoicesOption & {
            choices?: unknown[];
          }
        ).choices || [],
        (
          existingOption as ApplicationCommandChoicesOption & {
            choices?: unknown[];
          }
        ).choices || []
      )
    ) {
      return true;
    }
  }
  return false;
}

function areCommandsDifferent(
  existingCommand: ApplicationCommand,
  localCommand: Interaction<
    InteractionTypes.Command,
    boolean,
    boolean,
    boolean,
    boolean
  >
) {
  if (
    existingCommand.description !== localCommand.data.description ||
    existingCommand.options?.length !==
      (localCommand.data.options?.length || 0) ||
    areOptionsDifferent(
      existingCommand.options,
      localCommand.data.options.map((option) => option.toJSON()) || []
    )
  ) {
    return true;
  }

  return false;
}

export default new Event<"ready">({
  callback: async ({ aeonix }) => {
    log({
      header: "Registering commands",
      processName: "CommandRegistrant",
      type: "Info",
    });

    const localCommands = await aeonix.commands.getAll();
    const applicationCommands = await getApplicationCommands(
      aeonix,
      aeonix.guildId
    );

    for (const localCommand of localCommands) {
      if (localCommand.data.name === undefined || !localCommand.data.name) {
        continue;
      }

      const { name, description, options } = localCommand.data.toJSON();

      const existingCommand = applicationCommands.cache.find(
        (cmd: ApplicationCommand) => cmd.name === name
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          applicationCommands.delete(existingCommand.id);
          log({
            header: `Deleting command, ${name}`,
            processName: "CommandRegistrant",
            type: "Info",
          });
          continue;
        }
        if (areCommandsDifferent(existingCommand, localCommand)) {
          applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });

          log({
            header: `Editing command, ${name}`,
            processName: "CommandRegistrant",
            type: "Info",
          });
        }
      } else {
        if (localCommand.deleted) {
          continue;
        }
        applicationCommands.create({
          name,
          description,
          options,
        });

        log({
          header: `Registering command, ${name}`,
          processName: "CommandRegistrant",
          type: "Info",
        });
      }

      localCommand.id = existingCommand?.id;

      aeonix.commands.set(localCommand);
    }

    for (const existingCommand of applicationCommands.cache.values()) {
      const isLocal = localCommands.some(
        (local) => local.data.name === existingCommand.name
      );

      if (!isLocal) {
        applicationCommands.delete(existingCommand.id);
        log({
          header: `Deleting stale command, ${existingCommand.name}`,
          processName: "CommandRegistrant",
          type: "Info",
        });

        continue;
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
