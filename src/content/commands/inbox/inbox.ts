import { ComponentType, SlashCommandBuilder } from "discord.js";
import Interaction, { ITypes } from "../../../models/core/interaction.js";
import log from "../../../utils/log.js";
import containerSnippetPaginator, {
  ContainerSnippet,
  containerSnippetPaginatorWithUpdate,
} from "../../../utils/containerSnippetPaginator.js";
import generateContainerSnippets from "./utils/generateContainerSnippets.js";
import addHeader from "./utils/addHeader.js";
import findLetterFromIdStrict from "./utils/findLetterFromIdStrict.js";
import generateMailContainer from "./utils/generateMailContainer.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("inbox")
    .setDescription("Shows your inbox"),

  interactionType: ITypes.Command,
  ephemeral: true,
  passPlayer: true,
  environmentOnly: true,

  callback: async ({ context, player }) => {
    let snippets = await player.use(async (p) => {
      return generateContainerSnippets(p);
    });

    if (!snippets) {
      log({
        header: "Could not generate snippets",
        processName: "InboxCommand",
        type: "Error",
      });
      return;
    }

    log({
      header: "Generated content snippets",
      processName: "InboxCommand",
      type: "Info",
      payload: [...snippets],
    });

    const result = await player.use(async (p) => {
      return await containerSnippetPaginator(context, {
        lengthPerPage: 5,
        contents: snippets as ContainerSnippet[],
        header: addHeader(p.persona.name, p.settings.indexShowArchived),
      });
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

    if (!collector) {
      collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15 * 60 * 1000,
      });
    }

    collector.on("collect", async (buttonContext) => {
      try {
        collector.resetTimer();

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

              await buttonContext.update({
                components: [generateMailContainer(letter)],
              });

              letter.isInteracted = true;

              p.inbox.letters[index] = letter;
            });
            break;
          }
          case "#toggleArchived": {
            snippets = ((await player.use(async (p) => {
              p.settings.indexShowArchived = !p.settings.indexShowArchived;

              return generateContainerSnippets(p);
            })) ?? []) as ContainerSnippet[];

            player.use(async (p) => {
              await containerSnippetPaginatorWithUpdate(buttonContext, {
                lengthPerPage: 5,
                contents: snippets as ContainerSnippet[],
                header: addHeader(p.persona.name, p.settings.indexShowArchived),
              });
            });

            break;
          }

          // Buttons in mail containers
          case "#close": {
            snippets = (await player.use(async (p) => {
              const snippets = generateContainerSnippets(p);
              await containerSnippetPaginatorWithUpdate(buttonContext, {
                lengthPerPage: 5,
                contents: snippets as ContainerSnippet[],
                header: addHeader(p.persona.name, p.settings.indexShowArchived),
              });
              return snippets;
            })) as ContainerSnippet[];

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
            log({
              header: "Interacting with letter",
              processName: "InboxCommand",
              type: "Info",
              payload: id,
            });
            const letter = await player.use(async (p) => {
              const [letter, index] = findLetterFromIdStrict(
                p.inbox.letters,
                id
              );

              letter.onInteract?.(p);

              p.inbox.letters[index] = letter;

              log({
                header: "Interacted with letter",
                processName: "InboxCommand",
                type: "Info",
                payload: [letter, p],
              });

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
