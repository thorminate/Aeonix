import Player from "../../models/player/player.js";
import Quest from "../../models/player/utils/quests/quest.js";

export default class TutorialQuest extends Quest {
  type: string = "tutorialQuest";
  name: string = "Tutorial Quest";
  description: string = "Complete the tutorial to unlock the rest of the game!";

  onFulfill(player: Player): void {}
}
