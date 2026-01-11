import BackpackItem from "#items/backpackItem/backpackItem.js";
import TutorialQuest from "#quests/tutorialQuest/tutorialQuest.js";
import Serializable, {
  baseFields,
  defineField,
  Fields,
  FieldSchema,
  SerializedData,
} from "#core/serializable.js";
import Environment from "#environment/environment.js";
import AeonixEvent from "#core/aeonixEvent.js";
import { arrayOf, mapOf, setOf } from "#utils/typeDescriptor.js";

// #region Test Models
interface RawTestModel {
  string: string;
  number: number;
  boolean: boolean;
  date: Date; // Date stored as Date object in runtime
  array: string[];
  nested: RawTestModel[];
  map: Map<string, number>;
  set: Set<string>;
  bigint: bigint;
  regex: RegExp;
  buffer: Buffer;
  nan: number;
  infinity: number;
  negInfinity: number;
  uint8Array: Uint8Array;
  uint16Array: Uint16Array;
  uint32Array: Uint32Array;
  bigUint64Array: BigInt64Array;
  int8Array: Int8Array;
  int16Array: Int16Array;
  int32Array: Int32Array;
  bigInt64Array: BigInt64Array;
  float32Array: Float32Array;
  float64Array: Float64Array;
}

class TestModel extends Serializable<RawTestModel> {
  static override fields: Fields<FieldSchema>[] = [];
  static override migrators = [];

  string: string = "test";
  number: number = 123;
  boolean: boolean = true;
  date: Date = new Date();
  array: string[] = ["a", "b"];
  nested: TestModel[] = [];
  map: Map<string, number> = new Map();
  set: Set<string> = new Set();
  bigint: bigint = 123n;
  regex: RegExp = new RegExp("test");
  buffer: Buffer = Buffer.from("test");
  nan: number = NaN;
  infinity: number = Infinity;
  negInfinity: number = -Infinity;
  url: URL = new URL("https://example.com");
  error: Error = new Error("test");
  uint8Array: Uint8Array = new Uint8Array(1);
  uint16Array: Uint16Array = new Uint16Array(1);
  uint32Array: Uint32Array = new Uint32Array(1);
  bigUint64Array: BigInt64Array = new BigInt64Array(1);
  int8Array: Int8Array = new Int8Array(1);
  int16Array: Int16Array = new Int16Array(1);
  int32Array: Int32Array = new Int32Array(1);
  bigInt64Array: BigInt64Array = new BigInt64Array(1);
  float32Array: Float32Array = new Float32Array(1);
  float64Array: Float64Array = new Float64Array(1);
}

const testModelFields = defineField(baseFields, {
  add: {
    string: { id: 0, type: String },
    number: { id: 1, type: Number },
    boolean: { id: 2, type: Boolean },
    date: { id: 3, type: Date },
    array: { id: 4, type: arrayOf(String) },
    nested: { id: 5, type: arrayOf(TestModel) },
    map: { id: 6, type: mapOf(String, Number) },
    set: { id: 7, type: setOf(String) },
    bigint: { id: 8, type: BigInt },
    regex: { id: 9, type: RegExp },
    buffer: { id: 10, type: Buffer },
    nan: { id: 11, type: Number },
    infinity: { id: 12, type: Number },
    negInfinity: { id: 13, type: Number },
    url: { id: 14, type: URL },
    error: { id: 15, type: Error },
    uint8Array: { id: 16, type: Uint8Array },
    uint16Array: { id: 17, type: Uint16Array },
    uint32Array: { id: 18, type: Uint32Array },
    bigUint64Array: { id: 19, type: BigInt64Array },
    int8Array: { id: 20, type: Int8Array },
    int16Array: { id: 21, type: Int16Array },
    int32Array: { id: 22, type: Int32Array },
    bigInt64Array: { id: 23, type: BigInt64Array },
    float32Array: { id: 24, type: Float32Array },
    float64Array: { id: 25, type: Float64Array },
  },
});

TestModel.fields = [testModelFields];

interface RawMigrationModel {
  v2Field: string;
}

const v1 = defineField(baseFields, {
  add: {
    v1Field: { id: 1, type: String },
  },
});

const v2 = defineField(v1, {
  remove: ["v1Field"],
  add: {
    v2Field: { id: 2, type: String },
  },
});

