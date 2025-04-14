import {
  ActionRowBuilder,
  APIButtonComponent,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../../utils/command.js";
import Player from "../../models/Game/Player/Player.js";
import log from "../../utils/log.js";
import { InventoryEntry } from "../../models/Game/Inventory/inventoryUtils.js";
import paginator, { paginateFromButton } from "../../utils/paginator.js";
import buttonWrapper from "../../utils/buttonWrapper.js";

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
    let buttons: ButtonBuilder[];

    buttons = player.inventory.entries.map(
      (entry: InventoryEntry): ButtonBuilder => {
        return new ButtonBuilder()
          .setCustomId(entry.name)
          .setLabel(entry.name)
          .setStyle(ButtonStyle.Primary);
      }
    );

    if (buttons.length === 0) {
      await context.reply("You have no items in your inventory.");
      return;
    }

    // TODO: Make sure the buttons customId's are always different

    const message = await paginator(
      context,
      buttons,
      `**Inventory:**\n-# (select an item to see more details)`
    );

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 5 * 60 * 1000,
    });

    collector.on("collect", async (buttonContext: ButtonInteraction) => {
      try {
        collector.resetTimer();

        switch (buttonContext.customId) {
          case "close":
            paginateFromButton(buttonContext, buttons, "**Inventory:**");
            break;

          default:
            const activeEntry = player.inventory.entries.find(
              (entry: InventoryEntry) => entry.id === buttonContext.customId
            );

            if (!activeEntry) return;

            await buttonContext.update({
              content: activeEntry.name,
              components: buttonWrapper([
                new ButtonBuilder()
                  .setCustomId("close")
                  .setLabel("Close")
                  .setEmoji("✖️")
                  .setStyle(ButtonStyle.Danger),
              ]),
            });
            break;
        }
      } catch (e: any) {
        log({
          header: "Error in inventory command component handling",
          processName: "InventoryCommand",
          type: "Error",
          payload: e,
        });
      }
    });
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
