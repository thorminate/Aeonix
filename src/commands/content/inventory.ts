import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../command.js";
import Player from "../../models/Game/Player/Player.js";
import log from "../../utils/log.js";
import { InventoryEntry } from "../../models/Game/Inventory/inventoryUtils.js";
import paginator from "../paginator.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory"),
  ephemeral: true,
  passPlayer: true,

  callback: async (
    context: CommandInteraction,
    player: Player
  ): Promise<void> => {
    const inventoryContent = player.inventory.entries
      .map(
        (entry: InventoryEntry): string => `${entry.name}: ${entry.quantity}`
      )
      .join("\n");

    if (!inventoryContent) {
      context.editReply("**Inventory:**\nYou have nothing in your inventory.");
      return;
    }

    await paginator(
      context,
      {
        content: `**Inventory:**\n${inventoryContent}`,
      },
      [
        new ButtonBuilder()
          .setCustomId("random")
          .setLabel("Random1")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random2")
          .setLabel("Random2")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random3")
          .setLabel("Random3")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random4")
          .setLabel("Random4")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random5")
          .setLabel("Random5")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random6")
          .setLabel("Random6")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random7")
          .setLabel("Random7")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random8")
          .setLabel("Random8")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random9")
          .setLabel("Random9")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random10")
          .setLabel("Random10")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random11")
          .setLabel("Random11")
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("random12")
          .setLabel("Random12")
          .setStyle(ButtonStyle.Primary),
      ]
    );
  },

  onError(e: any): void {
    log({
      header: "Error in inventory command",
      processName: "InventoryCommand",
      type: "Error",
      payload: e,
    });
  },
});
