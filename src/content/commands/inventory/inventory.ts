import {
  ButtonInteraction,
  ComponentType,
  ContainerBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";
import containerSnippetPaginator, {
  containerSnippetPaginatorWithUpdate,
} from "#utils/containerSnippetPaginator.js";
import inventoryHeader from "#commands/inventory/utils/inventoryHeader.js";
import generateInventoryContents from "#commands/inventory/utils/generateInventoryContents.js";
import findEntryFromIdStrict from "#commands/inventory/utils/findEntryFromIdStrict.js";
import generateEntryContainer from "#commands/inventory/utils/generateEntryContainer.js";
import stringifyEntry from "#commands/inventory/utils/stringifyEntry.js";
import Item from "#item/item.js";
import { search } from "#utils/levenshtein.js";
import generateNoticeCard from "#utils/generateNoticeCard.js";
import ItemUsageResult from "#item/utils/itemUsageResult.js";

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

  callback: async ({ context, player, aeonix }): Promise<void> => {
    const log = aeonix.logger.for("InventoryCommand");
    let snippets = await player.use(async (p) => {
      return generateInventoryContents(p);
    });

    if (!snippets) {
      log.error("Could not generate inventory contents");
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
            log.error("Paginator did not return an entry");
            return false;
          }

          const stringified = stringifyEntry(result.entry as Item);

          return search(keyword, stringified);
        }
      );
    });

    if (!result || !result.returnType || result.returnType === "error") {
      log.error("Paginator returned an error");
      return;
    }

    const message = result.message;
    let collector = result.collector;

    if (!message) {
      log.error("Paginator did not return a message");
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
                  p.inventory.arr,
                  id
                );

                if (!entry) {
                  log.error("Item not found in inventory", id, p.inventory.arr);
                  return;
                }

                await buttonContext.update({
                  components: [generateEntryContainer(entry)],
                });

                p.inventory.arr[index] = entry;
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
              const [entry] = findEntryFromIdStrict(p.inventory.arr, id);

              if (!entry) {
                log.error("Item not found in inventory", id, p.inventory.arr);
                return;
              }

              const res = await entry.drop(p);

              let env = p.environment;

              if (!env) {
                env = await p.fetchEnvironment();
                if (!env) {
                  log.error("Could not fetch environment for player");
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
              log.error("Item not found in inventory", id);
              return;
            }
            break;
          }
          case "#use": {
            const tup = (await player.use(async (p) => {
              const [entry, index] = findEntryFromIdStrict(p.inventory.arr, id);

              if (!entry) {
                log.error("Item not found in inventory", id, p.inventory.arr);
                return;
              }

              const res = await entry.use(p);

              p.inventory.arr[index] = entry;

              return [entry, res];
            })) as [Item, ItemUsageResult];

            if (!tup) {
              log.error("Item not found in inventory", id);
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
        log.error("Error in inventory command", e);
      }
    });
  },

  onError(e, aeonix) {
    aeonix.logger.error("InventoryCommand", "Error with inventory command", e);
  },
});
