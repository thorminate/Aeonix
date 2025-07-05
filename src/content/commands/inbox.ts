import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";
import Interaction from "../../models/core/interaction.js";
import containerPaginator from "../../utils/containerPaginator.js";
import log from "../../utils/log.js";
import Player from "../../models/player/player.js";

function createContainerPages({ inbox, persona }: Player): ContainerBuilder[] {
  const addHeader = (page: ContainerBuilder) => {
    page.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${
          persona.name.length > 20
            ? `${persona.name.slice(0, 20)}...`
            : persona.name
        }'s Inbox`
      )
    );

    page.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
    );
  };
  const pages: ContainerBuilder[] = [];

  let currentStep = 0;

  log({
    header: "Inbox command",
    processName: "InboxCommand",
    type: "Info",
    payload: inbox,
  });

  for (const letter of inbox.letters) {
    if (pages.length === 0) {
      pages.push(new ContainerBuilder());
      addHeader(pages[0]!);
    }

    let page = pages[pages.length - 1]!;

    if (currentStep >= 5) {
      currentStep = 0;
      pages.push(new ContainerBuilder());
      addHeader(pages[pages.length - 1]!);
      page = pages[pages.length - 1]!;
    } else if (currentStep > 0) {
      page.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      );
    }

    page.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `**${letter.sender}: ** ${letter.subject}`
          )
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(letter.id)
            .setLabel("Open")
            .setStyle(ButtonStyle.Secondary)
        )
    );
  }

  return pages;
}

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("inbox")
    .setDescription("Shows your inbox"),

  interactionType: "command",
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,
  environmentOnly: true,
  passEnvironment: false,

  callback: async ({ context, player }) => {
    const pages = createContainerPages(player);

    log({
      header: "Inbox command",
      processName: "InboxCommand",
      type: "Info",
      payload: pages,
    });

    await containerPaginator(context, pages);
  },

  onError: (e) => console.error(e),
});
