import { AnyPlayerEvent } from "#player/utils/playerEvents.js";
import Quest from "#player/utils/quests/quest.js";

export default class TutorialQuest extends Quest {
  type: string = "tutorialQuest";
  name: string = "Tutorial Quest";
  description: string = "Complete the tutorial to unlock the rest of the game!";

  createData(): Record<string, unknown> {
    return {};
  }

  onFulfill(): void {}

  onFail(): void {}

  onEvent(event: AnyPlayerEvent): void {
    if (event.type === "inventoryItemAdded") {
      const [item] = event.args;
      if (item.type === "bookItem") {
        this.fulfill(event.player);
      }
    }
  }
}
