import {
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../command.js";
import Player from "../../models/Game/player/Player.js";
import log from "../../utils/log.js";
import { InventoryEntry } from "../../models/Game/player/inventory/inventoryUtils.js";
import messageWrapper from "../paginator.js";

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

    await messageWrapper(
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
