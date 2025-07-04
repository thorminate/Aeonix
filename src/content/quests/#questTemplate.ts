import Player from "../../models/player/player.js";
import Quest from "../../models/player/utils/quests/quest.js";

export default class QuestTemplate extends Quest {
  type: string = "#questTemplate"; // should always be the exact same as the filename
  name: string = "Template Quest";
  description: string = "A placeholder quest.";

  onFulfill(player: Player): void {}
}
