import {
  CacheType,
  PermissionFlagsBits,
  PermissionsBitField,
  AutocompleteInteraction,
} from "discord.js";
import AeonixEvent from "../../../models/events/aeonixEvent.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";
import PlayerRef from "../../../models/player/utils/playerRef.js";
import Player from "../../../models/player/player.js";

export default new AeonixEvent<"interactionCreate">({
  callback: async ({ args: [context], aeonix }) => {
    const log = aeonix.logger.for("InteractionHandler");
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
      log.error("An interaction was received, but no local content exists.");
      return;
    }

    const interaction:
      | Interaction<
          InteractionTypes.Command,
          boolean,
          boolean,
          boolean,
          boolean
        >
      | undefined = localInteractions.find(
      (
        interaction: Interaction<
          InteractionTypes.Command,
          boolean,
          boolean,
          boolean,
          boolean
        >
      ) => {
        return interaction.data.name === context.commandName;
      }
    );

    if (!interaction) return;

    if (!context.member) {
      log.error("Interaction member is falsy.", context);
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
    let playerRef: PlayerRef | undefined;

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

      playerRef = player.toRef();
      player = undefined;
    }
    await context.respond(
      (await interaction.autocomplete
        ?.callback({
          context,
          player: playerRef,
        } as {
          context: AutocompleteInteraction<CacheType>;
          player: PlayerRef;
        })
        .catch((e: unknown) => {
          try {
            interaction.onError(e, aeonix);
          } catch (e) {
            log.error("Error with autocomplete error handler", e);
          }
        })) ?? []
    );
  },
  onError: async (e, { aeonix }) =>
    aeonix.logger.error("InteractionHandler", "Autocomplete Error", e),
});
