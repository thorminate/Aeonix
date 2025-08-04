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
  SeparatorBuilder,
  SeparatorSpacingSize,
} from "discord.js";
import { CommandContext } from "../models/core/interaction.js";
import log from "./log.js";

interface SnippetPaginatorReturn<
  ReturnType extends "ok" | "error" | "non-paginated"
> {
  message: Message;
  collector: ReturnType extends "ok"
    ? InteractionCollector<ButtonInteraction>
    : undefined;
  pages: ReturnType extends "ok" ? ContainerBuilder[] : undefined;
  currentPage: ReturnType extends "ok" ? { n: number } : undefined;
  returnType: ReturnType;
}

export type ContainerSnippet = (container: ContainerBuilder) => void;

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

function buildPaginationRow(currentPage: number, pages: ContainerBuilder[]) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`#first-page`)
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 0),

    new ButtonBuilder()
      .setCustomId(`#previous-page`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage <= 0),

    new ButtonBuilder()
      .setCustomId(`#search`)
      .setEmoji("🔎")
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
      .setDisabled(currentPage >= pages.length - 1)
  );
}

function listenToCollector(
  collector: InteractionCollector<ButtonInteraction>,
  pages: ContainerBuilder[],
  { n: currentPage }: { n: number }
) {
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
              components: [firstPage, buildPaginationRow(0, pages)],
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
                buildPaginationRow(currentPage, pages),
              ],
            });
          }
          break;
        }
        case "#search": {
          //TODO:
          break;
        }
        case "#next-page": {
          const nextPage = pages[currentPage + 1];

          if (nextPage) {
            currentPage++;
            await buttonContext.update({
              components: [nextPage, buildPaginationRow(currentPage, pages)],
            });
          }
          break;
        }
        case "#last-page": {
          const lastPage = pages[pages.length - 1];

          if (lastPage) {
            currentPage = pages.length - 1;
            await buttonContext.update({
              components: [lastPage, buildPaginationRow(currentPage, pages)],
            });
          }
          break;
        }
      }
    } catch (e) {
      log({
        header: "Paginator collector reset timer error",
        processName: "SnippetPaginator",
        type: "Error",
        payload: e,
      });
    }
  });
}

export default async function containerSnippetPaginator(
  context: CommandContext,
  opts: SnippetPaginatorOptions
): Promise<SnippetPaginatorReturn<"error" | "ok" | "non-paginated">> {
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

  if (pages.length === 1) {
    return {
      message: await context.editReply({
        components: [pages[0]!],
        flags: MessageFlags.IsComponentsV2,
      }),
      collector: undefined,
      pages: undefined,
      currentPage: undefined,
      returnType: "non-paginated",
    } as SnippetPaginatorReturn<"non-paginated">;
  }

  const msg = await context.editReply({
    components: [pages[0]!, buildPaginationRow(0, pages)],
    flags: MessageFlags.IsComponentsV2,
  });

  const collector = msg.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 15 * 60 * 1000,
  });

  listenToCollector(collector, pages, currentPage);

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
