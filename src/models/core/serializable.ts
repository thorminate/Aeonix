import aeonix from "../../index.js";
import TypeDescriptor, {
  ArrayTypeDescriptor,
  FunctionOrLiteralTypeDescriptor,
  TypeDescriptorResolver,
  TypeDescriptorValue,
  UnknownTypeDescriptor,
} from "../../utils/typeDescriptor.js";
import util from "util";

export interface SerializedData<
  Data extends Record<number, unknown> = Record<string, unknown>
> {
  _id?: string;
  v: number;
  d: Data;
}

export const baseFields: Fields<FieldSchema> = {
  version: 0,
  shape: {},
};

interface FieldData {
  id: number;
  type: TypeDescriptor;
}

export interface MigrationEntry<
  FromShape extends Record<string, unknown> = Record<string, unknown>,
  ToShape extends Record<string, unknown> = Record<string, unknown>
> {
  from: number;
  to: number;
  migrate: (data: FromShape) => Promise<ToShape>;
}

function calculateVersion(fields: Fields<FieldSchema>[]): number {
  let version = 0;
  for (const field of Object.values(fields)) {
    version = Math.max(version, field.version);
  }
  return version;
}

export function arrayOf(type: TypeDescriptor): ArrayTypeDescriptor {
  return { kind: "array", of: type } as ArrayTypeDescriptor;
}
export function dynamicArrayOf(typeResolver: TypeDescriptorResolver) {
  return {
    kind: "array",
    of: typeResolver,
  } as ArrayTypeDescriptor;
}
async function literalOf(
  f: FunctionOrLiteralTypeDescriptor,
  value: SerializedData
): Promise<TypeDescriptor | undefined> {
  if (f === String || f === Number || f === Boolean || f === Date)
    return f as TypeDescriptor;

  if (
    /^class\s/.test(Function.prototype.toString.call(f)) ||
    typeof f === "object"
  ) {
    return f as TypeDescriptor;
  }

  return (f as TypeDescriptorResolver)(value);
}

export const Unknown: UnknownTypeDescriptor = { kind: "unknown" };

