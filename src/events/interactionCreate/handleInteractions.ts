import {
  ButtonInteraction,
  CacheType,
  ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  SlashCommandBuilder,
  Interaction as DJSInteraction,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event from "../../models/core/event.js";
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
    return [...aeonix.buttons.cache.values()];
  }

  return await aeonix.buttons.loadAll();
}

export async function findLocalChannelSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.channelSelectMenus.cache.values()];
  }

  return await aeonix.channelSelectMenus.loadAll();
}

export async function findLocalCommands(useCache = true) {
  if (useCache) {
    return [...aeonix.commands.cache.values()];
  }

  return await aeonix.commands.loadAll();
}

export async function findLocalMentionableSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.mentionableSelectMenus.cache.values()];
  }

  return await aeonix.mentionableSelectMenus.loadAll();
}

export async function findLocalModals(useCache = true) {
  if (useCache) {
    return [...aeonix.modals.cache.values()];
  }

  return await aeonix.modals.loadAll();
}

export async function findLocalRoleSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.roleSelectMenus.cache.values()];
  }

  return await aeonix.roleSelectMenus.loadAll();
}

export async function findLocalStringSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.stringSelectMenus.cache.values()];
  }

  return await aeonix.stringSelectMenus.loadAll();
}

export async function findLocalUserSelectMenus(useCache = true) {
  if (useCache) {
    return [...aeonix.userSelectMenus.cache.values()];
  }

  return await aeonix.userSelectMenus.loadAll();
}

export default new Event<[data: DJSInteraction<CacheType>]>({
  callback: async ({ args: [context] }) => {
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
      | Interaction<InteractionTypes, boolean, boolean, boolean, boolean>
      | undefined = localInteractions.find(
      (
        interaction: Interaction<
          InteractionTypes,
          boolean,
          boolean,
          boolean,
          boolean
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

    if (
      interaction.acknowledge === true ||
      interaction.ephemeral === undefined
    ) {
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

    if (interaction.adminOnly === true) {
      if (
        !(context.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        if (
          interaction.acknowledge === true ||
          interaction.ephemeral === undefined
        ) {
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
          if (
            interaction.acknowledge === true ||
            interaction.ephemeral === undefined
          ) {
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
        if (
          interaction.acknowledge === true ||
          interaction.ephemeral === undefined
        ) {
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
          if (
            interaction.acknowledge === true ||
            interaction.ephemeral === undefined
          ) {
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
