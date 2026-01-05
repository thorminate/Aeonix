import {
  ButtonInteraction,
  ComponentType,
  ContainerBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";
import containerSnippetPaginator from "#utils/containerSnippetPaginator.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";
import generateTravelContents from "#commands/travel/utils/generateTravelContents.js";
import travelHeader from "#commands/travel/utils/travelHeader.js";
import stringifyAdjacent from "#commands/travel/utils/stringifyAdjacent.js";
import Environment from "#environment/environment.js";
import { search } from "#utils/levenshtein.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("travel")
    .setDescription("Traverses to a new location"),

  interactionType: InteractionTypes.Command,
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,
  environmentOnly: true,
  passEnvironment: true,

  callback: async ({ context, player, aeonix }) => {
    const log = aeonix.logger.for("TravelCommand");
    const snippets = await player.use(async (p) => {
      return await generateTravelContents(p);
    });

    const result = await containerSnippetPaginator(
      context,
      {
        lengthPerPage: 5,
        header: travelHeader(),
        contents: snippets!,
      },
      (keyword, content) => {
        const result = content(new ContainerBuilder());
        if (!("adjacent" in result)) {
          log.error("Could not get location from container");
          return false;
        }

        const stringified = stringifyAdjacent(result.adjacent as Environment);

        return search(keyword, stringified);
      }
    );

    if (!result || result.returnType === "error") {
      log.error("Could not get result from paginator");
      return;
    }

    const msg = result.message;
    let collector = result.collector;

    if (!msg) {
      log.error("Could not get message from paginator");
      return;
    }

    if (!collector) {
      collector = msg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 15 * 60 * 1000,
      });
    }

    collector.on("collect", async (buttonContext: ButtonInteraction) => {
      try {
        const id = buttonContext.customId.split("-").slice(1).join("-") || "";
        const result = await player.use(async (p) => {
          return await p.moveTo(id);
        });

        if (!result) {
          log.error("Could not get result from player.moveTo", id);
          buttonContext.update({
            components: [
              new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## Something went wrong.")
              ),
            ],
          });
          return;
        }

        if (
          result === "invalid location" ||
          result === "not adjacent" ||
          result === "location channel not found" ||
          result === "no old environment"
        ) {
          log.error(
            "Travel command could not be handled correctly",
            id,
            result
          );
          await buttonContext.update({
            components: [
              new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## Invalid location.")
              ),
            ],
          });
          return;
        }

        if (result === "already here") {
          await buttonContext.update({
            components: [
              new ContainerBuilder().addTextDisplayComponents(
                new TextDisplayBuilder().setContent("## You are already here.")
              ),
            ],
          });
          return;
        }

        await buttonContext.update({
          components: [
            new ContainerBuilder().addTextDisplayComponents(
              new TextDisplayBuilder().setContent("## Traversal complete.")
            ),
          ],
        });
      } catch (e) {
        log.error("Travel command could not be handled correctly", e);
      }
    });
  },

  onError(e, aeonix) {
    aeonix.logger.error("TravelCommand", "Command Error", e);
  },
});
