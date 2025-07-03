import {
  BaseInteraction,
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import Environment from "../../models/environment/environment.js";
import Interaction, {
  ButtonContext,
  InteractionTypes,
  SeeInteractionErrorPropertyForMoreDetails_1,
  SeeInteractionErrorPropertyForMoreDetails_2,
  SeeInteractionErrorPropertyForMoreDetails_3,
} from "../../models/core/interaction.js";
import aeonix from "../../index.js";

export async function findLocalButtons(useCache = true) {
  if (useCache) {
    return [...aeonix.buttons.values()];
  }

  const localButtons: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "button"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const buttonFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "buttons")
  );

  for (const buttonFile of buttonFiles) {
    const filePath = path.resolve(buttonFile);
    const fileUrl = url.pathToFileURL(filePath);
    const buttonObject: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "button"
    > = (await import(fileUrl.toString())).default;

    localButtons.push(buttonObject);
  }

  return localButtons;
}

export async function findLocalChannelSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.channelSelectMenus.values()];
  }

  const localChannelSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "channelSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const channelSelectMenuFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "channelSelectMenus")
  );

  for (const channelSelectMenuFile of channelSelectMenuFiles) {
    const filePath = path.resolve(channelSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const channelSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "channelSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localChannelSelectMenus.push(channelSelectMenu);
  }

  return localChannelSelectMenus;
}

export async function findLocalCommands(useCache = true) {
  if (useCache) {
    return [...aeonix.commands.values()];
  }

  const localCommands: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "command"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "commands")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "command"
    > = (await import(fileUrl.toString())).default;

    localCommands.push(commandObject);
  }

  return localCommands;
}

export async function findLocalMentionableSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.mentionableSelectMenus.values()];
  }

  const localMentionableSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "mentionableSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const mentionableSelectMenuFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "mentionableSelectMenus")
  );

  for (const mentionableSelectMenuFile of mentionableSelectMenuFiles) {
    const filePath = path.resolve(mentionableSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const mentionableSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "mentionableSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localMentionableSelectMenus.push(mentionableSelectMenu);
  }

  return localMentionableSelectMenus;
}

export async function findLocalModals(useCache = true) {
  if (useCache) {
    return [...aeonix.modals.values()];
  }

  const localModals: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "modal"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const modalFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "modals")
  );

  for (const modalFile of modalFiles) {
    const filePath = path.resolve(modalFile);
    const fileUrl = url.pathToFileURL(filePath);
    const modal: Interaction<boolean, boolean, boolean, boolean, "modal"> = (
      await import(fileUrl.toString())
    ).default;

    localModals.push(modal);
  }

  return localModals;
}

export async function findLocalRoleSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.roleSelectMenus.values()];
  }

  const localRoleSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "roleSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const roleSelectMenuFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "roleSelectMenus")
  );

  for (const roleSelectMenuFile of roleSelectMenuFiles) {
    const filePath = path.resolve(roleSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const roleSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "roleSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localRoleSelectMenus.push(roleSelectMenu);
  }

  return localRoleSelectMenus;
}

export async function findLocalStringSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.stringSelectMenus.values()];
  }

  const localStringSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "stringSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const stringSelectMenuFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "stringSelectMenus")
  );

  for (const stringSelectMenuFile of stringSelectMenuFiles) {
    const filePath = path.resolve(stringSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const stringSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "stringSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localStringSelectMenus.push(stringSelectMenu);
  }

  return localStringSelectMenus;
}

export async function findLocalUserSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.userSelectMenus.values()];
  }

  const localUserSelectMenus: Interaction<
    boolean,
    boolean,
    boolean,
    boolean,
    "userSelectMenu"
  >[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const userSelectMenuFiles = await getAllFiles(
    path.join(__dirname, "..", "..", "content", "userSelectMenus")
  );

  for (const userSelectMenuFile of userSelectMenuFiles) {
    const filePath = path.resolve(userSelectMenuFile);
    const fileUrl = url.pathToFileURL(filePath);
    const userSelectMenu: Interaction<
      boolean,
      boolean,
      boolean,
      boolean,
      "userSelectMenu"
    > = (await import(fileUrl.toString())).default;

    localUserSelectMenus.push(userSelectMenu);
  }

  return localUserSelectMenus;
}

