import Quest from "../../../models/player/utils/quests/quest.js";
import { AnyQuestEvent } from "../../../models/player/utils/quests/questEvents.js";

export default class TutorialQuest extends Quest {
  type: string = "tutorialQuest";
  name: string = "Tutorial Quest";
  description: string = "Complete the tutorial to unlock the rest of the game!";

  onEvent(event: AnyQuestEvent): void {
    if (event.type === "inventoryAdd") {
      const [item] = event.args;
      if (item.name === "book") {
        this.completed = true;
        this.onFulfill();
      }
    }
  }

  onFulfill(): void {}
}