export type SerializableKeys<T> = Exclude<
  {
    [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
  }[keyof T],
  "fields" | "version" | "_unknownFields"
>;
export type FieldSchema = Record<string, FieldData>;

export interface Fields<Shape extends FieldSchema> {
  version: number;
  shape: Shape;
}

export type FieldDiff<
  PrevShape extends FieldSchema,
  Add extends Record<string, FieldData> | never = never,
  Update extends Partial<PrevShape> | never = never,
  Remove extends keyof PrevShape | never = never
> = {
  add?: Add extends never ? undefined : Add;
  update?: Update extends never ? undefined : Update;
  remove?: Remove extends never ? undefined : Remove[];
};

export type MergeShape<
  PrevShape extends FieldSchema,
  D extends FieldDiff<
    PrevShape,
    Record<string, FieldData>,
    PrevShape,
    keyof PrevShape
  >
> =
  // start from prev minus removed keys
  Omit<
    PrevShape,
    D["remove"] extends (keyof PrevShape)[] ? D["remove"][number] : never
  > &
    // apply updates (if any)
    (D extends { update: infer U } ? (U extends object ? U : object) : object) &
    // apply adds (if any)
    (D extends { add: infer A } ? (A extends object ? A : object) : object);

export function defineField<
  PrevShape extends FieldSchema,
  D extends FieldDiff<
    PrevShape,
    Record<string, FieldData>,
    PrevShape,
    keyof PrevShape
  >
>(prev: Fields<PrevShape>, diff: D): Fields<MergeShape<PrevShape, D>> {
  // runtime mutable copy starts from the exact prev.shape
  const newShape: Record<string, FieldData> = {
    ...(prev.shape as Record<string, FieldData>),
  };

  if (diff.remove) {
    for (const k of diff.remove) {
      delete newShape[k as string];
    }
  }

  if (diff.update) {
    Object.assign(newShape, diff.update as Record<string, FieldData>);
  }

  if (diff.add) {
    Object.assign(newShape, diff.add as Record<string, FieldData>);
  }

  // assert here — we constructed newShape to match the type-level MergeShape
  return {
    version: prev.version + 1,
    shape: newShape as MergeShape<PrevShape, D>,
  };
}

type ShapeToObj<Shape extends FieldSchema> = Partial<{
  [K in keyof Shape]: TypeDescriptorValue<Shape[K]["type"]>;
}>;

export default abstract class Serializable<
  T extends object,
  F extends Fields<FieldSchema>[] = Fields<FieldSchema>[]
> {
  _unknownFields: Record<number, unknown> = {};
  abstract fields: F;
  abstract migrators: MigrationEntry[];
  onDeserialize?(data: T, parent?: object): void;

  protected excluded: string[] = [];

  async serialize(): Promise<SerializedData | undefined> {
    const log = aeonix.logger.for("Serializable.serialize");
    try {
      const data: Record<number, unknown> = {};

      const version = calculateVersion(this.fields);

      const fieldsForCurrentVersion = this.fields.find(
        (f) => f.version === version
      )?.shape;

      if (!fieldsForCurrentVersion) {
        log.error(`No fields found for version ${version}`, {
          fields: this.fields,
          version: version,
        });
        return;
      }

      for (const [key, field] of Object.entries(fieldsForCurrentVersion) as [
        string,
        FieldData
      ][]) {
        if (key === "version" || key === "fields") continue;
        if (this.excluded.includes(key)) continue;

        const value = (this as unknown as Record<string, unknown>)[key];
        if (value === undefined || value === null) continue;

        data[(field as FieldData).id] = await this._serializeValue(
          (field as FieldData).type,
          value
        );
      }

      const obj: SerializedData = {} as SerializedData;

      obj.v = version;
      obj.d = data;
      if ((this as unknown as { _id: string })._id)
        obj._id = (this as unknown as { _id: string })?._id;

      return obj as SerializedData;
    } catch (e) {
      log.error("Error serializing object", { e, serializable: this });
      return;
    }
  }

  private async _serializeValue(
    type: TypeDescriptor,
    value: unknown
  ): Promise<unknown> {
    const log = aeonix.logger.for("Serializable._serializeValue");
    try {
      if (typeof type === "function") {
        if (
          value !== null &&
          value !== undefined &&
          typeof value === "object" &&
          "serialize" in value &&
          value.serialize &&
          typeof value.serialize === "function"
        ) {
          return value.serialize(value);
        }

        return value;
      }

      if (type.kind === "array") {
        if (Array.isArray(value)) {
          return await Promise.all(
            value.map(async (item: SerializedData) => {
              const literal = await literalOf(type.of, item);
              if (!literal) {
                log.warn(
                  "Unable to serialize array item, type could not be resolved.",
                  item,
                  type
                );
                return item;
              }
              return await this._serializeValue(literal, item);
            })
          );
        }
      }
      return [];
    } catch (e) {
      log.error("Error serializing value", e, { type, value });
      return [];
    }
  }

  private static async _validateValue(
    type: TypeDescriptor,
    value: unknown
  ): Promise<boolean> {
    const log = aeonix.logger.for("Serializable._validateValue");
    try {
      if (type === null || type === undefined) return true;

      if (
        type === String ||
        type === Number ||
        type === Boolean ||
        type === Date
      )
        return (
          (type === String && typeof value === "string") ||
          (type === Number && typeof value === "number") ||
          (type === Boolean && typeof value === "boolean") ||
          (type === Date && value instanceof Date)
        );

      if (typeof type === "function") {
        return typeof value === "object";
      }

      if (type.kind === "array") {
        const isArray = Array.isArray(value);
        return isArray;
      }

      if ("kind" in type && type.kind === "unknown") return true;

      return false;
    } catch (e) {
      log.error("Error validating value", e, { type, value });
      return false;
    }
  }

  private static async _runMigrations<T extends Serializable<T>>(
    this: new () => T,
    data: Record<string, unknown>,
    version: number,
    inst: T
  ): Promise<T> {
    const log = aeonix.logger.for("Serializable._runMigrations");
    try {
      const migrators = [...(inst.migrators ?? [])].sort(
        (a, b) => a.from - b.from
      );

      let current = version;
      let working = data;

      let safeguard = 1000;

      while (safeguard-- > 0) {
        const step = migrators.find((m) => m.from === current);
        if (!step) break;
        try {
          working = await step.migrate(working);
          current = step.to;
        } catch (e) {
          log.error(
            `[${this.name}] Migration ${current} → ${step.to} failed`,
            e,
            {
              migrator: step,
              data,
            }
          );
        }
      }

      if (safeguard < 0) {
        log.error(
          `[${this.name}] Migration incomplete: exceeded max iterations`,
          {
            current,
            inst,
            migrators,
          }
        );
      }

      const targetVersion = calculateVersion(inst.fields);
      if (current !== targetVersion) {
        log.error(
          `[${this.name}] Migration incomplete: stopped at v${current}, expected v${targetVersion}`,
          {
            current,
            inst,
            migrators,
          }
        );
      }

      // resync data version with actual version (some migrator functions don't already do this)
      working.v = current;
      return working as unknown as T;
    } catch (e) {
      log.error("Error running migrations", e, { inst, data, version });
      return inst;
    }
  }

  static async deserialize<T extends Serializable<T>>(
    this: new () => T,
    input: SerializedData,
    parent?: object,
    ctor: new () => T = this
  ): Promise<T> {
    const log = aeonix.logger.for("Serializable.deserialize");
    if (!input || typeof input !== "object" || !input.d)
      return input as unknown as T;

    let inst;

    const usedCtor = ctor || this;

    try {
      inst = new usedCtor();
    } catch (e) {
      log.error(
        `[${usedCtor.name}] Failed to deserialize: error creating instance`,
        e,
        { input }
      );
      return input as unknown as T;
    }
    try {
      const version = calculateVersion(inst.fields);

      const unknown: Record<number, unknown> = {};

      const fieldsForCurrentVersion = inst.fields.find(
        (f) => f.version === input.v
      )?.shape;

      if (!fieldsForCurrentVersion) {
        log.error(`[${usedCtor.name}] No fields found for version ${input.v}`, {
          fields: inst.fields,
          version: input.v,
        });
        return inst;
      }

      for (const [key, field] of Object.entries(fieldsForCurrentVersion)) {
        const raw = input?.d?.[(field as FieldData)?.id];
        if (raw === undefined) continue;

        (inst as unknown as Record<string, unknown>)[key] = raw;
      }

      // preserve unknown fields
      for (const [id, val] of Object.entries(input.d)) {
        const known = Object.values(fieldsForCurrentVersion).some(
          (f) => (f as FieldData).id === Number(id)
        );
        if (!known) unknown[Number(id)] = val;
      }

      inst._unknownFields = unknown;

      for (const key of Object.keys(
        inst as unknown as Record<string, unknown>
      )) {
        const fieldData = fieldsForCurrentVersion[
          key as keyof typeof fieldsForCurrentVersion
        ] as FieldData | undefined;
        if (!fieldData) continue;
        const value = (inst as unknown as Record<string, unknown>)[key];

        (inst as unknown as Record<string, unknown>)[key] =
          await Serializable._deserializeValue.call(
            usedCtor,
            fieldData.type,
            value,
            inst,
            key
          );
      }

      if (input.v !== version) {
        inst = (await Serializable._runMigrations.call(
          usedCtor,
          inst as Record<string, unknown>,
          input.v,
          inst
        )) as T;
      }

      inst.onDeserialize?.(inst, parent);
      return inst;
    } catch (e) {
      log.error(`[${usedCtor.name}] Deserialization failed`, e, {
        inst,
        input,
      });
      return inst;
    }
  }

  private static async _deserializeValue(
    type: TypeDescriptor,
    value: unknown,
    parent: unknown,
    parentKey: string
  ): Promise<unknown> {
    const log = aeonix.logger.for("Serializable._deserializeValue");
    try {
      if (!(await this._validateValue(type, value))) {
        log.error(
          `[${this.name}] Type mismatch: ${value} (${parentKey}) is not ${type}`,
          { type, value, parent }
        );
      }

      if (
        type === String ||
        type === Number ||
        type === Boolean ||
        type === Date
      )
        return value;

      if (typeof type === "function") {
        const ctor = type as new () => object;
        if (
          "deserialize" in type &&
          type.deserialize &&
          typeof type.deserialize === "function" &&
          typeof value === "object"
        ) {
          return type.deserialize(value, parent);
        }

        const inst = new ctor();
        if ("fields" in inst && typeof inst.fields === "object") {
          try {
            const version = calculateVersion(
              inst.fields as Fields<FieldSchema>[]
            );

            const fieldMap = (inst.fields as Fields<FieldSchema>[]).find(
              (f) => f.version === version
            )?.shape as Record<string, FieldData> | undefined;

            if (!fieldMap) {
              log.error(`No fields found for version ${version}`, {
                fields: inst.fields,
                version: version,
              });
              return value;
            }

            if (
              value !== null &&
              value !== undefined &&
              typeof value === "object"
            ) {
              for (const [key, field] of Object.entries(value)) {
                const fieldType = fieldMap[key as keyof typeof fieldMap]?.type;
                if (fieldType) {
                  (inst as Record<string, unknown>)[key] =
                    await this._deserializeValue(fieldType, field, inst, key);
                } else {
                  (inst as Record<string, unknown>)[key] = field;
                }
              }

              return inst;
            }
          } catch (e) {
            log.error(`[${ctor.name}] Failed to calculate version`, e, {
              fields: inst.fields,
            });
          }
        }

        return value;
      }

      if (type.kind === "array" && Array.isArray(value)) {
        return await Promise.all(
          (value as SerializedData[]).map(async (item: SerializedData, i) => {
            const literal = await literalOf(type.of, item);
            if (!literal) {
              log.warn(
                "Unable to serialize array item, type could not be resolved.",
                { item, type }
              );
              return item;
            }
            return await this._deserializeValue(
              literal,
              item,
              value,
              i.toString()
            );
          })
        );
      }

      return value;
    } catch (e) {
      log.error(`[${this.name}] Deserialization failed`, e, {
        type,
        value,
        this: JSON.stringify(this),
      });
      return value;
    }
  }

  static defineMigrator<
    FromShape extends FieldSchema,
    ToShape extends FieldSchema
  >(
    from: Fields<FromShape>,
    to: Fields<ToShape>,
    fn: (data: ShapeToObj<FromShape>) => Promise<ShapeToObj<ToShape>>
  ): MigrationEntry<ShapeToObj<FromShape>, ShapeToObj<ToShape>> {
    return {
      from: from.version,
      to: to.version,
      migrate: fn,
    };
  }

  [util.inspect.custom](depth: number, options: util.InspectOptionsStylized) {
    if (depth <= 0) {
      return `[${this.constructor.name}]`;
    }

    const clone: Record<string, unknown> = {};

    for (const key of Reflect.ownKeys(this)) {
      if (
        key === "_unknownFields" ||
        key === "excluded" ||
        key === "migrators" ||
        key === "fields" ||
        key === "parent"
      ) {
        continue;
      }

      clone[key as string] = (this as unknown as Record<string, unknown>)[
        key as string
      ];
    }

    return `${this.constructor.name} ${util.inspect(clone, {
      ...options,
      depth: depth - 1,
    })}`;
  }
}
