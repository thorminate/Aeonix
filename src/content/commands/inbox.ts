import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ContainerBuilder,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";
import Interaction, { ITypes } from "../../models/core/interaction.js";
import containerPaginator, {
  containerPaginatorWithUpdate,
} from "../../utils/containerPaginator.js";
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
    } else if (currentStep >= 0) {
      page.addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      );
    }

    page.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### *${letter.sender}:*\n${letter.subject}`
      )
    );

    page.addActionRowComponents(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId("#open-" + letter.id)
          .setLabel("Open")
          .setStyle(ButtonStyle.Secondary)
      )
    );

    currentStep++;
  }

  return pages;
}

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("inbox")
    .setDescription("Shows your inbox"),

  interactionType: ITypes.Command,
  ephemeral: true,
  passPlayer: true,
  environmentOnly: true,

  callback: async ({ context, player }) => {
    const pages = createContainerPages(player);

    log({
      header: "Inbox command",
      processName: "InboxCommand",
      type: "Info",
      payload: pages,
    });

    const msg = await containerPaginator(context, pages);

    if (!msg) {
      log({
        header: "Paginator did not return a message",
        processName: "InboxCommand",
        type: "Error",
      });
      return;
    }

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === context.user.id,
      time: 15 * 60_000,
    });

    collector.on("collect", async (buttonContext) => {
      try {
        collector.resetTimer();

        const [type, ...uuid] = buttonContext.customId.split("-");

        const id = uuid.join("-");

        switch (type) {
          case "#close": {
            await containerPaginatorWithUpdate(buttonContext, pages);
            break;
          }
          case "#open": {
            const letter = player.inbox.letters.find((l) => l.id === id);

            if (!letter) {
              log({
                header: "Could not find letter from id",
                processName: "InboxCommandCollector",
                type: "Error",
                payload: [id, player.inbox.letters],
              });
              return;
            }

            await buttonContext.update({
              components: [
                new ContainerBuilder()
                  .addSectionComponents(
                    new SectionBuilder()
                      .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                          `**${letter.sender}: ** ${letter.subject}`
                        )
                      )
                      .setButtonAccessory(
                        new ButtonBuilder()
                          .setCustomId("#archive-" + letter.id)
                          .setLabel("Archive")
                          .setStyle(ButtonStyle.Danger)
                      )
                  )
                  .addSeparatorComponents(
                    new SeparatorBuilder().setSpacing(
                      SeparatorSpacingSize.Small
                    )
                  )
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(letter.body)
                  )
                  .addActionRowComponents(
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                      new ButtonBuilder()
                        .setCustomId("#close")
                        .setLabel("Close")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(letter.canDismiss === true ? false : true)
                    )
                  ),
              ],
            });
            break;
          }
        }
      } catch (e) {
        log({
          header: "Error in inbox command collector",
          processName: "InboxCommandCollector",
          type: "Error",
          payload: e,
        });
      }
    });
  },

  onError: (e) => console.error(e),
});
