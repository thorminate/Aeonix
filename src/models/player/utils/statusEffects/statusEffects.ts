import aeonix from "../../../../index.js";
import {
  arrayOf,
  ClassConstructor,
  dynamicType,
} from "../../../../utils/typeDescriptor.js";
import {
  baseFields,
  defineField,
  SerializedData,
} from "../../../core/serializable.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";
import StatusEffect, { RawStatusEffect } from "./statusEffect.js";

export interface RawStatusEffects {
  effects: RawStatusEffect[];
}

const v1 = defineField(baseFields, {
  add: {
    effects: {
      id: 1,
      type: arrayOf(
        dynamicType(async (o: SerializedData) => {
          if (
            !o ||
            !(typeof o === "object") ||
            !("d" in o) ||
            !(typeof o.d === "object") ||
            !("2" in o.d!) ||
            !(typeof o.d[2] === "string")
          )
            return StatusEffect as unknown as ClassConstructor;
          const cls = await aeonix.statusEffects.loadRaw(o.d[2]);
          return cls ? cls : (StatusEffect as unknown as ClassConstructor);
        })
      ),
    },
  },
});

export default class StatusEffects extends PlayerSubclassBase<RawStatusEffects> {
  fields = [v1];
  migrators = [];

  effects: StatusEffect[] = [];
}
