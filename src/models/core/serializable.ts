import log from "../../utils/log.js";
import TypeDescriptor, {
  ArrayTypeDescriptor,
  FunctionOrLiteralTypeDescriptor,
  TypeDescriptorResolver,
  TypeDescriptorValue,
  UnknownTypeDescriptor,
} from "../../utils/typeDescriptor.js";

export interface SerializedData<
  Data extends Record<number, unknown> = Record<string, unknown>
> {
  _id?: string;
  v: number;
  d: Data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const baseFields: Fields<any> = {
  version: 0,
  shape: {},
};

interface FieldData {
  id: number;
  type: TypeDescriptor;
}

export interface MigrationEntry<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  FromShape extends Record<string, unknown> = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ToShape extends Record<string, unknown> = any
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
    try {
      const data: Record<number, unknown> = {};

      const version = calculateVersion(this.fields);

      const fieldsForCurrentVersion = this.fields.find(
        (f) => f.version === version
      )?.shape;

      if (!fieldsForCurrentVersion) {
        log({
          header: `No fields found for version ${version}`,
          type: "Error",
          processName: "Serializable.serialize",
          payload: { fields: this.fields, version: version },
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
      log({
        header: "Error serializing object",
        type: "Error",
        processName: "Serializable.serialize",
        payload: { e, serializable: this },
      });
      return;
    }
  }

  private async _serializeValue(
    type: TypeDescriptor,
    value: unknown
  ): Promise<unknown> {
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
                log({
                  header:
                    "Unable to serialize array item, type could not be resolved.",
                  type: "Warn",
                  processName: "Serializable._serializeValue",
                  payload: [item, type],
                });
                return item;
              }
              return await this._serializeValue(literal, item);
            })
          );
        }
      }
      return [];
    } catch (e) {
      log({
        header: "Error serializing value",
        type: "Error",
        processName: "Serializable._serializeValue",
        payload: { e, type, value },
      });
      return [];
    }
  }

  private static async _validateValue(
    type: TypeDescriptor,
    value: unknown
  ): Promise<boolean> {
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
        return !(value === null || value === undefined); // TODO: add checking for custom types
      }

      if (type.kind === "array") {
        const isArray = Array.isArray(value);
        return isArray;
      }

      if ("kind" in type && type.kind === "unknown") return true;

      return false;
    } catch (e) {
      log({
        header: "Error validating value",
        type: "Error",
        processName: "Serializable._validateValue",
        payload: { e, type, value },
      });
      return false;
    }
  }

  private static async _runMigrations<T extends Serializable<T>>(
    this: new () => T,
    data: Record<string, unknown>,
    version: number,
    inst: T
  ): Promise<T> {
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
          log({
            header: `[${this.name}] Migration ${current} → ${step.to} failed`,
            type: "Error",
            processName: "Serializable._runMigrations",
            payload: { e, data: working, step },
          });
        }
      }

      if (safeguard < 0) {
        log({
          header: `[${this.name}] Migration incomplete: exceeded max iterations`,
          type: "Error",
          processName: "Serializable._runMigrations",
          payload: { current, inst, migrators },
        });
      }

      if (current !== version) {
        log({
          header: `[${this.name}] Migration incomplete: stopped at v${current}, expected v${version}`,
          type: "Error",
          processName: "Serializable._runMigrations",
          payload: { current, inst, migrators },
        });
      }

      // resync data version with actual version (some migrator functions dont already do this)
      working.v = current;
      return working as unknown as T;
    } catch (e) {
      log({
        header: `[${this.name}] Migration failed`,
        type: "Error",
        processName: "Serializable._runMigrations",
        payload: { e, data, version, inst },
      });
      return inst;
    }
  }

  static async deserialize<T extends Serializable<T>>(
    this: new () => T,
    input: SerializedData,
    parent?: object
  ): Promise<T> {
    if (!input || typeof input !== "object" || !input.d)
      return input as unknown as T;

    let inst;

    try {
      inst = new this();
    } catch (e) {
      log({
        header: `[${this.name}] Failed to deserialize`,
        type: "Error",
        processName: "Serializable.deserialize",
        payload: { e, input, this: this },
      });
      return input as unknown as T;
    }
    try {
      const version = calculateVersion(inst.fields);

      const unknown: Record<number, unknown> = {};

      const fieldsForCurrentVersion = inst.fields.find(
        (f) => f.version === input.v
      )?.shape;

      if (!fieldsForCurrentVersion) {
        log({
          header: `[${this.name}] No fields found for version ${input.v}`,
          type: "Error",
          processName: "Serializable.deserialize",
          payload: { inst, input },
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
        const raw = input.d[fieldData.id] as unknown;
        (inst as unknown as Record<string, unknown>)[key] =
          await Serializable._deserializeValue.call(
            this,
            fieldData.type,
            raw,
            inst,
            key
          );
      }

      if (input.v !== version) {
        log({
          header: `[${this.name}] Migrating from v${input.v} to v${version}`,
          type: "Info",
          processName: "Serializable.deserialize",
          payload: { inst, input },
        });
        inst = (await Serializable._runMigrations.call(
          this,
          inst as Record<string, unknown>,
          input.v,
          inst
        )) as T;
      }

      inst.onDeserialize?.(inst, parent);
      return inst;
    } catch (e) {
      log({
        header: `[${this.name}] Deserialization failed`,
        type: "Error",
        processName: "Serializable.deserialize",
        payload: { e, input, inst },
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
    try {
      if (!(await this._validateValue(type, value))) {
        log({
          header: `[${this.name}] Type mismatch: ${value} (${parentKey}) is not ${type}`,
          type: "Error",
          processName: "Serializable.deserialize",
          payload: { type, value, parent },
        });
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
              log({
                header: `No fields found for version ${version}`,
                type: "Error",
                processName: "Serializable.deserialize",
                payload: { inst, input: value },
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
            log({
              header: `[${ctor.name}] Failed to calculate version`,
              type: "Error",
              processName: "Serializable.deserialize",
              payload: { inst, input: value, error: e },
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
              log({
                header:
                  "Unable to serialize array item, type could not be resolved.",
                type: "Warn",
                processName: "Serializable._serializeValue",
                payload: [item, type],
              });
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
      log({
        header: `[${this.name}] Deserialization failed`,
        type: "Error",
        processName: "Serializable.deserialize",
        payload: { e, input: value, this: JSON.stringify(this) },
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
    fn: (
      data: Partial<{
        [K in keyof FromShape]: TypeDescriptorValue<FromShape[K]["type"]>;
      }>
    ) => Promise<
      Partial<{
        [K in keyof ToShape]: TypeDescriptorValue<ToShape[K]["type"]>;
      }>
    >
  ): MigrationEntry<
    Partial<{
      [K in keyof FromShape]: TypeDescriptorValue<FromShape[K]["type"]>;
    }>,
    Partial<{ [K in keyof ToShape]: TypeDescriptorValue<ToShape[K]["type"]> }>
  > {
    return {
      from: from.version,
      to: to.version,
      migrate: fn,
    };
  }
}
