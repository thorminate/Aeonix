import aeonix from "#root/index.js";
import {
  arrayOf,
  ClassConstructor,
  dynamicType,
} from "#utils/typeDescriptor.js";
import { baseFields, defineField, SerializedData } from "#core/serializable.js";
import { PlayerSubclassBase } from "#player/utils/playerSubclassBase.js";
import StatusEffect, {
  RawStatusEffect,
} from "#player/utils/statusEffects/statusEffect.js";

export interface RawStatusEffects {
  arr: RawStatusEffect[];
}

const v1 = defineField(baseFields, {
  add: {
    arr: {
      id: 0,
      type: arrayOf(
        dynamicType(async (o: SerializedData) => {
          if (
            !o ||
            !(typeof o === "object") ||
            !("d" in o) ||
            !(typeof o.d === "object") ||
            !("1" in o.d!) ||
            !(typeof o.d[1] === "string")
          )
            return StatusEffect as unknown as ClassConstructor;
          const cls = await aeonix.statusEffects.loadRaw(o.d[1]);
          return cls ? cls : (StatusEffect as unknown as ClassConstructor);
        })
      ),
    },
  },
});

export default class StatusEffects extends PlayerSubclassBase<RawStatusEffects> {
  static override fields = [v1];
  static override migrators = [];

  arr: StatusEffect[] = [];

  apply(effect: StatusEffect) {
    this.arr.push(effect);

    effect.start(this.parent);
  }

  remove(id: string) {
    const idx = this.arr.findIndex((e) => e.id === id);

    this.arr[idx]!.end(this.parent);

    this.arr.splice(idx, 1);
  }
}
