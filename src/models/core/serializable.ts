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

export interface FieldData {
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
export type FieldSchema<T> = Partial<Record<SerializableKeys<T>, FieldData>>;

export interface Fields<T> {
  version: number;
  shape: FieldSchema<T>;
}

type FieldDiff<T> = {
  add?: Partial<FieldSchema<T>>;
  remove?: (keyof FieldSchema<T>)[];
  update?: Partial<FieldSchema<T>>;
};

type MergeFieldDiff<
  T extends object,
  Prev extends Fields<T>,
  Diff extends FieldDiff<T>
> = Omit<
  Prev,
  Diff["remove"] extends (keyof Prev)[] ? Diff["remove"][number] : never
> &
  (Diff["update"] extends Record<string, FieldData> ? Diff["update"] : object) &
  (Diff["add"] extends Record<string, FieldData> ? Diff["add"] : object);

export function defineField<
  T extends object,
  Prev extends Fields<T>,
  Diff extends FieldDiff<T>
>(prev: Prev, diff: Diff): MergeFieldDiff<T, Prev, Diff> {
  const newShape: FieldSchema<T> = { ...prev.shape };

  // Remove fields
  if (diff.remove) {
    for (const key of diff.remove) {
      delete newShape[key as keyof typeof newShape];
    }
  }

  // Add fields
  if (diff.add) {
    Object.assign(newShape, diff.add);
  }

  // Update existing fields
  if (diff.update) {
    Object.assign(newShape, diff.update);
  }

  return {
    version: prev.version + 1,
    shape: newShape,
  } as unknown as MergeFieldDiff<T, Prev, Diff>;
}

export type PartialObjectFromShape<S extends Record<string, FieldData>> = {
  [K in keyof S]?: TypeDescriptorValue<S[K]["type"]>;
};

export type ObjectFromShape<S extends Record<string, FieldData>> = {
  [K in keyof S]: TypeDescriptorValue<S[K]["type"]>;
};

export default abstract class Serializable<
  T extends object,
  F extends readonly Fields<T>[] = Fields<T>[]
> {
  _unknownFields: Record<number, unknown> = {};
  abstract version: F[number]["version"];
  abstract fields: F;
  abstract migrators: MigrationEntry[];
  onDeserialize?(data: T, parent?: object): void;

  protected excluded: string[] = [];

  async serialize(): Promise<SerializedData | undefined> {
    const data: Record<number, unknown> = {};

    const fieldsForCurrentVersion = this.fields.find(
      (f) => f.version === this.version
    )?.shape;

    if (!fieldsForCurrentVersion) {
      log({
        header: `No fields found for version ${this.version}`,
        type: "Error",
        processName: "Serializable.serialize",
        payload: { fields: this.fields, version: this.version },
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

    obj.v = this.version;
    obj.d = data;
    if ((this as unknown as { _id: string })._id)
      obj._id = (this as unknown as { _id: string })?._id;

    return obj as SerializedData;
  }

  private async _serializeValue(
    type: TypeDescriptor,
    value: unknown
  ): Promise<unknown> {
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
  }

  private static async _validateValue(
    type: TypeDescriptor,
    value: unknown
  ): Promise<boolean> {
    if (type === String || type === Number || type === Boolean || type === Date)
      return (
        (type === String && typeof value === "string") ||
        (type === Number && typeof value === "number") ||
        (type === Boolean && typeof value === "boolean") ||
        (type === Date && value instanceof Date)
      );

    if (typeof type === "function") {
      return true; // TODO: add checking for custom types
    }

    if (type.kind === "array") {
      return Array.isArray(value);
    }

    if ("kind" in type && type.kind === "unknown") return true;

    return false;
  }

  private static async _runMigrations<T extends Serializable<T>>(
    this: new () => T,
    data: Record<string, unknown>,
    version: number,
    inst: T
  ): Promise<T> {
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

    if (current !== inst.version) {
      log({
        header: `[${this.name}] Migration incomplete: stopped at v${current}, expected v${inst.version}`,
        type: "Error",
        processName: "Serializable._runMigrations",
        payload: { current, inst, migrators },
      });
    }

    // resync data version with actual version (some migrator functions dont already do this)
    working.v = current;
    return working as unknown as T;
  }

  static async deserialize<T extends Serializable<T>>(
    this: new () => T,
    input: SerializedData,
    parent?: object
  ): Promise<T> {
    if (!input || typeof input !== "object" || !input.d)
      return input as unknown as T;

    let inst = new this();

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

    for (const key of Object.keys(inst as unknown as Record<string, unknown>)) {
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
          inst
        );
    }

    if (input.v !== inst.version) {
      log({
        header: `[${this.name}] Migrating from v${input.v} to v${inst.version}`,
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
  }

  private static async _deserializeValue(
    type: TypeDescriptor,
    value: unknown,
    parent: unknown
  ): Promise<unknown> {
    if (!this._validateValue(type, value)) {
      throw new TypeError(
        "Invalid value for type: " + type + " value: " + value
      );
    }

    if (type === String || type === Number || type === Boolean || type === Date)
      return value;

    if (typeof type === "function") {
      const ctor = type as new () => unknown;
      if (
        "deserialize" in type &&
        type.deserialize &&
        typeof type.deserialize === "function" &&
        typeof value === "object"
      ) {
        return type.deserialize(value, parent);
      }

      const inst = new ctor() as { version: number };
      const fieldMap = (inst as Serializable<typeof inst>).fields.find(
        (f) => f.version === inst.version
      )?.shape as Record<string, FieldData> | undefined;

      if (!fieldMap) {
        log({
          header: `No fields found for version ${inst.version}`,
          type: "Error",
          processName: "Serializable.deserialize",
          payload: { inst, input: value },
        });
        return value;
      }

      if (value !== null && value !== undefined && typeof value === "object") {
        for (const [key, field] of Object.entries(value)) {
          const fieldType = fieldMap[key as keyof typeof fieldMap]?.type;
          if (fieldType) {
            (inst as Record<string, unknown>)[key] = this._deserializeValue(
              fieldType,
              field,
              inst
            );
          } else {
            (inst as Record<string, unknown>)[key] = field;
          }
        }

        return inst;
      }
      return value;
    }

    if (type.kind === "array") {
      return await Promise.all(
        (value as SerializedData[]).map(async (item: SerializedData) => {
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
          return await this._deserializeValue(literal, item, value);
        })
      );
    }

    return value;
  }

  static defineMigrator<
    T extends Serializable<T>,
    FromShape extends Record<string, FieldData>,
    ToShape extends Record<string, FieldData>
  >(
    from: Fields<T> & { shape: FromShape },
    to: Fields<T> & { shape: ToShape },
    fn: (data: {
      [K in keyof FromShape]: TypeDescriptorValue<FromShape[K]["type"]>;
    }) => Promise<{
      [K in keyof ToShape]: TypeDescriptorValue<ToShape[K]["type"]>;
    }>
  ): MigrationEntry<
    { [K in keyof FromShape]: TypeDescriptorValue<FromShape[K]["type"]> },
    { [K in keyof ToShape]: TypeDescriptorValue<ToShape[K]["type"]> }
  > {
    return { from: from.version, to: to.version, migrate: fn };
  }
}
