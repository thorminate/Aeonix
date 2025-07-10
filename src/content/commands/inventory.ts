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
import Player from "../../models/player/utils/player.js";
import log from "../../utils/log.js";
import paginator, {
  buttonPaginatorWithUpdate,
} from "../../utils/buttonPaginator.js";
import { randomUUID } from "node:crypto";
import componentWrapper from "../../utils/componentWrapper.js";
import Item from "../../models/item/item.js";
import Interaction, { ITypes } from "../../models/core/interaction.js";

function getButtonsFromEntries(entries: Item[]): ButtonBuilder[] {
  return entries.map((entry: Item): ButtonBuilder => {
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
          buttonPaginatorWithUpdate(context, buttons, "**Inventory:**");
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

          const item = player.inventory.entries[activeEntryIndex];

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

          player.inventory.entries[activeEntryIndex] = item;

          await player.commit();

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
            const currentItem = player.inventory.entries.find(
              (entry: Item) => entry.id === useType
            );

            if (!currentItem) {
              log({
                header: "Item not found in inventory",
                processName: "InventoryCommand",
                payload: [useType, player.inventory.entries],
                type: "Error",
              });
              return;
            }

            await context.update({
              content: `**${currentItem.name}**`,
              components: componentWrapper(
                new ButtonBuilder()
                  .setCustomId("close")
                  .setLabel("Close")
                  .setEmoji("✖️")
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId(`use:${currentItem.id}`)
                  .setLabel(currentItem.useType)
                  .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                  .setCustomId(`drop:${currentItem.id}`)
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

export default new Interaction({
  interactionType: ITypes.Command,

  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory"),

  ephemeral: true,
  acknowledge: true,
  passPlayer: true,
  environmentOnly: true,
  passEnvironment: false,

  callback: async ({ context, player }): Promise<void> => {
    if (!player) {
      log({
        header: "Player could not be passed to inventory command",
        processName: "InventoryCommand",
        type: "Error",
      });
      return;
    }
    const unsanitizedButtons = getButtonsFromEntries(player.inventory.entries);

    const buttons = scrambleDuplicates(unsanitizedButtons, player);

    const message = await paginator(context, buttons, (pg) =>
      pg
        ? "`**Inventory:**\n-# (select an item to see more details)`"
        : "You have no items in your inventory."
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
