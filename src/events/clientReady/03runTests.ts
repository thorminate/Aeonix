import BackpackItem from "../../content/items/backpackItem/backpackItem.js";
import TutorialQuestLetter from "../../content/letters/tutorialQuestLetter/tutorialQuestLetter.js";
import Event from "../../models/core/event.js";
import log from "../../utils/log.js";

export default new Event<"ready">({
  callback: async ({ aeonix }) => {
    log({
      header: "Running tests",
      processName: "TestRunner",
      type: "Info",
    });

    if (!aeonix.user) {
      log({
        header: "User is falsy",
        processName: "TestRunner",
        payload: aeonix.user,
        type: "Error",
      });
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
      log({
        header: "Test Error, avatar is not an image url",
        processName: "TestRunner",
        payload: player,
        type: "Error",
      });
      return;
    } else if (player === "internalError") {
      log({
        header: "Test Error, internal error",
        processName: "TestRunner",
        payload: player,
        type: "Error",
      });
      return;
    }

    player.inbox.add(new TutorialQuestLetter());

    const item = new BackpackItem();

    let test = true;

    // #region Inventory

    player.inventory.clear();

    player.inventory.add(item);

    if (player.inventory.entries.length !== 1) {
      log({
        header: "Test Error, inventory should have 1 item",
        processName: "TestRunner",
        payload: player.inventory,
        type: "Error",
      });
      test = false;
    } else if (player.inventory.entries[0]?.quantity !== 1) {
      log({
        header: "Test Error, quantity should be 1",
        processName: "TestRunner",
        payload: `${player.inventory.entries[0]?.quantity} !== 1`,
        type: "Error",
      });
      test = false;
    }

    // #region Environment

    const startEnvironment = await aeonix.environments.get("start");

    if (!startEnvironment) {
      log({
        header: "Test Error, start environment is falsy",
        processName: "TestRunner",
        payload: aeonix.environments.array(),
        type: "Error",
      });
      test = false;
    }

    log({
      header: test ? "Tests passed" : "A test failed, check logs",
      processName: "TestRunner",
      type: test ? "Info" : "Error",
    });
  },
  onError: async (e) => {
    log({
      header: "Error running tests",
      processName: "TestRunner",
      payload: e,
      type: "Error",
    });
  },
});
