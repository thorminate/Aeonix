import TypeDescriptor, {
  ArrayTypeDescriptor,
} from "../../utils/typeDescriptor.js";

export interface SerializedData {
  _id?: string;
  v: number;
  d: Record<number, unknown>;
}

export interface FieldData {
  id: number;
  type: TypeDescriptor;
  previousAliases?: string[]; // TODO: use this for backwards compatibility (UNIMPLEMENTED)
}

export function arrayOf(type: TypeDescriptor): ArrayTypeDescriptor {
  return { kind: "array", of: type } as ArrayTypeDescriptor;
}

export type SerializableKeys<T> = Exclude<
  {
    [K in keyof T]: T[K] extends (...args: unknown[]) => unknown ? never : K;
  }[keyof T],
  "fields" | "version" | "_unknownFields"
>;
export type FieldSchema<T> = Partial<Record<SerializableKeys<T>, FieldData>>;

export default abstract class VersionedSerializable<T extends object> {
  _unknownFields: Record<number, unknown> = {};
  abstract version: number;
  abstract fields: FieldSchema<T>;

  protected excluded: string[] = [];

  serialize(extraExclusions?: string[]): SerializedData {
    const data: Record<number, unknown> = {};

    for (const [key, field] of Object.entries(this.fields)) {
      if (key === "version" || key === "fields") continue;
      this.excluded = [
        ...(Array.isArray(this.excluded) ? this.excluded : []),
        ...(Array.isArray(extraExclusions) ? extraExclusions : []),
      ];

      if (this.excluded.includes(key)) continue;

      const value = (this as unknown as Record<string, unknown>)[key];
      if (value === undefined) continue;

      data[(field as FieldData).id] = this._serializeValue(
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

  private _serializeValue(type: TypeDescriptor, value: unknown): unknown {
    if (typeof type === "function") {
      if (
        value &&
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
        return value.map((item: unknown) =>
          this._serializeValue(type.of, item)
        );
      }
    }
    return [];
  }

  static deserialize<T extends VersionedSerializable<T>>(
    this: new () => T,
    input: SerializedData
  ): T {
    const inst = new this();
    const unknown: Record<number, unknown> = {};

    for (const [key, field] of Object.entries(inst.fields)) {
      const raw = input.d[(field as FieldData).id];
      if (raw === undefined) continue;

      (inst as unknown as Record<string, unknown>)[key] =
        inst._deserializeValue((field as FieldData).type, raw);
    }

    // preserve unknown fields
    for (const [id, val] of Object.entries(input.d)) {
      const known = Object.values(inst.fields).some(
        (f) => (f as FieldData).id === Number(id)
      );
      if (!known) unknown[Number(id)] = val;
    }

    inst._unknownFields = unknown;
    return inst;
  }

  private _deserializeValue(type: TypeDescriptor, value: unknown): unknown {
    if (typeof type === "function") {
      if (
        "deserialize" in type &&
        type.deserialize &&
        typeof type.deserialize === "function" &&
        typeof value === "object"
      ) {
        return type.deserialize();
      }

      return value;
    }

    if (type.kind === "array") {
      if (Array.isArray(value)) {
        return value.map((item: unknown) =>
          this._deserializeValue(type.of, item)
        );
      }
    }
    return [];
  }
}
