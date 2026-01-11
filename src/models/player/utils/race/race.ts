import { arrayOf } from "#utils/typeDescriptor.js";
import { baseFields, defineField } from "#core/serializable.js";
import { AnyPlayerEvent } from "#player/utils/playerEvents.js";
import { PlayerSubclassBase } from "#player/utils/playerSubclassBase.js";

type RaceTag = string; // placeholder, will be union once implemented

interface Modifier {
  type: string;
  value: number; // usually a multiplier
}

export interface RawRace {
  type: string;
  name: string;
  description: string;
  tags: RaceTag[];
  modifiers: Modifier[];
}

const v1 = defineField(baseFields, {
  add: {
    type: { id: 0, type: String },
    tags: { id: 3, type: arrayOf(String) },
    modifiers: { id: 4, type: arrayOf(Object) },
  },
});

export default abstract class Race extends PlayerSubclassBase<RawRace> {
  static override fields = [v1];
  static override migrators = [];
  static override serializerRoot = Race;
  static override requiredFields = ["name", "description"];

  abstract readonly type: string;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract tags: RaceTag[];

  abstract modifiers: Modifier[];

  abstract onEvent(event: AnyPlayerEvent): void;
}
