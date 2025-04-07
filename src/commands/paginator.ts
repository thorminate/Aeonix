// Turn an array of buttons into an array of action rows, now paginated!
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  InteractionEditReplyOptions,
  InteractionResponse,
  Message,
} from "discord.js";
import PaginationSession from "../models/Misc/PaginationSession.js";

async function paginate(
  context: ButtonInteraction,
  messageData: InteractionEditReplyOptions,
  session: PaginationSession
): Promise<InteractionResponse> {
  const currentPage = session.pages[session.currentPage];
  const response = await context.update({
    ...messageData,
    components: [
      currentPage,
      paginationRow(1, Math.ceil(session.pages.length / 4), session._id),
    ],
  });

  return response;
}

function paginationRow(
  row: number,
  max: number,
  sessionId: string
): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`fp-${sessionId}`)
      .setEmoji("⏪")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 2),

    new ButtonBuilder()
      .setCustomId(`pr-${sessionId}`)
      .setEmoji("◀️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row <= 1),

    new ButtonBuilder()
      .setCustomId(`sh-${sessionId}`)
      .setEmoji("🔎")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`nx-${sessionId}`)
      .setEmoji("▶️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row === max),

    new ButtonBuilder()
      .setCustomId(`lp-${sessionId}`)
      .setEmoji("⏩")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(row >= max - 1)
  );
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

  const session = new PaginationSession({
    _id: undefined,
    guildId: context.guildId,
    channelId: context.channelId,
    pages,
    currentPage: 1,
  });

  const messageComponents = [];

  const message = await context.editReply({
    ...messageData,
    components: messageComponents,
  });

  session._id = message.id;
  session.save();

  await message.edit({
    components: [paginationRow(1, Math.ceil(pages.length / 4), message.id)],
  });

  const collector = message.createMessageComponentCollector({
    time: 15_000,
  });

  collector.on("collect", async (context: ButtonInteraction) => {
    const [action, sessionId] = context.customId.split("-");
    if (!action || !sessionId) return;

    const session = await PaginationSession.load(sessionId);

    switch (action) {
      case "fp":
        session.currentPage = 0;
        paginate(context, {}, session);
        break;
      case "pr":
        break;
      case "sh":
        break;
      case "nx":
        break;
      case "lp":
        break;
    }
  });

  return message;
};
