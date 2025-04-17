import {
  APIButtonComponentWithCustomId,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  Message,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../command.js";
import Player from "../../models/Game/Player/Player.js";
import log from "../../utils/log.js";
import { InventoryEntry } from "../../models/Game/Inventory/inventoryUtils.js";
import paginator, { paginateFromButton } from "../../utils/paginator.js";
import buttonWrapper from "../../utils/buttonWrapper.js";
import { randomUUID } from "node:crypto";

function getButtonsFromEntries(entries: InventoryEntry[]): ButtonBuilder[] {
  return entries.map((entry: InventoryEntry): ButtonBuilder => {
    return new ButtonBuilder()
      .setCustomId(entry.id)
      .setLabel(entry.name)
      .setStyle(ButtonStyle.Primary);
  });
}

function scrambleDuplicates(buttons: ButtonBuilder[], player: Player) {
  const seen = new Set();
  const duplicates = new Set();
  for (const button of buttons) {
    const id = (button.data as APIButtonComponentWithCustomId).custom_id;
    if (seen.has(id)) {
      duplicates.add(id);
    } else {
      seen.add(id);
    }
  }

  if (duplicates.size > 0) {
    buttons = buttons.map((button: ButtonBuilder) => {
      const id = (button.data as APIButtonComponentWithCustomId).custom_id;

      if (duplicates.has(id)) {
        const uuid = randomUUID();
        button.setCustomId(uuid);

        player.inventory.entries.find((e) => e.id === id).id = uuid;
      }
      return button;
    });
  }
  return buttons;
}

function createCollectors(
  message: Message,
  buttons: ButtonBuilder[],
  player: Player
) {
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 5 * 60 * 1000,
  });

  collector.on("collect", async (buttonContext: ButtonInteraction) => {
    try {
      collector.resetTimer();

      const useType = buttonContext.customId.split(":")[0];

      const useData = buttonContext.customId.split(":")[1];

      switch (useType) {
        case "close":
          paginateFromButton(buttonContext, buttons, "**Inventory:**");
          break;

        case "use":
          const activeEntryIndex = player.inventory.entries.findIndex(
            (e) => e.id === useData
          );

          let activeEntry = player.inventory.entries[activeEntryIndex];

          if (!activeEntry) {
            log({
              header: "Item not found in inventory",
              processName: "InventoryCommand",
              payload: [player.inventory.entries, useData, activeEntryIndex],
              type: "Error",
            });
            return;
          }

          const item = await activeEntry.toItem();

          const usageResult = await item.use({
            player,
          });

          const newEntry = item.toInventoryEntry();

          player.inventory.entries[activeEntryIndex] = newEntry;

          player.save();

          await buttonContext.update({
            content: `**${item.name}**\n${usageResult.message}`,
            components: buttonWrapper([
              new ButtonBuilder()
                .setCustomId("close")
                .setLabel("Close")
                .setEmoji("✖️")
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId(`use:${item.id}`)
                .setLabel(item.useType)
                .setStyle(ButtonStyle.Success)
                .setDisabled(usageResult.oneTime),
            ]),
          });
          break;

        default:
          const currentEntry = player.inventory.entries.find(
            (entry: InventoryEntry) => entry.id === useType
          );

          if (!currentEntry) {
            log({
              header: "Item not found in inventory",
              processName: "InventoryCommand",
              payload: [item, player.inventory.entries],
              type: "Error",
            });
            return;
          }

          await buttonContext.update({
            content: `**${currentEntry.name}**`,
            components: buttonWrapper([
              new ButtonBuilder()
                .setCustomId("close")
                .setLabel("Close")
                .setEmoji("✖️")
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId(`use:${currentEntry.id}`)
                .setLabel((await currentEntry.toItem()).useType)
                .setStyle(ButtonStyle.Success),
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
}

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
    let unsanitizedButtons: ButtonBuilder[];

    unsanitizedButtons = getButtonsFromEntries(player.inventory.entries);

    if (unsanitizedButtons.length === 0) {
      await context.reply("You have no items in your inventory.");
      return;
    }

    const buttons = scrambleDuplicates(unsanitizedButtons, player);

    const message = await paginator(
      context,
      buttons,
      `**Inventory:**\n-# (select an item to see more details)`
    );

    createCollectors(message, buttons, player);
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
