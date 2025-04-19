// Turn an array of buttons into an array of action rows, now paginated!
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonComponent,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  InteractionResponse,
  Message,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import deepInstantiate from "./deepInstantiate.js";
import log from "./log.js";
import { CmdInteraction } from "../interactions/command.js";

type Page = ActionRowBuilder<ButtonBuilder>;
type GetterOrLiteral = string | ((currentPage: Page) => string);

function toLiteral(
  value: GetterOrLiteral,
  currentPage: Page
): string | undefined {
  if (typeof value === "string") return value;
  else if (typeof value === "function") return value(currentPage);
  else return undefined;
}

async function paginate(
  context: ButtonInteraction,
  pages: Page[],
  currentPage: number,
  getContent: GetterOrLiteral,
  isSearch = false
): Promise<InteractionResponse> {
  const newPage = deepInstantiate(
    new ActionRowBuilder<ButtonBuilder>(),
    pages[currentPage],
    { components: ButtonBuilder }
  );

  if (!pages[currentPage]) {
    return context.reply({
      content: "You have reached the end of the search results.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const response = await context.update({
    content: toLiteral(getContent, pages[currentPage]),
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

function createCollectors(
  message: Message,
  pages: Page[],
  buttons: ButtonBuilder[],
  getContent: GetterOrLiteral
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
          paginate(buttonContext, pages, currentPage, getContent);
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
          paginate(buttonContext, pages, currentPage, getContent);
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
            return (
              (button.data as ButtonComponent)?.label
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ?? false
            );
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
          await paginate(buttonContext, pages, currentPage, getContent);
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
          await paginate(buttonContext, pages, currentPage, getContent);
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
          paginate(buttonContext, pages, currentPage, getContent, true);
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
          paginate(buttonContext, pages, currentPage, getContent, true);
          break;

        case "sx":
          currentPage = 0;
          await buttonContext.update({
            components: [
              pages[currentPage] as ActionRowBuilder<ButtonBuilder>,
              paginationRow(0, pages.length - 1),
            ],
          });
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
          await paginate(buttonContext, pages, currentPage, getContent, true);
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
          await paginate(buttonContext, pages, currentPage, getContent, true);
          break;

        default:
          collector.stop();
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

  collector.on("end", async () => {
    collector.removeAllListeners();
  });

  return message;
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
  context: CmdInteraction,
  buttons: ButtonBuilder[],
  getContent?: GetterOrLiteral
): Promise<Message | undefined> => {
  try {
    const pages = splitIntoPages(buttons);

    if (!getContent) getContent = "";

    if (pages.length === 0) {
      log({
        header: "No buttons found",
        processName: "Paginator",
        payload: buttons,
        type: "Error",
      });
      return;
    }

    if (pages.length === 1) {
      return context.editReply({
        content: toLiteral(
          getContent,
          pages[0] as ActionRowBuilder<ButtonBuilder>
        ),
        components: [pages[0] as ActionRowBuilder<ButtonBuilder>],
      });
    }

    return createCollectors(
      await context.editReply({
        content: toLiteral(
          getContent,
          pages[0] as ActionRowBuilder<ButtonBuilder>
        ),
        components: [
          pages[0] as ActionRowBuilder<ButtonBuilder>,
          paginationRow(0, pages.length - 1),
        ],
      }),
      pages,
      buttons,
      getContent
    );
  } catch (e: any) {
    log({
      header: "Error in setting up paginator",
      processName: "Paginator",
      payload: e,
      type: "Error",
    });
    return undefined;
  }
};

export async function paginateFromButton(
  context: ButtonInteraction,
  buttons: ButtonBuilder[],
  getContent: GetterOrLiteral
): Promise<Message | undefined> {
  try {
    const pages = splitIntoPages(buttons);

    if (!getContent) getContent = "";

    if (pages.length === 1) {
      return (
        await context.update({
          content: toLiteral(
            getContent,
            pages[0] as ActionRowBuilder<ButtonBuilder>
          ),
          components: [pages[0] as ActionRowBuilder<ButtonBuilder>],
        })
      ).fetch();
    }
    await context.update({
      content: toLiteral(
        getContent,
        pages[0] as ActionRowBuilder<ButtonBuilder>
      ),
      components: [
        pages[0] as ActionRowBuilder<ButtonBuilder>,
        paginationRow(0, pages.length - 1),
      ],
    });

    return createCollectors(
      await context.fetchReply(),
      pages,
      buttons,
      getContent
    );
  } catch (e: any) {
    log({
      header: "Error in setting up paginator",
      processName: "Paginator",
      payload: e,
      type: "Error",
    });
    return undefined;
  }
}
