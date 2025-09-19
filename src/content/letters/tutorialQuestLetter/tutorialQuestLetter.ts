import Player from "../../../models/player/player.js";
import Letter from "../../../models/player/utils/inbox/letter.js";
import TutorialQuest from "../../quests/tutorialQuest/tutorialQuest.js";

export default class TutorialQuestLetter extends Letter {
  type: string = "tutorialQuestLetter";
  sender: string = "The Guild-master";
  subject: string = "A small request";
  body: string =
    "I'm looking for some help. Can you help me? I'll give more details if you accept the quest.";
  interactable: boolean = true;
  interactionType: string = "Accept quest";
  canDismiss: boolean = false;
  oneTimeInteraction: boolean = true;
  isNotification: boolean = false;

  override onInteract(player: Player): void {
    player.quests.append(new TutorialQuest());
    this.interactionType = "Quest accepted";
    this.canDismiss = true;
  }
}
