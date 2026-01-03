import Quest from "../../../../models/player/utils/quests/quest.js";

export default function stringifyQuest(quest: Quest): string {
  return `${quest.name} ${quest.description}`;
}