class MigrationTestModel extends Serializable<RawMigrationModel> {
  static override fields = [v1, v2];
  static override migrators = [
    MigrationTestModel.defineMigrator(v1, v2, async (data) => {
      data.v2Field = data.v1Field;
      delete data.v1Field;
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
    model.number = 456;
    model.boolean = false;
    model.date = new Date();
    model.array = ["one", "two"];
    model.nested = [new TestModel(), new TestModel()];
    model.map.set("a", 1);
    model.map.set("b", 2);
    model.set.add("x");
    model.set.add("y");
    model.bigint = 9007199254740993n;
    model.regex = /hello/gi;
    model.buffer = Buffer.from("test");
    model.nan = NaN;
    model.infinity = Infinity;
    model.negInfinity = -Infinity;
    model.url = new URL("https://example.com");
    model.error = new Error("test");
    model.uint8Array = new Uint8Array(1);
    model.uint16Array = new Uint16Array(1);
    model.uint32Array = new Uint32Array(1);
    model.int8Array = new Int8Array(1);
    model.int16Array = new Int16Array(1);
    model.int32Array = new Int32Array(1);
    model.float32Array = new Float32Array(1);
    model.float64Array = new Float64Array(1);

    const serialized = await model.serialize();

    // --- version ---
    if (serialized.v !== 1) {
      log.error("Serializer test failed: wrong version", {
        expected: 1,
        got: serialized.v,
      });
      test = false;
    }

    // --- string ---
    if (serialized.d[0] !== "test string") {
      log.error("Serializer test failed: string field", {
        expected: "test string",
        got: serialized.d[0],
      });
      test = false;
    }

    // --- number ---
    if (serialized.d[1] !== 456) {
      log.error("Serializer test failed: number field", {
        expected: 456,
        got: serialized.d[1],
      });
      test = false;
    }

    // --- boolean ---
    if (serialized.d[2] !== false) {
      log.error("Serializer test failed: boolean field", {
        expected: false,
        got: serialized.d[2],
      });
      test = false;
    }

    // --- date ---
    if (serialized.d[3] !== model.date.toISOString()) {
      log.error("Serializer test failed: date field", {
        expected: model.date.toISOString(),
        got: serialized.d[3],
      });
      test = false;
    }

    // --- array ---
    if (
      !Array.isArray(serialized.d[4]) ||
      serialized.d[4].length !== 2 ||
      serialized.d[4][0] !== "one" ||
      serialized.d[4][1] !== "two"
    ) {
      log.error("Serializer test failed: array field", {
        got: serialized.d[4],
      });
      test = false;
    }

    // --- nested ---
    if (!Array.isArray(serialized.d[5]) || serialized.d[5].length !== 2) {
      log.error("Serializer test failed: nested field", {
        got: serialized.d[5],
      });
      test = false;
    }

    // --- map ---
    if (!Array.isArray(serialized.d[6]) || serialized.d[6].length !== 2) {
      log.error("Serializer test failed: map field", {
        got: serialized.d[6],
      });
      test = false;
    }

    // --- set ---
    if (!Array.isArray(serialized.d[7]) || serialized.d[7].length !== 2) {
      log.error("Serializer test failed: set field", {
        got: serialized.d[7],
      });
      test = false;
    }

    // --- bigint ---
    if (serialized.d[8] !== model.bigint.toString()) {
      log.error("Serializer test failed: bigint field", {
        expected: model.bigint,
        got: serialized.d[8],
      });
      test = false;
    }

    // --- regex ---
    if (
      typeof serialized.d[9] !== "object" ||
      (serialized.d[9] as { s: string; f: string }).s !== "hello" ||
      (serialized.d[9] as { s: string; f: string }).f !== "gi"
    ) {
      log.error("Serializer test failed: regex field", {
        got: serialized.d[9],
      });
      test = false;
    }

    // --- buffer ---
    if (serialized.d[10] !== model.buffer.toString("base64")) {
      log.error("Serializer test failed: buffer field", {
        expected: model.buffer.toString("base64"),
        got: serialized.d[10],
      });
      test = false;
    }

    // --- nan ---
    if (serialized.d[11] !== "N") {
      log.error("Serializer test failed: nan field", {
        expected: "NaN",
        got: serialized.d[11],
      });
      test = false;
    }

    // --- infinity ---
    if (serialized.d[12] !== "I") {
      log.error("Serializer test failed: infinity field", {
        expected: "Infinity",
        got: serialized.d[12],
      });
      test = false;
    }

    // --- negInfinity ---
    if (serialized.d[13] !== "-") {
      log.error("Serializer test failed: negInfinity field", {
        expected: "-Infinity",
        got: serialized.d[13],
      });
      test = false;
    }

    // --- url ---
    if (serialized.d[14] !== model.url.toString()) {
      log.error("Serializer test failed: url field", {
        expected: model.url.toString(),
        got: serialized.d[14],
      });
      test = false;
    }

    // --- error ---
    if (
      (serialized.d[15] as { n: string; m: string; s: string }).n !==
        model.error.name ||
      (serialized.d[15] as { n: string; m: string; s: string }).m !==
        model.error.message ||
      (serialized.d[15] as { n: string; m: string; s: string }).s !==
        model.error.stack
    ) {
      log.error("Serializer test failed: error field", {
        expected: model.error.message,
        got: serialized.d[15],
      });
      test = false;
    }

    // --- uint8Array ---
    if (
      (serialized.d[16] as { t: string; b: string }).b !==
        Buffer.from(model.uint8Array.buffer).toString("base64") ||
      (serialized.d[16] as { t: string; b: string }).t !== "Uint8Array"
    ) {
      log.error("Serializer test failed: Uint8Array field", {
        expected: Buffer.from(model.uint8Array.buffer).toString("base64"),
        got: serialized.d[16],
      });
      test = false;
    }

    // --- uint16Array ---
    if (
      (serialized.d[17] as { t: string; b: string }).b !==
        Buffer.from(model.uint16Array.buffer).toString("base64") ||
      (serialized.d[17] as { t: string; b: string }).t !== "Uint16Array"
    ) {
      log.error("Serializer test failed: Uint16Array field", {
        expected: Buffer.from(model.uint16Array.buffer).toString("base64"),
        got: serialized.d[17],
      });
      test = false;
    }

    // --- uint32Array ---
    if (
      (serialized.d[18] as { t: string; b: string }).b !==
        Buffer.from(model.uint32Array.buffer).toString("base64") ||
      (serialized.d[18] as { t: string; b: string }).t !== "Uint32Array"
    ) {
      log.error("Serializer test failed: Uint32Array field", {
        expected: Buffer.from(model.uint32Array.buffer).toString("base64"),
        got: serialized.d[18],
      });
      test = false;
    }

    // --- bigUint64Array ---
    if (
      (serialized.d[19] as { t: string; b: string }).b !==
        Buffer.from(model.bigUint64Array.buffer).toString("base64") ||
      (serialized.d[19] as { t: string; b: string }).t !== "BigInt64Array"
    ) {
      log.error("Serializer test failed: BigInt64Array field", {
        expected: Buffer.from(model.bigUint64Array.buffer).toString("base64"),
        got: serialized.d[19],
      });
      test = false;
    }

    // --- int8Array ---
    if (
      (serialized.d[20] as { t: string; b: string }).b !==
        Buffer.from(model.int8Array.buffer).toString("base64") ||
      (serialized.d[20] as { t: string; b: string }).t !== "Int8Array"
    ) {
      log.error("Serializer test failed: Int8Array field", {
        expected: Buffer.from(model.int8Array.buffer).toString("base64"),
        got: serialized.d[20],
      });
      test = false;
    }

    // --- int16Array ---
    if (
      (serialized.d[21] as { t: string; b: string }).b !==
        Buffer.from(model.int16Array.buffer).toString("base64") ||
      (serialized.d[21] as { t: string; b: string }).t !== "Int16Array"
    ) {
      log.error("Serializer test failed: Int16Array field", {
        expected: Buffer.from(model.int16Array.buffer).toString("base64"),
        got: serialized.d[21],
      });
      test = false;
    }

    // --- int32Array ---
    if (
      (serialized.d[22] as { t: string; b: string }).b !==
        Buffer.from(model.int32Array.buffer).toString("base64") ||
      (serialized.d[22] as { t: string; b: string }).t !== "Int32Array"
    ) {
      log.error("Serializer test failed: Int32Array field", {
        expected: Buffer.from(model.int32Array.buffer).toString("base64"),
        got: serialized.d[22],
      });
      test = false;
    }

    // --- bigInt64Array ---
    if (
      (serialized.d[23] as { t: string; b: string }).b !==
        Buffer.from(model.bigInt64Array.buffer).toString("base64") ||
      (serialized.d[23] as { t: string; b: string }).t !== "BigInt64Array"
    ) {
      log.error("Serializer test failed: BigInt64Array field", {
        expected: Buffer.from(model.bigInt64Array.buffer).toString("base64"),
        got: serialized.d[23],
      });
      test = false;
    }

    // --- float32Array ---
    if (
      (serialized.d[24] as { t: string; b: string }).b !==
        Buffer.from(model.float32Array.buffer).toString("base64") ||
      (serialized.d[24] as { t: string; b: string }).t !== "Float32Array"
    ) {
      log.error("Serializer test failed: Float32Array field", {
        expected: Buffer.from(model.float32Array.buffer).toString("base64"),
        got: serialized.d[24],
      });
      test = false;
    }

    // --- float64Array ---
    if (
      (serialized.d[25] as { t: string; b: string }).b !==
        Buffer.from(model.float64Array.buffer).toString("base64") ||
      (serialized.d[25] as { t: string; b: string }).t !== "Float64Array"
    ) {
      log.error("Serializer test failed: Float64Array field", {
        expected: Buffer.from(model.float64Array.buffer).toString("base64"),
        got: serialized.d[25],
      });
      test = false;
    }

    if (test) {
      try {
        const deserialized = await TestModel.deserialize(serialized);

        // --- string ---
        if (deserialized.string !== "test string") {
          log.error("Deserialization test failed: string", {
            expected: "test string",
            got: deserialized.string,
          });
          test = false;
        }

        // --- number ---
        if (deserialized.number !== 456) {
          log.error("Deserialization test failed: number", {
            expected: 456,
            got: deserialized.number,
          });
          test = false;
        }

        // --- boolean ---
        if (deserialized.boolean !== false) {
          log.error("Deserialization test failed: boolean", {
            expected: false,
            got: deserialized.boolean,
          });
          test = false;
        }

        // --- date ---
        if (deserialized.date.toISOString() !== model.date.toISOString()) {
          log.error("Deserialization test failed: date", {
            expected: model.date.toISOString(),
            got: deserialized.date,
          });
          test = false;
        }

        // --- array ---
        if (deserialized.array.length !== 2) {
          log.error("Deserialization test failed: array", {
            expected: model.array,
            got: deserialized.array,
          });
          test = false;
        }

        // --- nested ---
        if (deserialized.nested.length !== 2) {
          log.error("Deserialization test failed: nested", {
            expected: model.nested,
            got: deserialized.nested,
          });
          test = false;
        }

        // --- map ---
        if (deserialized.map.size !== 2) {
          log.error("Deserialization test failed: map", {
            expected: model.map,
            got: deserialized.map,
          });
          test = false;
        }

        // --- set ---
        if (deserialized.set.size !== 2) {
          log.error("Deserialization test failed: set", {
            expected: model.set,
            got: deserialized.set,
          });
          test = false;
        }

        // --- bigint ---
        if (deserialized.bigint !== model.bigint) {
          log.error("Deserialization test failed: bigint", {
            expected: model.bigint,
            got: deserialized.bigint,
          });
          test = false;
        }

        // --- regex ---
        if (
          deserialized.regex.source !== "hello" ||
          deserialized.regex.flags !== "gi"
        ) {
          log.error("Deserialization test failed: regex", {
            expected: model.regex,
            got: deserialized.regex,
          });
          test = false;
        }

        // --- buffer ---
        if (
          deserialized.buffer.toString("base64") !==
          model.buffer.toString("base64")
        ) {
          log.error("Deserialization test failed: buffer", {
            expected: model.buffer,
            got: deserialized.buffer,
          });
          test = false;
        }

        // --- nan ---
        if (!Number.isNaN(deserialized.nan)) {
          log.error("Deserialization test failed: nan", {
            expected: model.nan,
            got: deserialized.nan,
          });
          test = false;
        }

        // --- infinity ---
        if (Number.isFinite(deserialized.infinity)) {
          log.error("Deserialization test failed: infinity", {
            expected: model.infinity,
            got: deserialized.infinity,
          });
          test = false;
        }

        // --- negInfinity ---
        if (Number.isFinite(deserialized.negInfinity)) {
          log.error("Deserialization test failed: negInfinity", {
            expected: model.negInfinity,
            got: deserialized.negInfinity,
          });
          test = false;
        }

        // --- url ---
        if (deserialized.url.toString() !== model.url.toString()) {
          log.error("Deserialization test failed: url", {
            expected: model.url,
            got: deserialized.url,
          });
          test = false;
        }

        // --- error ---
        if (
          deserialized.error.name !== model.error.name ||
          deserialized.error.message !== model.error.message ||
          deserialized.error.stack !== model.error.stack
        ) {
          log.error("Deserialization test failed: error", {
            expected: model.error,
            got: deserialized.error,
          });
          test = false;
        }

        // --- uint8Array ---
        if (
          deserialized.uint8Array.length !== model.uint8Array.length ||
          deserialized.uint8Array[0] !== model.uint8Array[0]
        ) {
          log.error("Deserialization test failed: uint8Array", {
            expected: model.uint8Array,
            got: deserialized.uint8Array,
          });
          test = false;
        }

        // --- uint16Array ---
        if (
          deserialized.uint16Array.length !== model.uint16Array.length ||
          deserialized.uint16Array[0] !== model.uint16Array[0]
        ) {
          log.error("Deserialization test failed: uint16Array", {
            expected: model.uint16Array,
            got: deserialized.uint16Array,
          });
          test = false;
        }

        // --- uint32Array ---
        if (
          deserialized.uint32Array.length !== model.uint32Array.length ||
          deserialized.uint32Array[0] !== model.uint32Array[0]
        ) {
          log.error("Deserialization test failed: uint32Array", {
            expected: model.uint32Array,
            got: deserialized.uint32Array,
          });
          test = false;
        }

        // --- uint64Array ---
        if (
          deserialized.bigUint64Array.length !== model.bigUint64Array.length ||
          deserialized.bigUint64Array[0] !== model.bigUint64Array[0]
        ) {
          log.error("Deserialization test failed: uint64Array", {
            expected: model.bigUint64Array,
            got: deserialized.bigUint64Array,
          });
          test = false;
        }

        // --- int8Array ---
        if (
          deserialized.int8Array.length !== model.int8Array.length ||
          deserialized.int8Array[0] !== model.int8Array[0]
        ) {
          log.error("Deserialization test failed: int8Array", {
            expected: model.int8Array,
            got: deserialized.int8Array,
          });
          test = false;
        }

        // --- int16Array ---
        if (
          deserialized.int16Array.length !== model.int16Array.length ||
          deserialized.int16Array[0] !== model.int16Array[0]
        ) {
          log.error("Deserialization test failed: int16Array", {
            expected: model.int16Array,
            got: deserialized.int16Array,
          });
          test = false;
        }

        // --- int32Array ---
        if (
          deserialized.int32Array.length !== model.int32Array.length ||
          deserialized.int32Array[0] !== model.int32Array[0]
        ) {
          log.error("Deserialization test failed: int32Array", {
            expected: model.int32Array,
            got: deserialized.int32Array,
          });
          test = false;
        }

        // --- bigInt64Array ---
        if (
          deserialized.bigInt64Array.length !== model.bigInt64Array.length ||
          deserialized.bigInt64Array[0] !== model.bigInt64Array[0]
        ) {
          log.error("Deserialization test failed: bigInt64Array", {
            expected: model.bigInt64Array,
            got: deserialized.bigInt64Array,
          });
          test = false;
        }

        // --- float32Array ---
        if (
          deserialized.float32Array.length !== model.float32Array.length ||
          deserialized.float32Array[0] !== model.float32Array[0]
        ) {
          log.error("Deserialization test failed: float32Array", {
            expected: model.float32Array,
            got: deserialized.float32Array,
          });
          test = false;
        }

        // --- float64Array ---
        if (
          deserialized.float64Array.length !== model.float64Array.length ||
          deserialized.float64Array[0] !== model.float64Array[0]
        ) {
          log.error("Deserialization test failed: float64Array", {
            expected: model.float64Array,
            got: deserialized.float64Array,
          });
          test = false;
        }
      } catch (e) {
        log.error("Serializer test failed: Deserialization threw", { e });
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
        0: "val",
        99: "unknown",
      },
    };
    const unknownModel = (await TestModel.deserialize(
      unknownData
    )) as TestModel;
    if (
      unknownModel.string !== "val" ||
      unknownModel.unknownFields[99] !== "unknown"
    ) {
      log.error("Serializer test failed: Unknown fields not preserved", {
        unknownModel,
        unknownData: unknownModel.unknownFields,
        inputted: unknownData,
      });
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

    if (player.inventory.arr.length !== 1) {
      log.error(
        "Inv Test Error, inventory should have 1 item",
        player.inventory
      );
      test = false;
    } else if (player.inventory.arr[0]?.quantity !== 1) {
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