export default new Event<BaseInteraction>({
  callback: async ({ context }) => {
    let type = "";

    if (context.isButton()) {
      type = "button";
    } else if (context.isChannelSelectMenu()) {
      type = "channelSelectMenu";
    } else if (context.isCommand()) {
      type = "command";
    } else if (context.isMentionableSelectMenu()) {
      type = "mentionableSelectMenu";
    } else if (context.isModalSubmit()) {
      type = "modal";
    } else if (context.isRoleSelectMenu()) {
      type = "roleSelectMenu";
    } else if (context.isStringSelectMenu()) {
      type = "stringSelectMenu";
    } else if (context.isUserSelectMenu()) {
      type = "userSelectMenu";
    } else {
      return;
    }

    if (!context.inGuild()) {
      await context.reply({
        content: "Bot needs to be in a guild to function properly",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const localInteractions =
      type === "button"
        ? await findLocalButtons()
        : type === "channelSelectMenu"
        ? await findLocalChannelSelectMenus()
        : type === "command"
        ? await findLocalCommands()
        : type === "mentionableSelectMenu"
        ? await findLocalMentionableSelectMenus()
        : type === "modal"
        ? await findLocalModals()
        : type === "roleSelectMenu"
        ? await findLocalRoleSelectMenus()
        : type === "stringSelectMenu"
        ? await findLocalStringSelectMenus()
        : type === "userSelectMenu"
        ? await findLocalUserSelectMenus()
        : undefined;

    if (!localInteractions) {
      log({
        header:
          "An interaction was received but no local content were found matching it.",
        processName: "InteractionHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    const interaction:
      | Interaction<boolean, boolean, boolean, boolean, InteractionTypes>
      | undefined = localInteractions.find(
      (
        interaction: Interaction<
          boolean,
          boolean,
          boolean,
          boolean,
          InteractionTypes
        >
      ) => {
        return type === "command"
          ? (interaction.data as SlashCommandBuilder).name ===
              (context as ChatInputCommandInteraction).commandName
          : "data" in interaction.data
          ? "custom_id" in interaction.data.data
            ? interaction.data.data.custom_id ===
              (context as ButtonInteraction).customId
            : false
          : false;
      }
    );

    if (!interaction) return;

    if (interaction.acknowledge) {
      await context.deferReply({
        flags: interaction.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!context.member) {
      log({
        header: "Interaction member is falsy",
        processName: "ButtonHandler",
        payload: context,
        type: "Error",
      });
      return;
    }

    if (interaction.adminOnly) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (interaction.acknowledge) {
          await context.editReply({
            content: "Only administrators can use this.",
          });
          return;
        } else {
          context.reply({
            content: "Only administrators can use this.",
          });
          return;
        }
      }
    }

    if (interaction.permissionsRequired?.length) {
      for (const permission of interaction.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          if (interaction.acknowledge) {
            await context.editReply({
              content: "You don't have permissions to use this.",
            });
            return;
          } else {
            context.reply({
              content: "You don't have permissions to use this.",
            });
            return;
          }
        }
      }
    }

    let player: Player | undefined;

    let environment: Environment | undefined;

    if (interaction.passPlayer) {
      player = await Player.find(context.user.id);

      if (!player) {
        if (interaction.acknowledge) {
          await context.editReply({
            content: "You aren't a player. Register with the `/init` command.",
          });
          return;
        } else {
          context.reply({
            content: "You aren't a player. Register with the `/init` command.",
          });
          return;
        }
      }

      if (interaction.environmentOnly) {
        if (player.location.channelId !== context.channelId) {
          if (interaction.acknowledge) {
            await context.editReply({
              content: "You must be in your environment channel to run this.",
            });
            return;
          } else {
            await context.reply({
              content: "You must be in your environment channel to run this.",
            });
            return;
          }
        }
      }

      if (interaction.passEnvironment) {
        environment = await player.fetchEnvironment().catch(() => undefined);
      }
    }

    await interaction
      .callback({
        context,
        player,
        environment,
      } as {
        error: never;
        context: ButtonInteraction<CacheType> &
          ButtonContext &
          SeeInteractionErrorPropertyForMoreDetails_1 &
          SeeInteractionErrorPropertyForMoreDetails_2 &
          SeeInteractionErrorPropertyForMoreDetails_3;
        player: Player;
        environment: Environment;
      })
      .catch((e: unknown) => {
        try {
          interaction.onError(e);
        } catch (e) {
          log({
            header: "Error in interaction error handler",
            processName: "InteractionHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e) =>
    log({
      header: "An interaction could not be handled correctly",
      processName: "InteractionHandler",
      payload: e,
      type: "Error",
    }),
});
