import Quest from "#player/utils/quests/quest.js";
export default class QuestTemplate extends Quest {
  type: string = "#questTemplate"; // should always be the exact same as the filename
  name: string = "Template Quest";
  description: string = "A placeholder quest.";

  createData(): Record<string, unknown> {
    return {};
  }

  onFulfill(): void {}

  onFail(): void {}

  onEvent(): void {}
}
