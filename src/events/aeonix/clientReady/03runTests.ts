import BackpackItem from "../../../content/items/backpackItem/backpackItem.js";
import TutorialQuestLetter from "../../../content/letters/tutorialQuestLetter/tutorialQuestLetter.js";
import AeonixEvent from "../../../models/events/aeonixEvent.js";

export default new AeonixEvent<"ready">({
  callback: async ({ aeonix }) => {
    const log = aeonix.logger.for("TestRunner");
    log.info("Running tests...");

    if (!aeonix.user) {
      log.error("User is falsy", aeonix);
      return;
    }

    let player = await aeonix.players.create({
      user: aeonix.user,
      name: aeonix.user.username,
      avatar: aeonix.user.displayAvatarURL(),
    });

    if (player === "playerAlreadyExists") {
      player = (await aeonix.players.load(aeonix.user.id))!;
    } else if (player === "notAnImageUrl") {
      log.error("Avatar is not an image url", aeonix.user.displayAvatarURL());
      return;
    } else if (player === "internalError") {
      log.error("Error creating player", aeonix.user);
      return;
    }

    player.inbox.add(new TutorialQuestLetter());

    const item = new BackpackItem();

    let test = true;

    // #region Inventory

    player.inventory.clear();

    player.inventory.add(item);

    if (player.inventory.entries.length !== 1) {
      log.error("Test Error, inventory should have 1 item", player.inventory);
      test = false;
    } else if (player.inventory.entries[0]?.quantity !== 1) {
      log.error(
        "Test Error, quantity should be 1",
        `${player.inventory.entries[0]?.quantity} !== 1`
      );
      test = false;
    }

    // #region Environments

    const startEnvironment = await aeonix.environments.get("start");

    if (!startEnvironment) {
      log.error("Start environment not found", aeonix.environments.array());
      test = false;
    }

    log.log(
      test ? "Info" : "Error",
      test ? "Tests passed" : "A test failed, check the logs"
    );
  },
  onError: async (e, { aeonix }) => {
    aeonix.logger.error("TestRunner", "Test Error", e);
  },
});
