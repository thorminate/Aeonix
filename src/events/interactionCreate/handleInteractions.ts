import {
  ButtonInteraction,
  CacheType,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  MentionableSelectMenuInteraction,
  MessageFlags,
  ModalSubmitInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
  RoleSelectMenuInteraction,
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "discord.js";
import Player from "../../models/player/utils/player.js";
import log from "../../utils/log.js";
import Event from "../../models/core/event.js";
import Environment from "../../models/environment/environment.js";
import Aeonix from "../../aeonix.js";

type AnyInteraction<CT extends CacheType> = ButtonInteraction<CT> &
  ChannelSelectMenuInteraction<CT> &
  ChatInputCommandInteraction<CT> &
  MentionableSelectMenuInteraction<CT> &
  ModalSubmitInteraction<CT> &
  RoleSelectMenuInteraction<CT> &
  StringSelectMenuInteraction<CT> &
  UserSelectMenuInteraction<CT>;

export default new Event<"interactionCreate">({
  callback: async ({ args: [context], aeonix }) => {
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

    const id =
      context.isAnySelectMenu() || context.isButton() || context.isModalSubmit()
        ? context.customId
        : context.commandName;

    const interaction =
      type === "button"
        ? await aeonix.buttons.get(id)
        : type === "channelSelectMenu"
        ? await aeonix.channelSelectMenus.get(id)
        : type === "command"
        ? await aeonix.commands.get(id)
        : type === "mentionableSelectMenu"
        ? await aeonix.mentionableSelectMenus.get(id)
        : type === "modal"
        ? await aeonix.modals.get(id)
        : type === "roleSelectMenu"
        ? await aeonix.roleSelectMenus.get(id)
        : type === "stringSelectMenu"
        ? await aeonix.stringSelectMenus.get(id)
        : type === "userSelectMenu"
        ? await aeonix.userSelectMenus.get(id)
        : undefined;

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
      player = await aeonix.players.get(context.user.id);

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
        aeonix,
      } as {
        error: never;
        context: AnyInteraction<CacheType>;
        player: Player;
        environment: Environment;
        aeonix: Aeonix;
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
