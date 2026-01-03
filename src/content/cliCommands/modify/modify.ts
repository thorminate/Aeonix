import CLICommand, { defineOptions } from "../../../models/cli/cliCommand.js";
import Item from "../../../models/item/item.js";
import Quest from "../../../models/player/utils/quests/quest.js";
import { ClassConstructor } from "../../../utils/typeDescriptor.js";
import StatusEffect from "../../../models/player/utils/statusEffects/statusEffect.js";

const options = defineOptions([
  {
    name: "system",
    description:
      "Target system (inventory, quests, inbox, stats, statusEffects, items, location)",
  },
  {
    name: "action",
    description: "Action to perform (add, remove, set)",
  },
  {
    name: "descriptor",
    description: "Identifier (type descriptor, key, id)",
  },
  {
    name: "quantity",
    description: "Quantity or numeric value",
    transform: (raw) => {
      const parsed = parseInt(raw);
      return isNaN(parsed) ? undefined : parsed;
    },
  },
  {
    name: "value",
    description: "String value for setting stats",
  },
  {
    name: "data",
    description: "JSON data string",
    transform: (raw) => {
      try {
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    },
  },
]);

export default new CLICommand({
  name: "modify",
  description: "Modifies player or environment state",
  options,
  acceptsPrimaryArg: true,
  execute: async ({ primaryArgs, options, aeonix }) => {
    const log = aeonix.logger.for("ModifyCLICommand");

    const targetType = primaryArgs[0];
    const targetId = primaryArgs[1];

    const { system, action, descriptor, quantity, value, data } = options;
    const qty: number =
      typeof quantity === "number" && quantity >= 1 ? quantity : 1;

    if (!targetType || !targetId) {
      log.error("Usage: modify <player|env> <id> [options]");
      return;
    }

    if (!system || !action) {
      log.error("Missing required options: --system, --action");
      return;
    }

    if (!descriptor && action !== "remove" && system !== "stats") {
      log.error("Missing required option: --descriptor");
      return;
    }

    if (targetType === "player") {
      const player = await aeonix.players.get(targetId);

      if (!player) {
        log.error(`Player with ID ${targetId} not found.`);
        return;
      }

      switch (system) {
        case "inventory": {
          if (action === "add") {
            try {
              const ItemClass = (await aeonix.items.loadRaw(
                descriptor!
              )) as ClassConstructor;

              if (!ItemClass) {
                log.error(`Item type '${descriptor!}' not found.`);
                return;
              }

              for (let i = 0; i < qty; i++) {
                const item = new ItemClass(data) as Item;
                player.inventory.add(item);
              }

              log.info(
                `Added ${qty} item(s) of type '${descriptor!}' to player ${
                  player.persona.name
                }.`
              );
            } catch (e) {
              log.error("Failed to add item", e);
            }
          } else if (action === "remove") {
            player.inventory.remove(descriptor!);
            log.info(
              `Removed item(s) with name '${descriptor!}' from player ${
                player.persona.name
              }.`
            );
          } else {
            log.error(`Unknown action '${action}' for inventory.`);
          }
          break;
        }
        case "quests": {
          if (action === "add") {
            try {
              const QuestClass = (await aeonix.quests.loadRaw(
                descriptor!
              )) as ClassConstructor;

              if (!QuestClass) {
                log.error(`Quest type '${descriptor!}' not found.`);
                return;
              }

              for (let i = 0; i < qty; i++) {
                const quest = new QuestClass(data) as Quest;
                player.quests.add(quest);
              }

              log.info(
                `Added ${qty} quest(s) of type '${descriptor!}' to player ${
                  player.persona.name
                }.`
              );
            } catch (e) {
              log.error("Failed to add quest", e);
            }
          } else if (action === "remove") {
            const quest = player.quests.arr.find((q) => q.id === descriptor!);
            if (quest) {
              player.quests.remove(quest);
              log.info(
                `Removed quest '${quest.name}' (${descriptor!}) from player ${
                  player.persona.name
                }.`
              );
            } else {
              log.error(
                `Quest with ID '${descriptor!}' not found on player ${
                  player.persona.name
                }.`
              );
            }
          } else {
            log.error(`Unknown action '${action}' for quests.`);
          }
          break;
        }
        case "inbox": {
          if (action === "add") {
            try {
              const LetterClass = (await aeonix.letters.loadRaw(
                descriptor!
              )) as ClassConstructor;

              if (!LetterClass) {
                log.error(`Letter type '${descriptor!}' not found.`);
                return;
              }

              for (let i = 0; i < qty; i++) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const letter = new LetterClass(data) as any;
                player.inbox.add(letter);
              }

              log.info(
                `Added ${qty} letter(s) of type '${descriptor!}' to player ${
                  player.persona.name
                }.`
              );
            } catch (e) {
              log.error("Failed to add letter", e);
            }
          } else {
            log.error(`Unknown action '${action}' for inbox.`);
          }
          break;
        }
        case "stats": {
          if (action === "set") {
            if (value === undefined) {
              log.error("Missing value for stat set (use --value).");
              return;
            }

            if (descriptor! in player.stats) {
              const currentVal =
                player.stats[descriptor! as keyof typeof player.stats];
              if (typeof currentVal === "number") {
                const numVal = Number(value);
                if (!isNaN(numVal)) {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (player.stats as any)[descriptor!] = numVal;
                  log.info(
                    `Set stat '${descriptor!}' to ${numVal} for player ${
                      player.persona.name
                    }.`
                  );
                } else {
                  log.error(`Value '${value}' is not a number.`);
                }
              } else if (typeof currentVal === "boolean") {
                const boolVal =
                  value === "true"
                    ? true
                    : value === "false"
                    ? false
                    : undefined;
                if (boolVal === undefined) {
                  log.error(
                    `Value '${value}' is not a boolean. Use 'true' or 'false'.`
                  );
                  return;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (player.stats as any)[descriptor!] = boolVal;
                log.info(
                  `Set stat '${descriptor!}' to ${boolVal} for player ${
                    player.persona.name
                  }.`
                );
              } else {
                log.error(`Unsupported stat type for key '${descriptor!}'.`);
              }
            } else {
              log.error(`Stat '${descriptor!}' not found.`);
            }
          } else {
            log.error(`Unknown action '${action}' for stats.`);
          }
          break;
        }
        case "statusEffects": {
          if (action === "add") {
            try {
              const EffectClass = (await aeonix.statusEffects.loadRaw(
                descriptor!
              )) as ClassConstructor;

              if (!EffectClass) {
                log.error(`Status effect type '${descriptor!}' not found.`);
                return;
              }

              for (let i = 0; i < qty; i++) {
                const effect = new EffectClass(data) as StatusEffect;
                player.statusEffects.effects.push(effect);
              }
              log.info(
                `Added ${qty} status effect(s) of type '${descriptor!}' to player ${
                  player.persona.name
                }.`
              );
            } catch (e) {
              log.error("Failed to add status effect", e);
            }
          } else if (action === "remove") {
            player.statusEffects.effects = player.statusEffects.effects.filter(
              (e) => e.id !== descriptor!
            );
            log.info(
              `Removed status effect(s) with ID '${descriptor!}' from player ${
                player.persona.name
              }.`
            );
          } else {
            log.error(`Unknown action '${action}' for statusEffects.`);
          }
          break;
        }
        case "location": {
          if (action === "set") {
            if (!descriptor) {
              log.error(
                "Missing environment ID (descriptor) for location set."
              );
              return;
            }

            const result = await player.moveTo(descriptor, true, true);
            if (typeof result === "string") {
              log.error(`Failed to move player: ${result}`);
            } else {
              log.info(
                `Moved player ${player.persona.name} to environment ${result.name} (${descriptor}).`
              );
            }
          } else {
            log.error(`Unknown action '${action}' for location.`);
          }
          break;
        }
        default: {
          log.error(
            `Unknown target system '${system}' for player. Supported: inventory, quests, inbox, stats, statusEffects, location.`
          );
          break;
        }
      }
    } else if (targetType === "env" || targetType === "environment") {
      const env = await aeonix.environments.get(targetId);

      if (!env) {
        log.error(`Environment with ID ${targetId} not found.`);
        return;
      }

      switch (system) {
        case "items": {
          if (action === "add") {
            try {
              const ItemClass = (await aeonix.items.loadRaw(
                descriptor!
              )) as ClassConstructor;

              if (!ItemClass) {
                log.error(`Item type '${descriptor!}' not found.`);
                return;
              }

              for (let i = 0; i < qty; i++) {
                const item = new ItemClass(data) as Item;
                env.items.add(item);
              }

              log.info(
                `Added ${qty} item(s) of type '${descriptor!}' to environment ${
                  env.name
                }.`
              );
            } catch (e) {
              log.error("Failed to add item to environment", e);
            }
          } else if (action === "remove") {
            const item = env.items.arr.find((i) => i.id === descriptor!);
            if (!item) {
              log.error(`Item with ID '${descriptor!}' not found.`);
              return;
            }

            env.items.remove(item);
            log.info(
              `Removed item(s) with ID '${descriptor!}' from environment ${
                env.name
              }.`
            );
          } else {
            log.error(`Unknown action '${action}' for environment items.`);
          }
          break;
        }
        default: {
          log.error(
            `Unknown target system '${system}' for environment. Supported: items.`
          );
          break;
        }
      }
    } else {
      log.error(
        "Only 'player' and 'environment' (or 'env') modification is supported."
      );
    }
  },
});
