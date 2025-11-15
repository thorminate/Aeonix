import {
  ComponentType,
  ContainerBuilder,
  SlashCommandBuilder,
} from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";
import log from "../../../utils/log.js";
import containerSnippetPaginator, {
  ContainerSnippet,
  containerSnippetPaginatorWithUpdate,
} from "../../../utils/containerSnippetPaginator.js";
import generateInboxContents from "./utils/generateInboxContents.js";
import addHeader from "./utils/inboxHeader.js";
import findLetterFromIdStrict from "./utils/findLetterFromIdStrict.js";
import generateMailContainer from "./utils/generateMailContainer.js";
import stringifyLetter from "./utils/stringifyLetter.js";
import Letter from "../../../models/player/utils/inbox/letter.js";
import { search } from "../../../utils/levenshtein.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("inbox")
    .setDescription("Shows your inbox"),

  interactionType: InteractionTypes.Command,
  ephemeral: true,
  passPlayer: true,
  environmentOnly: true,

  callback: async ({ context, player }) => {
    let snippets = await player.use(async (p) => {
      return generateInboxContents(p);
    });

    if (!snippets) {
      log({
        header: "Could not generate snippets",
        processName: "InboxCommand",
        type: "Error",
      });
      return;
    }

    const result = await player.use(async (p) => {
      return await containerSnippetPaginator(
        context,
        {
          lengthPerPage: 5,
          contents: snippets as ContainerSnippet[],
          header: addHeader(
            p.persona.name,
            p.settings.inboxShowArchived,
            p.settings.inboxShowNotifications
          ),
        },
        (keyword, content) => {
          const container = new ContainerBuilder();
          const result = content(container);
          if (!("letter" in result)) {
            log({
              header: "Could not get letter from container",
              processName: "SnippetPaginator",
              type: "Error",
              payload: result,
            });
            return false;
          }

          const stringified = stringifyLetter(result.letter as Letter);

          return search(keyword, stringified);
        }
      );
    });

    if (!result || result.returnType === "error") {
      log({
        header: "Paginator returned an error",
        processName: "InboxCommand",
        type: "Error",
      });
      return;
    }

    const msg = result.message;
    let collector = result.collector;

    if (!msg) {
      log({
        header: "Paginator did not return a message or collect",
        processName: "InboxCommand",
        type: "Error",
      });
      return;
    }
    let isPureCollector = false;

    if (!collector) {
      collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15 * 60 * 1000,
      });

      isPureCollector = true;
    }

    collector.on("collect", async (buttonContext) => {
      try {
        if (isPureCollector) collector.resetTimer();

        const [type, ...uuid] = buttonContext.customId.split("-");

        const id = uuid.join("-");

        switch (type) {
          case "#open": {
            await player.use(async (p) => {
              const [letter, index] = findLetterFromIdStrict(
                p.inbox.letters,
                id
              );

              if (!letter) {
                log({
                  header: "Could not find letter",
                  processName: "InboxCommand",
                  type: "Error",
                });
                return;
              }

              letter.onRead?.(p);

              letter.isRead = true;

              await buttonContext.update({
                components: [generateMailContainer(letter)],
              });

              p.inbox.letters[index] = letter;
            });
            break;
          }
          case "#toggleArchived": {
            await player.use(async (p) => {
              p.settings.inboxShowArchived = !p.settings.inboxShowArchived;

              snippets = generateInboxContents(p);

              await containerSnippetPaginatorWithUpdate(buttonContext, {
                lengthPerPage: 5,
                contents: snippets as ContainerSnippet[],
                header: addHeader(
                  p.persona.name,
                  p.settings.inboxShowArchived,
                  p.settings.inboxShowNotifications
                ),
              });
            });
            break;
          }

          case "#toggleNotifications": {
            await player.use(async (p) => {
              p.settings.inboxShowNotifications =
                !p.settings.inboxShowNotifications;

              snippets = generateInboxContents(p);

              await containerSnippetPaginatorWithUpdate(buttonContext, {
                lengthPerPage: 5,
                contents: snippets as ContainerSnippet[],
                header: addHeader(
                  p.persona.name,
                  p.settings.inboxShowArchived,
                  p.settings.inboxShowNotifications
                ),
              });
            });
            break;
          }

          // Buttons in mail containers
          case "#close": {
            await player.use(async (p) => {
              snippets = generateInboxContents(p);
              await containerSnippetPaginatorWithUpdate(buttonContext, {
                lengthPerPage: 5,
                contents: snippets,
                header: addHeader(
                  p.persona.name,
                  p.settings.inboxShowArchived,
                  p.settings.inboxShowNotifications
                ),
              });
            });
            break;
          }
          case "#archive": {
            await player.use(async (p) => {
              const [letter, index] = findLetterFromIdStrict(
                p.inbox.letters,
                id
              );

              letter.isArchived = !letter.isArchived;

              p.inbox.letters[index] = letter;

              await buttonContext.update({
                components: [generateMailContainer(letter)],
              });
            });
            break;
          }
          case "#use": {
            const letter = await player.use(async (p) => {
              const [letter, index] = findLetterFromIdStrict(
                p.inbox.letters,
                id
              );

              letter.onInteract?.(p);

              letter.isInteracted = true;

              p.inbox.letters[index] = letter;

              return letter;
            });

            if (!letter) {
              log({
                header: "Could not find letter",
                processName: "InboxCommand",
                type: "Error",
              });
              return;
            }

            await buttonContext.update({
              components: [generateMailContainer(letter)],
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
