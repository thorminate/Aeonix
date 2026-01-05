import { arrayOf } from "../../../../utils/typeDescriptor.js";
import { baseFields, defineField } from "../../../core/serializable.js";
import { AnyPlayerEvent } from "../playerEvents.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

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
    type: { id: 1, type: String },
    name: { id: 2, type: String },
    description: { id: 3, type: String },
    tags: { id: 4, type: arrayOf(String) },
    modifiers: { id: 5, type: arrayOf(Object) },
  },
});

export default abstract class Race extends PlayerSubclassBase<RawRace> {
  fields = [v1];
  migrators = [];

  abstract readonly type: string;
  abstract readonly name: string;
  abstract readonly description: string;

  abstract tags: RaceTag[];

  abstract modifiers: Modifier[];

  abstract onEvent(event: AnyPlayerEvent): void;
}
