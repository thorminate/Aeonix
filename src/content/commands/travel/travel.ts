import {
  ButtonInteraction,
  ComponentType,
  ContainerBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";
import log from "../../../utils/log.js";
import containerSnippetPaginator from "../../../utils/containerSnippetPaginator.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/core/interaction.js";
import PlayerMoveToResult from "../../../models/player/utils/playerMoveToResult.js";
import generateTravelContents from "./utils/generateTravelContents.js";
import travelHeader from "./utils/travelHeader.js";
import stringifyAdjacent from "./utils/stringifyAdjacent.js";
import Environment from "../../../models/environment/environment.js";
import { search } from "../../../utils/levenshtein.js";

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

  callback: async ({ context, player }) => {
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
          log({
            header: "Could not get location from container",
            processName: "SnippetPaginator",
            type: "Error",
          });
          return false;
        }

        const stringified = stringifyAdjacent(result.adjacent as Environment);

        return search(keyword, stringified);
      }
    );

    if (!result || result.returnType === "error") {
      log({
        header: "Paginator returned an error",
        processName: "TravelCommand",
        type: "Error",
      });
      return;
    }

    const msg = result.message;
    let collector = result.collector;

    if (!msg) {
      log({
        header: "Could not get message from paginator",
        processName: "TravelCommand",
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

    collector.on("collect", async (buttonContext: ButtonInteraction) => {
      try {
        let result: undefined | PlayerMoveToResult;
        const id = buttonContext.customId.split("-").slice(1).join("-") || "";
        await player.use(async (p) => {
          result = await p.moveTo(id);
        });

        if (!result) {
          log({
            header: "Travel command could not be handled correctly",
            processName: "TravelCommandCollector",
            type: "Error",
            payload: result,
          });
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
          log({
            header: "Travel command could not be handled correctly",
            processName: "TravelCommandCollector",
            type: "Error",
            payload: [result, id],
          });
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
        log({
          header: "Travel command could not be handled correctly",
          processName: "TravelCommandCollector",
          payload: e,
          type: "Error",
        });
      }
    });
  },

  onError(e) {
    log({
      header: "Travel command could not be handled correctly",
      processName: "TravelCommandHandler",
      payload: e,
      type: "Error",
    });
  },
});
