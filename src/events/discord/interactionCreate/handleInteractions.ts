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
import Player from "../../../models/player/player.js";
import log from "../../../utils/log.js";
import DiscordEvent from "../../../models/core/event.js";
import Environment from "../../../models/environment/environment.js";
import Aeonix from "../../../aeonix.js";
import PlayerRef from "../../../models/player/utils/playerRef.js";

type AnyInteraction<CT extends CacheType> = ButtonInteraction<CT> &
  ChannelSelectMenuInteraction<CT> &
  ChatInputCommandInteraction<CT> &
  MentionableSelectMenuInteraction<CT> &
  ModalSubmitInteraction<CT> &
  RoleSelectMenuInteraction<CT> &
  StringSelectMenuInteraction<CT> &
  UserSelectMenuInteraction<CT>;

export default new DiscordEvent<"interactionCreate">({
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
        context.reply({
          content: "Only administrators can use this.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (interaction.permissionsRequired?.length) {
      for (const permission of interaction.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          context.reply({
            content: "You don't have permissions to use this.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }

    let player: Player | undefined;
    let playerRef: PlayerRef | undefined;

    let environment: Environment | undefined;

    if (interaction.passPlayer) {
      player = await aeonix.players.get(context.user.id);

      if (!player) {
        context.reply({
          content: `You aren't a player. Register with the </init:${
            (await aeonix.commands.get("init"))?.id
          }> command.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }

      if (interaction.environmentOnly) {
        if (player.location.channelId !== context.channelId) {
          await context.reply({
            content: `You must be in your [environment channel](https://discord.com/channels/${aeonix.guildId}/${player.location.channelId}) to run this.`,
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }

      if (interaction.passEnvironment) {
        environment = await player.fetchEnvironment().catch(() => undefined);
      }

      playerRef = player.toRef();
      player = undefined;
    }

    if (
      interaction.acknowledge === true ||
      interaction.ephemeral === undefined
    ) {
      await context.deferReply({
        flags: interaction.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    await interaction
      .callback({
        context,
        player: playerRef,
        environment,
        aeonix,
      } as {
        error: never;
        context: AnyInteraction<CacheType>;
        player: PlayerRef;
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
  onError: async (e, { args: [context] }) => {
    if (context.isRepliable() && !context.replied)
      if (!context.deferred)
        await context
          .reply({
            content:
              "An internal error has occurred, please submit a bug report explaining what you did to trigger this. " +
              e,
            flags: MessageFlags.Ephemeral,
          })
          .catch(() => undefined);
      else
        await context
          .editReply({
            content:
              "An internal error has occurred, please submit a bug report explaining what you did to trigger this. " +
              e,
          })
          .catch(() => undefined);
    log({
      header: "An interaction could not be handled correctly",
      processName: "InteractionHandler",
      payload: e,
      type: "Error",
    });
  },
});
