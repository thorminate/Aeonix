import {
  ComponentType,
  ContainerBuilder,
  SlashCommandBuilder,
} from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";
import containerSnippetPaginator, {
  ContainerSnippet,
  containerSnippetPaginatorWithUpdate,
} from "../../../utils/containerSnippetPaginator.js";
import generateQuestContents from "./utils/generateQuestContents.js";
import questsHeader from "./utils/questsHeader.js";
import findQuestFromIdStrict from "./utils/findQuestFromIdStrict.js";
import generateQuestContainer from "./utils/generateQuestContainer.js";
import stringifyQuest from "./utils/stringifyQuest.js";
import Quest from "../../../models/player/utils/quests/quest.js";
import { search } from "../../../utils/levenshtein.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("quests")
    .setDescription("Shows your active quests"),

  interactionType: InteractionTypes.Command,
  ephemeral: true,
  passPlayer: true,
  environmentOnly: true,

  callback: async ({ context, player, aeonix }) => {
    const log = aeonix.logger.for("QuestsCommand");
    let snippets = await player.use(async (p) => {
      return generateQuestContents(p);
    });

    if (!snippets) {
      log.error("Could not generate quest snippets");
      return;
    }

    const result = await player.use(async (p) => {
      return await containerSnippetPaginator(
        context,
        {
          lengthPerPage: 5,
          contents: snippets as ContainerSnippet[],
          header: questsHeader(p.persona.name),
        },
        (keyword, content) => {
          const container = new ContainerBuilder();
          const result = content(container);
          if (!("quest" in result)) {
            log.error("Could not get quest from container");
            return false;
          }

          const stringified = stringifyQuest(result.quest as Quest);

          return search(keyword, stringified);
        }
      );
    });

    if (!result || result.returnType === "error") {
      log.error("Paginator returned an error");
      return;
    }

    const msg = result.message;
    let collector = result.collector;

    if (!msg) {
      log.error("Paginator did not return a message or collect");
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
              const [quest] = findQuestFromIdStrict(p.quests.arr, id);

              if (!quest) {
                log.error("Could not find quest");
                return;
              }

              await buttonContext.update({
                components: [generateQuestContainer(quest)],
              });
            });
            break;
          }

          case "#close": {
            await player.use(async (p) => {
              snippets = generateQuestContents(p);
              await containerSnippetPaginatorWithUpdate(buttonContext, {
                lengthPerPage: 5,
                contents: snippets,
                header: questsHeader(p.persona.name),
              });
            });
            break;
          }

          case "#abandon": {
            await player.use(async (p) => {
              const [quest] = findQuestFromIdStrict(p.quests.arr, id);

              if (!quest) {
                log.error("Could not find quest");
                return;
              }

              quest.fail(p);
            });
          }
        }
      } catch (e) {
        log.error("Error in quests command", e);
      }
    });
  },

  onError: (e, aeonix) => {
    aeonix.logger.error("QuestsCommand", "Command Error", e);
  },
});
