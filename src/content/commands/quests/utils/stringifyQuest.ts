import Quest from "#player/utils/quests/quest.js";

export default function stringifyQuest(quest: Quest): string {
  return `${quest.name} ${quest.description}`;
}
