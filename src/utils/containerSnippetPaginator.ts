import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  InteractionCollector,
  Message,
  MessageFlags,
  ModalBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CommandContext } from "#core/interaction.js";
import aeonix from "#root/index.js";

interface SnippetPaginatorReturn<ReturnType extends "ok" | "error"> {
  message: Message;
  collector: ReturnType extends "ok"
    ? InteractionCollector<ButtonInteraction>
    : undefined;
  pages: ReturnType extends "ok" ? ContainerBuilder[] : undefined;
  currentPage: ReturnType extends "ok" ? { n: number } : undefined;
  returnType: ReturnType;
}

export type ContainerSnippet = (container: ContainerBuilder) => object;

export interface Page {
  header: ContainerSnippet;
  contents: ContainerSnippet[];
  footer?: ContainerSnippet;
}

export interface SnippetPaginatorOptions {
  lengthPerPage: number;
  header: ContainerSnippet;
  contents: ContainerSnippet[];
  footer?: ContainerSnippet;
}

function buildPage({ header, contents, footer }: Page) {
  const container = new ContainerBuilder();
  header(container);
  for (let i = 0; i < contents.length; i++) {
    if (i > 0 && i < contents.length) {
      container.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      );
    }
    contents[i]!(container);
  }
  if (footer) footer(container);
  return container;
}

function buildPages({
  lengthPerPage,
  header,
  contents,
  footer,
}: SnippetPaginatorOptions) {
  const pages = [];
  for (let i = 0; i < contents.length; i += lengthPerPage) {
    pages.push(
      buildPage({
        header,
        contents: contents.slice(i, i + lengthPerPage),
        footer,
      })
    );
  }
  return pages;
}

function buildPaginationRow(
  currentPage: number,
  pages: ContainerBuilder[],
  isSearch = false
) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`#first-page`)
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 1),

    new ButtonBuilder()
      .setCustomId(`#previous-page`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 0),

    new ButtonBuilder()
      .setCustomId(isSearch ? `#exit-search` : `#search`)
      .setEmoji(isSearch ? "✖️" : "🔎")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`#next-page`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= pages.length - 1),

    new ButtonBuilder()
      .setCustomId(`#last-page`)
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= pages.length - 2)
  );
}

function listenToCollector(
  collector: InteractionCollector<ButtonInteraction>,
  pages: ContainerBuilder[],
  snippets: SnippetPaginatorOptions,
  filterFunction: (
    keyword: string,
    value: ContainerSnippet,
    index: number,
    array: ContainerSnippet[]
  ) => boolean,
  { n: currentPage }: { n: number }
) {
  const originalPages = pages;
  let isSearch = false;
  collector.on("collect", async (buttonContext) => {
    collector.resetTimer();
    try {
      const type = buttonContext.customId;

      switch (type) {
        case "#first-page": {
          const firstPage = pages[0];

          if (firstPage) {
            currentPage = 0;
            await buttonContext.update({
              components: [firstPage, buildPaginationRow(0, pages, isSearch)],
            });
          }

          break;
        }

        case "#previous-page": {
          const previousPage = pages[currentPage - 1];

          if (previousPage) {
            currentPage--;
            await buttonContext.update({
              components: [
                previousPage,
                buildPaginationRow(currentPage, pages, isSearch),
              ],
            });
          }
          break;
        }
        case "#search": {
          const modal = new ModalBuilder()
            .setTitle("Search")
            .setCustomId("#search")
            .addComponents(
              new ActionRowBuilder<TextInputBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId("keyword")
                  .setLabel("Keyword")
                  .setStyle(TextInputStyle.Short)
                  .setRequired(true)
                  .setMaxLength(64)
                  .setMinLength(1)
              )
            );

          await buttonContext.showModal(modal);

          const modalContext = await buttonContext.awaitModalSubmit({
            filter: (i) => i.customId === "#search",
            time: 15 * 60 * 1000,
          });

          const keyword = modalContext.fields.getTextInputValue("keyword");

          if (!keyword) return;

          const filteredContents = snippets.contents.filter(
            (value, index, array) =>
              filterFunction(keyword, value, index, array)
          );

          if (filteredContents.length === 0) {
            await modalContext.reply({
              content: "No results found.",
              flags: MessageFlags.Ephemeral,
            });
            return;
          }

          if (!modalContext.isFromMessage()) return;

          currentPage = 0;
          isSearch = true;

          if (filteredContents[currentPage]) {
            pages = buildPages({ ...snippets, contents: filteredContents });
            await modalContext.update({
              components: [
                pages[currentPage]!,
                buildPaginationRow(currentPage, pages, true),
              ],
            });
          }
          break;
        }
        case "#exit-search": {
          pages = originalPages;
          currentPage = 0;
          isSearch = false;

          await buttonContext.update({
            components: [
              pages[currentPage]!,
              buildPaginationRow(currentPage, pages, false),
            ],
          });
          break;
        }

        case "#next-page": {
          const nextPage = pages[currentPage + 1];

          if (nextPage) {
            currentPage++;
            await buttonContext.update({
              components: [
                nextPage,
                buildPaginationRow(currentPage, pages, isSearch),
              ],
            });
          }
          break;
        }
        case "#last-page": {
          const lastPage = pages[pages.length - 1];

          if (lastPage) {
            currentPage = pages.length - 1;
            await buttonContext.update({
              components: [
                lastPage,
                buildPaginationRow(currentPage, pages, isSearch),
              ],
            });
          }
          break;
        }
      }
    } catch (e) {
      aeonix.logger.error("SnippetPaginator", "Collector error", e);
    }
  });
}

export default async function containerSnippetPaginator(
  context: CommandContext,
  opts: SnippetPaginatorOptions,
  filterFunction: (
    keyword: string,
    value: ContainerSnippet,
    index: number,
    array: ContainerSnippet[]
  ) => boolean
): Promise<SnippetPaginatorReturn<"error" | "ok">> {
  const currentPage = { n: 0 };
  const pages = buildPages(opts);
  if (pages.length === 0 || pages[0]?.components.length === 0) {
    return {
      message: await context.editReply({
        content: "Internal error: could not render any pages.",
      }),
      collector: undefined,
      pages: undefined,
      currentPage: undefined,
      returnType: "error",
    } as SnippetPaginatorReturn<"error">;
  }

  const isOnePaged = pages.length <= 1;

  const msg = await context.editReply({
    components: isOnePaged
      ? [pages[0]!]
      : [pages[0]!, buildPaginationRow(0, pages)],
    flags: MessageFlags.IsComponentsV2,
  });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 15 * 60 * 1000,
  });

  listenToCollector(collector, pages, opts, filterFunction, currentPage);

  return {
    message: msg,
    collector,
    currentPage,
    pages,
    returnType: "ok",
  };
}

export async function containerSnippetPaginatorWithUpdate(
  context: ButtonInteraction,
  opts: SnippetPaginatorOptions
): Promise<void> {
  const pages = buildPages(opts);
  if (pages.length === 0 || pages[0]?.components.length === 0) {
    await context.update({
      content: "Internal error: could not render any pages.",
    });
    return;
  }

  if (pages.length === 1) {
    await context.update({
      components: [pages[0]!],
      flags: MessageFlags.IsComponentsV2,
    });
    return;
  }

  await context.update({
    components: [pages[0]!, buildPaginationRow(0, pages)],
    flags: MessageFlags.IsComponentsV2,
  });
}
