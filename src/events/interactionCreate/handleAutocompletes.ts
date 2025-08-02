import {
  CacheType,
  PermissionFlagsBits,
  PermissionsBitField,
  AutocompleteInteraction,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event from "../../models/core/event.js";
import Interaction from "../../models/core/interaction.js";

export default new Event<"interactionCreate">({
  callback: async ({ args: [context], aeonix }) => {
    if (!context.isAutocomplete()) {
      return;
    }

    if (!context.inGuild()) {
      await context.respond([
        {
          name: "You must be in a server to use this command.",
          value: "You must be in a server to use this command.",
        },
      ]);
      return;
    }

    const localInteractions = aeonix.commands.array();

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
      | Interaction<"command", boolean, boolean, boolean, boolean>
      | undefined = localInteractions.find(
      (
        interaction: Interaction<"command", boolean, boolean, boolean, boolean>
      ) => {
        return interaction.data.name === context.commandName;
      }
    );

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
        await context.respond([
          {
            name: "Only administrators can use this.",
            value: "Only administrators can use this.",
          },
        ]);
        return;
      }
    }

    if (interaction.permissionsRequired?.length) {
      for (const permission of interaction.permissionsRequired) {
        if (
          !(context.member.permissions as PermissionsBitField).has(permission)
        ) {
          await context.respond([
            {
              name: "You do not have the required permissions to use this.",
              value: "You do not have the required permissions to use this.",
            },
          ]);
          return;
        }
      }
    }

    let player: Player | undefined;

    if (interaction.autocomplete?.passPlayer) {
      player = await aeonix.players.get(context.user.id);

      if (!player) {
        await context.respond([
          {
            name: "You aren't a player. Register with the `/init` command.",
            value: "You aren't a player. Register with the `/init` command.",
          },
        ]);
        return;
      }

      if (interaction.environmentOnly) {
        if (player.location.channelId !== context.channelId) {
          await context.respond([
            {
              name: "You must be in your environment channel to run this.",
              value: "You must be in your environment channel to run this.",
            },
          ]);
          return;
        }
      }
    }
    await context.respond([
      ...((await interaction.autocomplete
        ?.callback({
          context,
          player,
        } as {
          context: AutocompleteInteraction<CacheType>;
          player: Player;
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
        })) as {
        name: string;
        value: string;
      }[]),
    ]);
  },
  onError: async (e) =>
    log({
      header: "An interaction could not be handled correctly",
      processName: "InteractionHandler",
      payload: e,
      type: "Error",
    }),
});
