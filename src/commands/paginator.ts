// Turn an array of buttons into an array of action rows, now paginated!
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  ComponentType,
  InteractionEditReplyOptions,
  InteractionResponse,
  Message,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

type Page = ActionRowBuilder<ButtonBuilder>;

async function paginate(
  context: ButtonInteraction,
  pages: Page[],
  currentPage: number,
  isSearch = false
): Promise<InteractionResponse> {
  const newPage = deepInstantiate(
    new ActionRowBuilder<ButtonBuilder>(),
    pages[currentPage],
    { components: ButtonBuilder }
  );
  const response = await context.update({
    components: [
      newPage,
      paginationRow(currentPage, pages.length - 1, isSearch),
    ],
  });

  return response;
}

function paginationRow(row: number, max: number, isSearch = false): Page {
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
      .setStyle(ButtonStyle.Primary),

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

function searchRow(row: number, max: number): Page {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`sf`)
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 0),

    new ButtonBuilder()
      .setCustomId(`sp`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 0),

    new ButtonBuilder()
      .setCustomId(`sx`)
      .setEmoji("✖️")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`sn`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row >= max),

    new ButtonBuilder()
      .setCustomId(`sl`)
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row >= max)
  );
}

function createCollectors(
  message: Message,
  pages: Page[],
  buttons: ButtonBuilder[],
  getContent: (currentPage: Page) => string
): void {
  let currentPage = 0;
  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
  });
  collector.on("collect", async (buttonContext: ButtonInteraction) => {
    try {
      switch (buttonContext.customId) {
        case "fp":
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are already on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = 0;
          paginate(buttonContext, pages, currentPage);
          break;
        case "pr":
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage--;
          paginate(buttonContext, pages, currentPage);
          break;
        case "sh":
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

          const filteredButtons = buttons.filter((button) => {
            return (button.data as ButtonComponent).label
              .toLowerCase()
              .includes(searchQuery.toLowerCase());
          });

          if (filteredButtons.length === 0) {
            search.reply({
              content: "No results found.",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          const chunks = [];
          for (let i = 0; i < filteredButtons.length; i += 4) {
            chunks.push(filteredButtons.slice(i, i + 4));
          }

          const pages2 = chunks.map((chunk) => {
            return new ActionRowBuilder<ButtonBuilder>().addComponents(chunk);
          });

          if (!search.isFromMessage()) return;

          currentPage = 0;
          await search.update({
            components: [pages2[0], paginationRow(0, pages2.length - 1, true)],
          });
          break;
        case "nx":
          if (currentPage >= pages.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage++;
          await paginate(buttonContext, pages, currentPage);
          break;
        case "lp":
          if (currentPage >= pages.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = pages.length - 1;
          await paginate(buttonContext, pages, currentPage);
          break;

        // Search-only buttons

        case "sf":
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are already on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = 0;
          paginate(buttonContext, pages, currentPage, true);
          break;

        case "sp":
          if (currentPage <= 0) {
            buttonContext.reply({
              content:
                "You are on the first page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage--;
          paginate(buttonContext, pages, currentPage, true);
          break;

        case "sx":
          await buttonContext.update({
            components: [pages[0], paginationRow(0, pages.length - 1)],
          });
          currentPage = 0;
          break;

        case "sn":
          if (currentPage >= pages.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage++;
          await paginate(buttonContext, pages, currentPage, true);
          break;

        case "sl":
          if (currentPage >= pages.length - 1) {
            await buttonContext.reply({
              content:
                "You are already on the last page. (Hey! you shouldn't be able to do that!)",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }
          currentPage = pages.length - 1;
          await paginate(buttonContext, pages, currentPage, true);
          break;
      }
    } catch (e: any) {
      log({
        header: "Error in paginator collector",
        processName: "Paginator",
        payload: e,
        type: "Error",
      });
    }
  });
}

function splitIntoPages(buttons: ButtonBuilder[]): Page[] {
  let chunks: Page[] = [];
  for (let i = 0; i < buttons.length; i += 4) {
    chunks.push(
      new ActionRowBuilder<ButtonBuilder>().setComponents(
        buttons.slice(i, i + 4)
      )
    );
  }

  return chunks;
}

/**
 * Creates a paginated message, with buttons. Only allows 5 buttons per row.
 * @returns {Message}
 */
export default async (
  context: CommandInteraction,
  messageData: InteractionEditReplyOptions,
  buttons: ButtonBuilder[],
  getContent: (currentPage: Page) => string
): Promise<Message> => {
  const pages = splitIntoPages(buttons);

  if (pages.length === 1) {
    return context.editReply({
      ...messageData,
      components: [pages[0]],
    });
  }

  const message = await context.editReply({
    ...messageData,
    components: [pages[0], paginationRow(0, pages.length - 1)],
  });

  createCollectors(message, pages, buttons, getContent);

  return message;
};
