import {
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import log from "../../utils/log.js";
import Player from "../../models/player/player.js";
import paginator from "../../utils/paginator.js";
import Interaction from "../interaction.js";

function createCollectors(message: Message, player: Player) {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 5 * 60 * 1000,
  });

  collector.on("collect", async (buttonContext: ButtonInteraction) => {
    try {
      const result = await player.moveTo(
        buttonContext.customId.split("-")[1] || ""
      );

      if (
        result === "invalid location" ||
        result === "not adjacent" ||
        result === "location channel not found" ||
        result === "no old environment"
      ) {
        await buttonContext.update({
          content: "Invalid location.",
        });
        return;
      }

      if (result === "already here") {
        await buttonContext.update({
          content: "You are already here.",
        });
        return;
      }

      await player.commit();

      await buttonContext.update({
        content: `You have moved to ${buttonContext.customId.split("-")[1]}.`,
        components: [],
      });
    } catch (e) {
      log({
        header: "Travel command could not be handled correctly",
        processName: "TravelCommandCollector",
        payload: e,
        type: "Error",
      });
    }
  });
}

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("travel")
    .setDescription("Traverses to a new location"),

  interactionType: "command",
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,
  environmentOnly: true,
  passEnvironment: true,

  callback: async ({ context, player, environment }) => {
    const buttons =
      environment?.adjacentEnvironments.map((env: string) =>
        new ButtonBuilder()
          .setCustomId(`#travel-${env}`)
          .setLabel(env)
          .setStyle(ButtonStyle.Primary)
      ) || [];

    const message = await paginator(context, buttons, (pg) => {
      return pg
        ? `**Locations:**\n-# (select a location)`
        : "There are no locations for you to traverse to.";
    });

    if (!message) {
      log({
        header: "Paginator returned falsy value",
        processName: "TravelCommandHandler",
        type: "Error",
      });
      return;
    }

    createCollectors(message, player);
  },

  onError(e) {
    log({
      header: "Travel command could not be handled correctly",
      processName: "TravelCommandHandler",
      payload: e,
      type: "Error",
    });
  },
});
