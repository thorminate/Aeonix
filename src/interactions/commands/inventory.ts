import {
  APIButtonComponentWithCustomId,
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
import { randomUUID } from "node:crypto";
import { it } from "node:test";

function getButtonsFromEntries(entries: InventoryEntry[]): ButtonBuilder[] {
  return entries.map((entry: InventoryEntry): ButtonBuilder => {
    return new ButtonBuilder()
      .setCustomId(entry.id)
      .setLabel(entry.name)
      .setStyle(ButtonStyle.Primary);
  });
}

function scrambleDuplicates(buttons: ButtonBuilder[]) {
  const itemIds = [];

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

        itemIds.push({
          cId: uuid,
          oldCId: id,
        });
      }
      return button;
    });
  }
  return { buttons, itemIds };
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

    const { buttons, itemIds } = scrambleDuplicates(unsanitizedButtons);

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
            const item = itemIds.find(
              (item) => item.cId === buttonContext.customId
            );

            if (!item) return;

            const activeEntry = player.inventory.entries.find(
              (entry: InventoryEntry) => entry.id === item.oldCId
            );

            if (!activeEntry) return;

            log({
              header: "Item selected",
              processName: "InventoryCommand",
              payload: await activeEntry.toItem(),
              type: "Info",
            });

            const message = await buttonContext.update({
              content: activeEntry.name,
              components: buttonWrapper([
                new ButtonBuilder()
                  .setCustomId("close")
                  .setLabel("Close")
                  .setEmoji("✖️")
                  .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                  .setCustomId("use")
                  .setLabel((await activeEntry.toItem()).useType)
                  .setStyle(ButtonStyle.Success),
              ]),
            });

            const newCollector = message.createMessageComponentCollector({
              componentType: ComponentType.Button,
              time: 5 * 60 * 1000,
            });

            newCollector.on(
              "collect",
              async (buttonContext: ButtonInteraction) => {
                try {
                  switch (buttonContext.customId) {
                    case "use":
                      const item = await activeEntry.toItem();

                      const message = await item.use({
                        player,
                      });

                      const newEntry = item.toInventoryEntry();

                      player.inventory.entries = player.inventory.entries.map(
                        (entry) => {
                          if (entry.id === activeEntry.id) {
                            return newEntry;
                          }
                          return entry;
                        }
                      );

                      player.save();

                      await buttonContext.update(message.message);
                      break;

                    case "close":
                      newCollector.stop();
                  }
                } catch (e: unknown) {
                  log({
                    header: "Error in inventory command component handling",
                    processName: "InventoryCommand",
                    type: "Error",
                    payload: e,
                  });
                }
              }
            );
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
