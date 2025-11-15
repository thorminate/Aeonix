import {
  ButtonInteraction,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import log from "../../../utils/log.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";
import containerSnippetPaginator, {
  containerSnippetPaginatorWithUpdate,
} from "../../../utils/containerSnippetPaginator.js";
import inventoryHeader from "./utils/inventoryHeader.js";
import generateInventoryContents from "./utils/generateInventoryContents.js";
import findEntryFromIdStrict from "./utils/findEntryFromIdStrict.js";
import generateEntryContainer from "./utils/generateEntryContainer.js";
import stringifyEntry from "./utils/stringifyEntry.js";
import Item from "../../../models/item/item.js";
import { search } from "../../../utils/levenshtein.js";
import generateNoticeCard from "../../../utils/generateNoticeCard.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";

export default new Interaction({
  interactionType: InteractionTypes.Command,

  data: new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("Shows your inventory"),

  ephemeral: true,
  acknowledge: true,
  passPlayer: true,
  environmentOnly: true,
  passEnvironment: false,

  callback: async ({ context, player }): Promise<void> => {
    let snippets = await player.use(async (p) => {
      return generateInventoryContents(p);
    });

    if (!snippets) {
      log({
        header: "Could not generate inventory contents",
        processName: "InventoryCommand",
        type: "Error",
      });
      return;
    }

    const result = await player.use(async (p) => {
      return await containerSnippetPaginator(
        context,
        {
          lengthPerPage: 5,
          header: inventoryHeader(p.persona.name),
          contents: snippets!,
        },
        (keyword, content) => {
          const container = new ContainerBuilder();
          const result = content(container);
          if (!("entry" in result)) {
            log({
              header: "Could not get entry from container",
              processName: "SnippetPaginator",
              type: "Error",
            });
            return false;
          }

          const stringified = stringifyEntry(result.entry as Item);

          return search(keyword, stringified);
        }
      );
    });

    if (!result || !result.returnType || result.returnType === "error") {
      log({
        header: "Paginator returned falsy value",
        processName: "InventoryCommand",
        type: "Error",
      });
      return;
    }

    const message = result.message;
    let collector = result.collector;

    if (!message) {
      log({
        header: "Paginator did not return a message",
        processName: "InventoryCommand",
        type: "Error",
      });
      return;
    }

    let isPureCollector = false;

    if (!collector) {
      collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5 * 60 * 1000,
      });
      isPureCollector = true;
    }

    collector.on("collect", async (buttonContext: ButtonInteraction) => {
      try {
        if (isPureCollector) collector.resetTimer();

        const [type, ...useData] = buttonContext.customId.split("-");

        const id = useData.join("-");

        switch (type) {
          case "#open":
            {
              await player.use(async (p) => {
                const [entry, index] = findEntryFromIdStrict(
                  p.inventory.entries,
                  id
                );

                if (!entry) {
                  log({
                    header: "Item not found in inventory",
                    processName: "InventoryCommand",
                    payload: [id, p.inventory.entries],
                    type: "Error",
                  });
                  return;
                }

                await buttonContext.update({
                  components: [generateEntryContainer(entry)],
                });

                p.inventory.entries[index] = entry;
              });
            }
            break;

          case "#dismiss":
          case "#close": {
            await player.use(async (p) => {
              snippets = generateInventoryContents(p);
              await containerSnippetPaginatorWithUpdate(buttonContext, {
                lengthPerPage: 5,
                header: inventoryHeader(p.persona.name),
                contents: snippets,
              });
            });
            break;
          }
          case "#drop": {
            const entry = await player.use(async (p) => {
              const [entry] = findEntryFromIdStrict(p.inventory.entries, id);

              if (!entry) {
                log({
                  header: "Item not found in inventory",
                  processName: "InventoryCommand",
                  payload: [id, p.inventory.entries],
                  type: "Error",
                });
                return;
              }

              const res = await entry.drop(p);

              let env = p.environment;

              if (!env) {
                env = await p.fetchEnvironment();
                if (!env) {
                  log({
                    header: "Player has no environment",
                    processName: "InventoryCommand",
                    type: "Error",
                  });
                  return;
                }
              }

              env.dropItem(p, entry);

              p.inventory.remove(entry);

              buttonContext.update({
                components: [generateNoticeCard("Item dropped", res.message)],
              });

              return entry;
            });

            if (!entry) {
              log({
                header: "Item not found in inventory",
                processName: "InventoryCommand",
                payload: [id],
                type: "Error",
              });
              return;
            }
            break;
          }
          case "#use": {
            const tup = (await player.use(async (p) => {
              const [entry, index] = findEntryFromIdStrict(
                p.inventory.entries,
                id
              );

              if (!entry) {
                log({
                  header: "Item not found in inventory",
                  processName: "InventoryCommand",
                  payload: [id, p.inventory.entries],
                  type: "Error",
                });
                return;
              }

              const res = await entry.use(p);

              p.inventory.entries[index] = entry;

              return [entry, res];
            })) as [Item, ItemUsageResult];

            if (!tup) {
              log({
                header: "Item not found in inventory",
                processName: "InventoryCommand",
                payload: [id],
                type: "Error",
              });
              return;
            }

            const [entry, res] = tup;

            await buttonContext.update({
              components: [generateEntryContainer(entry)],
            });

            await buttonContext.followUp({
              components: [generateNoticeCard("Item used", res.message)],
              flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            });

            break;
          }
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
