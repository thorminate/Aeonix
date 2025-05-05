import {
  APIButtonComponentWithCustomId,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  Message,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Command from "../command.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import ItemReference from "../../models/item/utils/itemReference.js";
import paginator, { paginateFromButton } from "../../utils/paginator.js";
import { randomUUID } from "node:crypto";
import componentWrapper from "../../utils/componentWrapper.js";

function getButtonsFromEntries(entries: ItemReference[]): ButtonBuilder[] {
  return entries.map((entry: ItemReference): ButtonBuilder => {
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

        const entry = player.inventory.entries.find((e) => e.id === id);
        if (!entry) {
          log({
            header: "Could not find entry in player inventory, skipping",
            processName: "Inventory",
            payload: [id, player.inventory.entries],
            type: "Warn",
          });
          return button;
        }

        entry.id = uuid;
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

  collector.on("collect", async (context: ButtonInteraction) => {
    try {
      collector.resetTimer();

      const useType = context.customId.split(":")[0];

      const useData = context.customId.split(":")[1];

      switch (useType) {
        case "close": {
          paginateFromButton(context, buttons, "**Inventory:**");
          break;
        }

        case "drop": {
          await context.reply({
            content: "Not implemented yet. (Wait for environments first!)",
            flags: MessageFlags.Ephemeral,
          });
          break;
        }

        case "use": {
          const activeEntryIndex = player.inventory.entries.findIndex(
            (e) => e.id === useData
          );

          const activeEntry = player.inventory.entries[activeEntryIndex];

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

          if (!item) {
            log({
              header: "Item not found in inventory",
              processName: "InventoryCommand",
              payload: [player.inventory.entries, useData, activeEntryIndex],
              type: "Error",
            });
            return;
          }

          const usageResult = await item.use({
            player,
          });

          const newEntry = item.toItemReference();

          player.inventory.entries[activeEntryIndex] = newEntry;

          player.save();

          await context.update({
            content: `**${item.name}**\n${usageResult.message}`,
            components: componentWrapper(
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
              new ButtonBuilder()
                .setCustomId(`drop:${item.id}`)
                .setLabel("Drop")
                .setStyle(ButtonStyle.Secondary)
            ),
          });
          break;
        }

        default:
          {
            const currentEntry = player.inventory.entries.find(
              (entry: ItemReference) => entry.id === useType
            );

            if (!currentEntry) {
              log({
                header: "Item not found in inventory",
                processName: "InventoryCommand",
                payload: [useType, player.inventory.entries],
                type: "Error",
              });
              return;
            }

            const currentItem = await currentEntry.toItem();

            if (!currentItem) {
              log({
                header: "Inventory entry could not be converted to item",
                processName: "InventoryCommand",
                payload: [useType, player.inventory.entries],
                type: "Error",
              });
              return;
            }

            await context.update({
              content: `**${currentEntry.name}**`,
              components: componentWrapper(
                new ButtonBuilder()
                  .setCustomId("close")
                  .setLabel("Close")
                  .setEmoji("✖️")
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId(`use:${currentEntry.id}`)
                  .setLabel(currentItem.useType)
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId(`drop:${currentEntry.id}`)
                  .setLabel("Drop")
                  .setStyle(ButtonStyle.Secondary)
              ),
            });
          }
          break;
      }
    } catch (e) {
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
  acknowledge: true,
  passPlayer: true,

  callback: async (context, player): Promise<void> => {
    if (!player) {
      log({
        header: "Player could not be passed to inventory command",
        processName: "InventoryCommand",
        type: "Error",
      });
      return;
    }
    const unsanitizedButtons = getButtonsFromEntries(player.inventory.entries);

    if (unsanitizedButtons.length === 0) {
      await context.editReply("You have no items in your inventory.");
      return;
    }

    const buttons = scrambleDuplicates(unsanitizedButtons, player);

    const message = await paginator(
      context,
      buttons,
      `**Inventory:**\n-# (select an item to see more details)`
    );

    if (!message) {
      log({
        header: "Paginator returned falsy value",
        processName: "InventoryCommand",
        type: "Error",
      });
      return;
    }

    createCollectors(message, buttons, player);
  },

  onError(e) {
    log({
      header: "Error in inventory command",
      processName: "InventoryCommand",
      type: "Error",
      payload: e,
    });
  },
});
