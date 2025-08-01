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
import Player from "../../models/player/utils/player.js";
import Letter from "../../models/player/utils/inbox/letter.js";

function generateMailContainer(letter: Letter) {
  return [
    new ContainerBuilder()
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**${letter.sender}: ** ${letter.subject}`
            )
          )
          .setButtonAccessory(
            letter.canDismiss === true
              ? letter.isArchived === false
                ? new ButtonBuilder()
                    .setCustomId("#archive-" + letter.id)
                    .setLabel("Archive")
                    .setStyle(ButtonStyle.Danger)
                : new ButtonBuilder()
                    .setCustomId("#unarchive-" + letter.id)
                    .setLabel("Unarchive")
                    .setStyle(ButtonStyle.Secondary)
              : new ButtonBuilder()
                  .setDisabled(true)
                  .setLabel("Can't archive")
                  .setCustomId("#locked")
                  .setStyle(ButtonStyle.Secondary)
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
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
        )
      ),
  ];
}

function findLetterFromIdStrict(
  letters: Letter[],
  id: string
): [Letter, number] {
  const resultIndex = letters.findIndex((letter) => letter.id === id);

  const result = letters?.[resultIndex];

  if (!result) {
    throw new Error("Could not find letter from id", {
      cause: {
        id,
        letters,
      },
    });
  }

  return [result, resultIndex];
}

function lettersOnlyContainArchived(letters: Letter[]) {
  if (letters.length === 0) return false;
  return letters.every((letter) => letter.isArchived === true);
}

function generateEndOfPageActionRow(showArchived: boolean) {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("#toggleArchived")
      .setLabel(showArchived ? "Hide archived" : "Show archived")
      .setStyle(showArchived ? ButtonStyle.Primary : ButtonStyle.Secondary)
  );
}

function generateContainerPages({
  inbox: { letters },
  persona: { name },
  settings: { indexShowArchived: showArchived },
}: Player): ContainerBuilder[] {
  function addHeader(page: ContainerBuilder) {
    page.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${name.length > 20 ? `${name.slice(0, 20)}...` : name}'s Inbox`
      )
    );

    page.addActionRowComponents(generateEndOfPageActionRow(showArchived));

    page.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
    );
  }
  const pages: ContainerBuilder[] = [];

  let currentStep = 0;

  if (lettersOnlyContainArchived(letters) && showArchived === false) {
    pages.push(new ContainerBuilder());
    addHeader(pages[pages.length - 1]!);
    function selectRandomFromArray<Array extends unknown[]>(
      arr: Array
    ): Array[number] {
      return arr[Math.floor(Math.random() * arr.length)];
    }
    pages[0]!.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        selectRandomFromArray([
          "You're in the clear!",
          "No letters in sight.",
          "Your inbox is empty.",
          "You have no letters.",
          "Nothin' to see here!",
        ])
      )
    );
  }

  for (const letter of letters) {
    if (letter.isArchived === true && showArchived === false) continue;

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

    page.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `### ${letter.sender}:${
              letter.isArchived === true ? " (Archived)" : ""
            }\n${letter.subject}`
          )
        )
        .setButtonAccessory(
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
    let pages = generateContainerPages(player);

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
          case "#open": {
            const [letter] = findLetterFromIdStrict(player.inbox.letters, id);

            await buttonContext.update({
              components: generateMailContainer(letter),
            });
            break;
          }

          case "#toggleArchived": {
            player.settings.indexShowArchived =
              !player.settings.indexShowArchived;
            //await player.commit();
            pages = generateContainerPages(player);
            await containerPaginatorWithUpdate(buttonContext, pages);
            break;
          }

          // Buttons in mail containers
          case "#close": {
            pages = generateContainerPages(player);
            await containerPaginatorWithUpdate(buttonContext, pages);
            break;
          }
          case "#archive": {
            const [letter, index] = findLetterFromIdStrict(
              player.inbox.letters,
              id
            );

            letter.isArchived = true;

            player.inbox.letters[index] = letter;

            //await player.commit();

            await buttonContext.update({
              components: generateMailContainer(letter),
            });
            break;
          }
          case "#unarchive": {
            const [letter, index] = findLetterFromIdStrict(
              player.inbox.letters,
              id
            );

            letter.isArchived = false;

            player.inbox.letters[index] = letter;

            //await player.commit();

            await buttonContext.update({
              components: generateMailContainer(letter),
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
