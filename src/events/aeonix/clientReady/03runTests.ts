import BackpackItem from "../../../content/items/backpackItem/backpackItem.js";
import TutorialQuest from "../../../content/quests/tutorialQuest/tutorialQuest.js";
import Serializable, {
  arrayOf,
  baseFields,
  defineField,
  SerializedData,
} from "../../../models/core/serializable.js";
import Environment from "../../../models/environment/environment.js";
import AeonixEvent from "../../../models/events/aeonixEvent.js";

// #region Test Models
interface RawTestModel {
  string: string;
  number: number;
  boolean: boolean;
  date: Date; // Date stored as Date object in runtime
  array: string[];
  nested: RawTestModel[];
  optional?: string;
}

const testModelFields = defineField(baseFields, {
  add: {
    string: { id: 1, type: String },
    number: { id: 2, type: Number },
    boolean: { id: 3, type: Boolean },
    date: { id: 4, type: Date },
    array: { id: 5, type: arrayOf(String) },
  },
});

class TestModel extends Serializable<RawTestModel> {
  fields = [testModelFields];
  migrators = [];

  string: string = "test";
  number: number = 123;
  boolean: boolean = true;
  date: Date = new Date();
  array: string[] = ["a", "b"];
  nested: TestModel[] = [];
  optional?: string;
}

interface RawMigrationModel {
  v2Field: string;
}

const v1 = defineField(baseFields, {
  add: {
    v1Field: { id: 1, type: String },
  },
} as const);

const v2 = defineField(v1, {
  remove: ["v1Field"],
  add: {
    v2Field: { id: 2, type: String },
  },
} as const);

class MigrationTestModel extends Serializable<RawMigrationModel> {
  fields = [v1, v2];
  migrators = [
    Serializable.defineMigrator(v1, v2, async (data) => {
      return {
        v2Field: data.v1Field || "migrated",
      };
    }),
  ];

  v2Field: string = "default";
}
// #endregion

export default new AeonixEvent<"ready">({
  callback: async ({ aeonix }) => {
    const log = aeonix.logger.for("TestRunner");
    log.info("Running tests...");

    let test = true;

    // #region Serializer Tests
    const model = new TestModel();
    model.string = "test string";
    model.array = ["one", "two"];

    const serialized = await model.serialize();
    if (
      !serialized ||
      serialized.v !== 1 ||
      serialized.d[1] !== "test string" || // string field id 1
      !(serialized.d[5] as string[]).includes("one") // array field id 5
    ) {
      log.error("Serializer test failed: Serialization mismatch", serialized);
      test = false;
    } else {
      const deserialized = (await TestModel.deserialize(
        serialized
      )) as TestModel;
      if (
        deserialized.string !== "test string" ||
        deserialized.array.length !== 2
      ) {
        log.error(
          "Serializer test failed: Deserialization mismatch",
          deserialized
        );
        test = false;
      }
    }

    // Migration Test
    const oldData: SerializedData = {
      v: 1,
      d: {
        1: "old value",
      },
    };

    const migrated = (await MigrationTestModel.deserialize(
      oldData
    )) as MigrationTestModel;

    if (migrated.v2Field !== "old value") {
      log.error("Serializer test failed: Migration failed", {
        migrated,
        expected: "old value",
      });
      test = false;
    }

    // Edge Case: Unknown fields
    const unknownData: SerializedData = {
      v: 1,
      d: {
        1: "val",
        99: "unknown",
      },
    };
    const unknownModel = (await TestModel.deserialize(
      unknownData
    )) as TestModel;
    if (
      unknownModel.string !== "val" ||
      unknownModel._unknownFields[99] !== "unknown"
    ) {
      log.error(
        "Serializer test failed: Unknown fields not preserved",
        unknownModel
      );
      test = false;
    }

    // #endregion

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

    // #region Stats Tests
    // Reset stats to ensure deterministic testing
    player.stats.level = 1;
    player.stats.xp = 0;

    player.stats.giveXp(100);
    if (player.stats.xp !== 30 || player.stats.level !== 5) {
      log.error("Stats Test Failed: giveXp failed", {
        xp: player.stats.xp,
        level: player.stats.level,
      });
      test = false;
    }

    // Assuming calculateXpRequirement logic allows leveling.
    // If requirement for lvl 1 -> 2 is > 100, this won't level up automatically?
    // But we are testing manual levelUp call or just XP addition?
    // Let's test force level up.
    player.stats.levelUp();
    if (player.stats.level !== 6) {
      log.error("Stats Test Failed: levelUp failed", {
        level: player.stats.level,
      });
      test = false;
    }
    // #endregion

    // #region Inventory
    player.inventory.clear();
    const item = new BackpackItem();
    player.inventory.add(item);

    if (player.inventory.entries.length !== 1) {
      log.error(
        "Inv Test Error, inventory should have 1 item",
        player.inventory
      );
      test = false;
    } else if (player.inventory.entries[0]?.quantity !== 1) {
      log.error("Inv Test Error, quantity should be 1", player.inventory);
      test = false;
    }
    // #endregion

    // #region Environment
    class TestEnvironment extends Environment {
      _id: string = "test";
      channelId: string = "test";
      name: string = "test";
      description: string = "test";
      adjacentEnvironments: string[] = [];
    }

    const testEnvironment = new TestEnvironment();

    if (!testEnvironment) {
      log.error("Start environment not found", aeonix.environments.array());
      test = false;
    } else {
      testEnvironment.dropItem(player, item);
      if (testEnvironment.items.arr.length === 0) {
        log.error(
          "Env Test Failed: Item did not enter environment",
          testEnvironment.items
        );
        test = false;
      }

      const picked = testEnvironment.pickUpItem(player, item.id);
      if (!picked) {
        log.error(
          "Env Test Failed: Could not pickup item",
          testEnvironment.items
        );
        test = false;
      }

      testEnvironment.join(player);
      if (!testEnvironment.players.includes(player._id)) {
        log.error(
          "Env Test Failed: Player not in players list after join",
          testEnvironment.players
        );
        test = false;
      }

      testEnvironment.leave(player);
      if (testEnvironment.players.includes(player._id)) {
        log.error(
          "Env Test Failed: Player still in players list after leave",
          testEnvironment.players
        );
        test = false;
      }
    }
    // #endregion

    // #region Quests
    player.quests.add(new TutorialQuest());

    if (player.quests.arr.length === 0) {
      log.error("Quest/Inbox Test Failed: Letter not added");
      test = false;
    }
    // #endregion

    log.log(
      test ? "Info" : "Error",
      test ? "Tests passed" : "A test failed, check the logs"
    );
  },

  onError: async (e, { aeonix }) => {
    aeonix.logger.error("TestRunner", "Test Error", e);
  },
});
