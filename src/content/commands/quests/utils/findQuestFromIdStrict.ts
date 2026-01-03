import Quest from "../../../../models/player/utils/quests/quest.js";

export default function findQuestFromIdStrict(
  quests: Quest[],
  id: string
): [Quest | undefined, number] {
  const index = quests.findIndex((q) => q.id === id);
  return [quests[index], index];
}
