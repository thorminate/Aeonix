// Turn an array of buttons into an array of action rows, now paginated!
import {
  ActionRowBuilder,
  APIButtonComponent,
  ButtonBuilder,
  ButtonComponent,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  InteractionEditReplyOptions,
  InteractionResponse,
  Message,
  MessageFlags,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import PaginationSession from "../models/Misc/PaginationSession.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import aeonix from "../aeonix.js";

async function paginate(
  context: ButtonInteraction,
  session: PaginationSession
): Promise<InteractionResponse> {
  const currentPage = deepInstantiate(
    new ActionRowBuilder<ButtonBuilder>(),
    session.pages[session.currentPage],
    { components: ButtonBuilder }
  );
  const response = await context.update({
    components: [
      currentPage,
      paginationRow(session.currentPage, Math.ceil(session.pages.length / 4)),
    ],
  });

  return response;
}

function paginationRow(
  row: number,
  max: number
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`fp`)
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 0),

    new ButtonBuilder()
      .setCustomId(`pr`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 0),

    new ButtonBuilder()
      .setCustomId(`sh`)
      .setEmoji("🔎")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`nx`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row === max),

    new ButtonBuilder()
      .setCustomId(`lp`)
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row === max)
  );
}

function searchRow(row: number, max: number): ActionRowBuilder<ButtonBuilder> {
  const rows = paginationRow(row, max);

  rows.components[3]
    .setCustomId(`xs`)
    .setEmoji("❌")
    .setStyle(ButtonStyle.Danger);

  return rows;
}
/**
 * Creates a paginated message, with buttons. Only allows 5 buttons per row.
 * @returns {Message}
 */
export default async (
  context: CommandInteraction,
  messageData: InteractionEditReplyOptions,
  buttons: ButtonBuilder[]
): Promise<Message> => {
  // First we split the buttons into chunks of 5
  const chunks = [];
  for (let i = 0; i < buttons.length; i += 4) {
    chunks.push(buttons.slice(i, i + 4));
  }

  // Then we create an action row for each chunk
  const pages = chunks.map((chunk) => {
    return new ActionRowBuilder<ButtonBuilder>().addComponents(chunk);
  });

  const session = new PaginationSession(
    "",
    context.guildId,
    context.channelId,
    pages,
    0
  );

  const messageComponents = [pages[0]];

  const message = await context.editReply({
    ...messageData,
    components: messageComponents,
  });

  await context.editReply({
    components: [
      ...messageComponents,
      paginationRow(0, Math.ceil(pages.length / 4)),
    ],
  });

  const collector = message.createMessageComponentCollector();

  collector.on("collect", async (buttonContext: ButtonInteraction) => {
    switch (buttonContext.customId) {
      case "fp":
        if (session.currentPage <= 0) {
          buttonContext.reply({
            content:
              "You are already on the first page. (Hey! you shouldn't be able to do that!)",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        session.currentPage = 0;
        paginate(buttonContext, session);
        break;
      case "pr":
        if (session.currentPage <= 0) {
          buttonContext.reply({
            content:
              "You are on the first page. (Hey! you shouldn't be able to do that!)",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        session.currentPage--;
        paginate(buttonContext, session);
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

        const newSession = session;

        newSession.currentPage = 0;
        newSession.pages = pages2;

        aeonix.channels.cache
          .find(
            (channel) =>
              channel.id === session.channelId && channel.isTextBased()
          )
          .fetch()
          .then((channel) => {
            (channel as TextChannel).messages
              .fetch(session.id)
              .then((message) => {
                message.delete();
              });
          });

        //TODO: now create a new message with all the buttons, just the pages are different
        const messageComponents = [pages2[0]];

        break;
      case "nx":
        if (session.currentPage >= pages.length - 1) {
          buttonContext.reply({
            content:
              "You are already on the last page. (Hey! you shouldn't be able to do that!)",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        session.currentPage++;
        paginate(buttonContext, session);
        break;
      case "lp":
        if (session.currentPage >= pages.length - 1) {
          buttonContext.reply({
            content:
              "You are already on the last page. (Hey! you shouldn't be able to do that!)",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        session.currentPage = pages.length - 1;
        paginate(buttonContext, session);
        break;
    }
  });

  return message;
};
