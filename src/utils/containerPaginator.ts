// Turn an array of buttons into an array of action rows, now paginated!
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  InteractionResponse,
  Message,
  MessageFlags,
} from "discord.js";
import log from "./log.js";
import { CommandContext } from "../models/core/interaction.js";

async function paginate(
  context: ButtonInteraction,
  containers: ContainerBuilder[],
  currentPage: number,
  isSearch = false,
  canSearch = true
): Promise<InteractionResponse> {
  if (!containers[currentPage]) {
    return context.reply({
      content: "You have reached the end.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const response = await context.update({
    components: [
      containers[currentPage],
      paginationRow(currentPage, containers.length - 1, isSearch, canSearch),
    ],
  });

  return response;
}

function paginationRow(
  row: number,
  max: number,
  isSearch = false,
  canSearch = true
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(isSearch ? `sf` : `fp`)
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 0),

    new ButtonBuilder()
      .setCustomId(isSearch ? `sp` : `pr`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 0),

    new ButtonBuilder()
      .setCustomId(isSearch ? `sx` : `sh`)
      .setEmoji(isSearch ? "✖️" : "🔎")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(!canSearch),

    new ButtonBuilder()
      .setCustomId(isSearch ? `sn` : `nx`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row >= max),

    new ButtonBuilder()
      .setCustomId(isSearch ? `sl` : `lp`)
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row >= max)
  );
}

function createCollectors(
  message: Message,
  containers: ContainerBuilder[]
): Message {
  let currentPage = 0;
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 5 * 60 * 1000,
  });
  collector.on("collect", async (buttonContext: ButtonInteraction) => {
    try {
      collector.resetTimer();

      switch (buttonContext.customId) {
        case "fp": {
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are already on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = 0;
          paginate(buttonContext, containers, currentPage, false, false);
          break;
        }
        case "pr": {
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage--;
          paginate(buttonContext, containers, currentPage, false, false);
          break;
        }
        /*case "sh": {
          const modal = new ModalBuilder()
            .setTitle("Search")
            .setCustomId("sh")
            .addComponents(
              new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId("kw")
                  .setLabel("Keyword (by name)")
                  .setPlaceholder("Iron Sword")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
                  .setMaxLength(32)
                  .setMinLength(2)
              )
            );

          await buttonContext.showModal(modal);

          const search = await buttonContext.awaitModalSubmit({
            filter: (i) => i.user.id === buttonContext.user.id,
            time: 60_000,
          });

          const searchQuery = search.fields.getTextInputValue("kw");

          const filteredContainers = containers.filter((container) => {
            return JSON.stringify(container)
              .split('"')
              .filter((_, index) => index % 2 === 1) // Only accept the content of strings
              .join("")
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          });

          if (filteredContainers.length === 0) {
            search.reply({
              content: "No results found.",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          if (!search.isFromMessage()) return;

          currentPage = 0;

          if (pages2[currentPage]) {
            await search.update({
              components: [
                pages2[currentPage] as ActionRowBuilder<ButtonBuilder>,
                paginationRow(currentPage, pages2.length - 1, true),
              ],
            });
          } else {
            await search.reply({
              content: "No results found.",
              flags: MessageFlags.Ephemeral,
            });
          }
          break;
        } */
        case "nx": {
          if (currentPage >= containers.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage++;
          await paginate(buttonContext, containers, currentPage);
          break;
        }
        case "lp": {
          if (currentPage >= containers.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = containers.length - 1;
          await paginate(buttonContext, containers, currentPage);
          break;
        }

        // Search-only buttons

        case "sf": {
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are already on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = 0;
          paginate(buttonContext, containers, currentPage, true);
          break;
        }

        case "sp": {
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage--;
          paginate(buttonContext, containers, currentPage, true);
          break;
        }

        case "sx": {
          currentPage = 0;
          await buttonContext.update({
            components: [
              containers[currentPage] as ContainerBuilder,
              paginationRow(0, containers.length - 1),
            ],
          });
          break;
        }

        case "sn": {
          if (currentPage >= containers.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage++;
          await paginate(buttonContext, containers, currentPage, true);
          break;
        }

        case "sl": {
          if (currentPage >= containers.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = containers.length - 1;
          await paginate(buttonContext, containers, currentPage, true);
          break;
        }

        default: {
          collector.stop();
          break;
        }
      }
    } catch (e) {
      log({
        header: "Error in paginator collector",
        processName: "Paginator",
        payload: e,
        type: "Error",
      });
    }
  });

  collector.on("end", async () => {
    collector.removeAllListeners();
  });

  return message;
}

/**
 * Creates a paginated message, with containers.
 * @returns {Message}
 */
export default async (
  context: CommandContext,
  containers: ContainerBuilder[]
): Promise<Message | undefined> => {
  try {
    if (containers.length === 1) {
      return context.editReply({
        components: [containers[0] as ContainerBuilder],
        flags: MessageFlags.IsComponentsV2,
      });
    }

    return createCollectors(
      await context.editReply({
        components: containers[0]
          ? [
              containers[0] as ContainerBuilder,
              paginationRow(0, containers.length - 1),
            ]
          : [],
        flags: MessageFlags.IsComponentsV2,
      }),
      containers
    );
  } catch (e) {
    log({
      header: "Error in setting up paginator",
      processName: "Paginator",
      payload: e,
      type: "Error",
    });
    return undefined;
  }
};

export async function containerPaginatorWithUpdate(
  context: ButtonInteraction,
  containers: ContainerBuilder[]
): Promise<Message | undefined> {
  try {
    if (containers.length === 1) {
      return await (
        await context.update({
          components: [containers[0] as ContainerBuilder],
          flags: MessageFlags.IsComponentsV2,
        })
      ).fetch();
    }

    return createCollectors(
      await (
        await context.update({
          components: containers[0]
            ? [
                containers[0] as ContainerBuilder,
                paginationRow(0, containers.length - 1),
              ]
            : [],
          flags: MessageFlags.IsComponentsV2,
        })
      ).fetch(),
      containers
    );
  } catch (e) {
    log({
      header: "Error in setting up paginator",
      processName: "Paginator",
      payload: e,
      type: "Error",
    });
    return undefined;
  }
}
