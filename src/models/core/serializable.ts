import ConcreteConstructor from "#utils/concreteConstructor.js";
import ContextualError from "#utils/contextualError.js";
import TypeDescriptor, {
  literalOf,
  NonResolvableTypeDescriptor,
  TypedArrayConstructor,
  TypeDescriptorValue,
} from "#utils/typeDescriptor.js";
import util from "util";
import isSerializedData from "../player/utils/isSerializedData.js";

// =============
//  Error Types
// =============
export class SerializerError extends ContextualError {
  constructor(
    clsName: string,
    processName: string,
    message: string,
    context: Record<string, unknown>,
    cause?: unknown
  ) {
    super(`${processName} [${clsName}] ${message}`, context, cause);
  }
}

// ============================================================================
// Public Types & Interfaces
// ============================================================================

export interface SerializedData<
  Data extends Record<number, unknown> = Record<number, unknown>
> {
  _id?: string;
  v: number;
  d: Data;
}

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

export interface MigrationEntry<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  from: number;
  to: number;
  migrate: (inst: T) => Promise<void> | void;
}

export type MergeShape<
  PrevShape extends FieldSchema,
  D extends FieldDiff<
    PrevShape,
    Record<string, FieldData>,
    PrevShape,
    keyof PrevShape
  >
> = Omit<
  PrevShape,
  D["remove"] extends (keyof PrevShape)[] ? D["remove"][number] : never
> &
  (D extends { update: infer U } ? (U extends object ? U : object) : object) &
  (D extends { add: infer A } ? (A extends object ? A : object) : object);

export type SerializableClass = typeof Serializable<Record<string, unknown>>;

// ================
//  Internal Types
// ================

interface FieldData {
  id: number;
  type: TypeDescriptor;
  exclude?: boolean;
}

interface SerializableStatic {
  name: string;
  readonly fields: Fields<FieldSchema>[];
  readonly migrators: MigrationEntry[];
}

interface SerializableCache {
  version: number;

  fieldsByIdByVersion: Map<number, Map<number, [string, FieldData]>>;
  serializableFieldsByVersion: Map<number, [string, FieldData][]>;
  knownIdsByVersion: Map<number, Set<number>>;

  migrationGraph: Map<number, number[]>;
  migrationPaths: Map<string, number[] | null>;
  migratorMap: Map<string, MigrationEntry>;

  excludedSet: Set<string>;
  requiredSet: Set<string>;
}

type BaseSerializable = Serializable<Record<string, unknown>>;

type ShapeToObj<Shape extends FieldSchema> = Partial<{
  [K in keyof Shape]: TypeDescriptorValue<Shape[K]["type"]>;
}>;

// ===========
//  Constants
// ===========

export const baseFields: Fields<FieldSchema> = {
  version: 0,
  shape: {},
};

// ==================
//  Public Functions
// ==================

export function defineField<
  PrevShape extends FieldSchema,
  D extends FieldDiff<
    PrevShape,
    Record<string, FieldData>,
    PrevShape,
    keyof PrevShape
  >
>(prev: Fields<PrevShape>, diff: D): Fields<MergeShape<PrevShape, D>> {
  const newShape: Record<string, FieldData> = {
    ...(prev.shape as Record<string, FieldData>),
  };

  if (diff.remove) {
    for (const k of diff.remove) {
      if (!(k in newShape)) {
        throw new Error(`Field ${k.toString()} does not exist, cannot remove`);
      }
      delete newShape[k as string];
    }
  }

  if (diff.update) {
    Object.assign(newShape, diff.update as Record<string, FieldData>);
  }

  if (diff.add) {
    const existingIds = new Set(Object.values(newShape).map((f) => f.id));
    for (const [key, fieldData] of Object.entries(diff.add)) {
      if (fieldData.id < 0) {
        throw new Error(
          `Field ID must be non-negative: ${fieldData.id} (field: ${key})`
        );
      }
      if (existingIds.has(fieldData.id)) {
        throw new Error(
          `Field ID collision: ${fieldData.id} already used (adding ${key})`
        );
      }
    }
    Object.assign(newShape, diff.add as Record<string, FieldData>);
  }

  const ids = new Set<number>();
  for (const [key, field] of Object.entries(newShape)) {
    if (field.id < 0) {
      throw new Error(
        `Field ID must be non-negative: ${field.id} (field: ${key})`
      );
    }
    if (ids.has(field.id)) {
      throw new Error(
        `Duplicate field id ${field.id} detected after defineField() (field: ${key})`
      );
    }
    ids.add(field.id);
  }

  return {
    version: prev.version + 1,
    shape: newShape as MergeShape<PrevShape, D>,
  };
}

// ====================
//  Serializable Class
// ====================

export default abstract class Serializable<T extends object> {
  // ================
  //  Static Members
  // ================

  protected static readonly requiredFields: string[] = [];
  protected static readonly excluded: string[] = [];
  protected static serializerRoot?: SerializableStatic;
  static readonly fields: Fields<FieldSchema>[];
  static readonly migrators: MigrationEntry[];

  private static _cache = new WeakMap<SerializableStatic, SerializableCache>();

  // ==================
  //  Instance Members
  // ==================

  private _internalUnknownFields: Record<number, unknown> = {};

  onDeserialize?(data: T, parent?: object): void;

  // ===========
  //  Accessors
  // ===========

  get unknownFields(): Readonly<Record<number, unknown>> {
    return this._internalUnknownFields;
  }

  // =======================
  //  Static Helper Methods
  // =======================

  private static getSerializerRoot() {
    return this.serializerRoot ?? (this as unknown as SerializableStatic);
  }

  // =========================
  //  Instance Helper Methods
  // =========================

  private _calculateVersion(fields: Fields<FieldSchema>[]): number {
    try {
      return fields.reduce((max, field) => Math.max(max, field.version), 0);
    } catch (e) {
      throw new SerializerError(
        this.constructor.name,
        "Serializable._calculateVersion",
        "Failed to calculate version",
        { fields },
        e
      );
    }
  }

  private _getCache(): SerializableCache {
    const ctor = this.constructor as typeof Serializable;
    const root = ctor.getSerializerRoot();

    if (Serializable._cache.has(root)) {
      return Serializable._cache.get(root)!;
    }

    const cache: SerializableCache = {
      version: this._calculateVersion(ctor.fields),
      fieldsByIdByVersion: new Map(),
      serializableFieldsByVersion: new Map(),
      knownIdsByVersion: new Map(),
      migrationGraph: new Map(),
      migrationPaths: new Map(),
      migratorMap: new Map(),
      excludedSet: new Set(ctor.excluded),
      requiredSet: new Set(ctor.requiredFields),
    };

    const sorted = [...ctor.fields].sort((a, b) => a.version - b.version);

    for (const field of sorted) {
      const byId = new Map<number, [string, FieldData]>();
      const serializable: [string, FieldData][] = [];
      const knownIds = new Set<number>();

      for (const [key, fieldData] of Object.entries(field.shape)) {
        byId.set(fieldData.id, [key, fieldData]);
        knownIds.add(fieldData.id);

        if (
          key !== "version" &&
          key !== "fields" &&
          !fieldData.exclude &&
          !cache.excludedSet.has(key)
        ) {
          serializable.push([key, fieldData]);
        }
      }

      serializable.sort((a, b) => a[1].id - b[1].id);

      cache.fieldsByIdByVersion.set(field.version, byId);
      cache.serializableFieldsByVersion.set(field.version, serializable);
      cache.knownIdsByVersion.set(field.version, knownIds);
    }

    for (const migrator of ctor.migrators) {
      const key = `${migrator.from}->${migrator.to}`;
      if (cache.migratorMap.has(key)) {
        throw new SerializerError(
          root.name,
          "Serializable._getCache",
          `Duplicate migrator: multiple migrations from v${migrator.from} to v${migrator.to}`,
          { migrator }
        );
      }
      cache.migratorMap.set(key, migrator);
    }

    ctor._buildMigrationGraph(cache);

    Serializable._cache.set(root, cache);

    return cache;
  }

  // ===============
  //  Serialization
  // ===============

  async serialize(visited = new WeakSet<object>()): Promise<SerializedData> {
    try {
      if (visited.has(this)) {
        throw new SerializerError(
          this.constructor.name,
          "Serializable.serialize",
          "Circular reference detected",
          { serializable: this }
        );
      }
      visited.add(this);
      const ctor = this.constructor as typeof Serializable;

      const cache = this._getCache();
      const version = cache.version;
      const serializableFields = cache.serializableFieldsByVersion.get(version);

      if (!serializableFields) {
        throw new SerializerError(
          ctor.name,
          "Serializable.serialize",
          `No fields found for version ${version}`,
          {
            fields: ctor.fields,
            version: version,
          }
        );
      }

      const serializationPromises = serializableFields
        .filter(([key]) => {
          const value = (this as unknown as Record<string, unknown>)[key];
          return value !== undefined && value !== null;
        })
        .map(async ([key, field]) => {
          const value = (this as unknown as Record<string, unknown>)[key];
          const serialized = await this._serializeValue(
            field.type,
            value,
            visited
          );
          return [field.id, serialized] as const;
        });

      const serializedFields = await Promise.all(serializationPromises);
      const data: Record<number, unknown> =
        Object.fromEntries(serializedFields);

      const obj: SerializedData = {
        v: version,
        d: data,
      } as SerializedData;

      const id = (this as unknown as { _id?: string })._id;
      if (id !== undefined) {
        obj._id = id;
      }

      return obj as SerializedData;
    } catch (e) {
      throw new SerializerError(
        this.constructor.name,
        "Serializable.serialize",
        "Error serializing object",
        { serializable: this },
        e
      );
    } finally {
      visited.delete(this);
    }
  }

  private async _serializeValue(
    type: TypeDescriptor,
    value: unknown,
    visited: WeakSet<object>
  ): Promise<unknown> {
    try {
      if (typeof type === "function") {
        if (typeof value === "number") {
          if (Number.isNaN(value)) return "N";
          if (value === Infinity) return "I";
          if (value === -Infinity) return "-";
        }

        if (value && typeof value === "object") {
          if ("serialize" in value && typeof value.serialize === "function") {
            if (visited.has(value)) {
              throw new SerializerError(
                this.constructor.name,
                "Serializable._serializeValue",
                "Circular reference detected in nested serializable",
                { serializable: value }
              );
            }
            return value.serialize(visited);
          }

          if (Buffer.isBuffer(value)) {
            return value.toString("base64");
          }

          if (
            value instanceof Uint8Array ||
            value instanceof Uint16Array ||
            value instanceof Uint32Array ||
            value instanceof BigUint64Array ||
            value instanceof Int8Array ||
            value instanceof Int16Array ||
            value instanceof Int32Array ||
            value instanceof BigInt64Array ||
            value instanceof Float32Array ||
            value instanceof Float64Array
          ) {
            return {
              t: value.constructor.name, // minimal key
              b: Buffer.from(value.buffer).toString("base64"),
            };
          }
        }

        if (typeof value === "bigint") return value.toString();
        if (value instanceof Date) return value.toISOString();
        if (value instanceof RegExp) return { s: value.source, f: value.flags };
        if (value instanceof URL) return value.toString();
        if (value instanceof Error)
          return { n: value.name, m: value.message, s: value.stack };

        return value;
      }

      if (type.kind === "resolvable") {
        const resolved = await literalOf(type, value as SerializedData);
        if (!resolved) {
          throw new SerializerError(
            this.constructor.name,
            "Serializable._serializeValue",
            "Unable to resolve type for value",
            { value, type }
          );
        }
        return this._serializeValue(resolved, value, visited);
      }

      if (type.kind === "array") {
        if (!Array.isArray(value)) {
          throw new SerializerError(
            this.constructor.name,
            "Serializable._serializeValue",
            "Expected array, got",
            { value, type }
          );
        }

        return Promise.all(
          value.map(async (item) => {
            const literal = await literalOf(type.of, item);
            return literal
              ? this._serializeValue(literal, item, visited)
              : item;
          })
        );
      }

      if (type.kind === "map") {
        if (!(value instanceof Map)) {
          throw new SerializerError(
            this.constructor.name,
            "Serializable._serializeValue",
            "Expected Map",
            { value, type }
          );
        }

        return Promise.all(
          [...value.entries()].map(async ([k, v]) => [
            await this._serializeValue(type.key, k, visited),
            await this._serializeValue(type.value, v, visited),
          ])
        );
      }

      if (type.kind === "set") {
        if (!(value instanceof Set)) {
          throw new SerializerError(
            this.constructor.name,
            "Serializable._serializeValue",
            "Expected Set",
            { value, type }
          );
        }

        return Promise.all(
          [...value].map((v) => this._serializeValue(type.of, v, visited))
        );
      }

      if (type.kind === "record") {
        const obj = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};

        for (const [k, v] of Object.entries(obj)) {
          out[k] = await this._serializeValue(type.of, v, visited);
        }

        return out;
      }

      if (type.kind === "unknown") {
        return value;
      }

      return value;
    } catch (e) {
      throw new SerializerError(
        this.constructor.name,
        "Serializable._serializeValue",
        "Error serializing value",
        { type, value },
        e
      );
    }
  }

  // =================
  //  Deserialization
  // =================

  static async deserialize<T extends new () => unknown>(
    this: T,
    input: SerializedData,
    parent?: object,
    ctor: typeof Serializable<
      Record<string, unknown>
    > = this as unknown as typeof Serializable
  ): Promise<InstanceType<T>> {
    if (!input || typeof input !== "object" || !isSerializedData(input)) {
      throw new SerializerError(
        this.name,
        "Serializable.deserialize",
        `Invalid input`,
        { input }
      );
    }

    let inst;

    try {
      inst = new (ctor as unknown as ConcreteConstructor<BaseSerializable>)();
    } catch (e) {
      throw new SerializerError(
        ctor.name,
        "Serializable.deserialize",
        `Failed to deserialize: error creating instance`,
        { input },
        e
      );
    }
    try {
      const cache = inst._getCache();

      const fieldsById = cache.fieldsByIdByVersion.get(input.v);
      if (!fieldsById) {
        throw new SerializerError(
          ctor.name,
          "Serializable.deserialize",
          `No fields found for version ${input.v}`,
          {
            fields: ctor.fields,
            version: input.v,
          }
        );
      }

      const unknown: Record<number, unknown> = {};
      const deserializationPromises: Promise<[string, unknown]>[] = [];
      const instRecord = inst as unknown as Record<string, unknown>;

      for (const [idStr, raw] of Object.entries(input.d)) {
        const id = Number(idStr);
        const field = fieldsById.get(id);

        if (field) {
          const [key, fieldData] = field;
          deserializationPromises.push(
            (this as unknown as typeof Serializable)
              ._deserializeValue(fieldData.type, raw, inst, key)
              .then((value) => [key, value])
          );
        } else {
          unknown[id] = raw;
        }
      }

      const results = await Promise.all(deserializationPromises);
      for (const result of results) {
        if (result) {
          instRecord[result[0]] = result[1];
        }
      }

      inst._internalUnknownFields = unknown;

      const targetVersion = cache.version;
      if (input.v !== targetVersion) {
        await (this as unknown as typeof Serializable)._runMigrations(
          inst,
          input.v,
          cache
        );

        const knownIdsAfterMigration =
          cache.knownIdsByVersion.get(targetVersion);
        if (knownIdsAfterMigration) {
          for (const id of Object.keys(inst._internalUnknownFields)) {
            if (knownIdsAfterMigration.has(Number(id))) {
              delete inst._internalUnknownFields[Number(id)];
            }
          }
        }
      }

      for (const prop of cache.requiredSet) {
        const value = instRecord[prop];

        if (value === undefined || value === null) {
          let proto = inst;
          let descriptor;
          let safeguard = 100;

          while (proto && !descriptor && --safeguard > 0) {
            descriptor = Object.getOwnPropertyDescriptor(proto, prop);
            proto = Object.getPrototypeOf(proto);
          }

          if (descriptor?.get) {
            continue;
          }

          throw new SerializerError(
            ctor.name,
            "Serializable.deserialize",
            `Abstract property '${prop}' missing after deserialization`,
            {
              prop,
              requiredProps: cache.requiredSet,
              inst: inst.constructor.name,
              availableProps: Object.keys(inst),
            }
          );
        }
      }

      inst.onDeserialize?.(instRecord, parent);
      return inst as InstanceType<T>;
    } catch (e) {
      throw new SerializerError(
        ctor.name,
        "Serializable.deserialize",
        `Deserialization failed`,
        { inst, input },
        e
      );
    }
  }

  private static async _deserializeValue(
    unresolved: TypeDescriptor,
    value: unknown,
    parent: unknown,
    parentKey: string
  ): Promise<unknown> {
    try {
      const type = await literalOf(unresolved, value as SerializedData);
      if (type === null || type === undefined) return value;

      if (!(await this._validateValue(type, value))) {
        throw new SerializerError(
          this.name,
          "Serializable._deserializeValue",
          `Type mismatch: ${value} (${parentKey}) is not ${type}`,
          { type, value, parent, unresolved }
        );
      }

      if (type === String || type === Boolean) return value;
      if (type === Number) {
        if (value === "N") return NaN;
        if (value === "I") return Infinity;
        if (value === "-") return -Infinity;
        return value;
      }

      if (type === Date) return new Date(value as string);
      if (type === BigInt) return BigInt(value as string);
      if (type === URL) return new URL(value as string);
      if (type === Error) {
        const { n, m, s } = value as { n: string; m: string; s: string };
        const err = new Error(m);
        err.name = n;
        err.stack = s;
        return err;
      }
      if (
        type === Uint8Array ||
        type === Uint16Array ||
        type === Uint32Array ||
        type === BigUint64Array ||
        type === Int8Array ||
        type === Int16Array ||
        type === Int32Array ||
        type === BigInt64Array ||
        type === Float32Array ||
        type === Float64Array
      ) {
        if (
          value &&
          typeof value === "object" &&
          "t" in value &&
          "b" in value
        ) {
          const v = value as { t: keyof typeof globalThis; b: string };
          const ctor = globalThis[v.t] as TypedArrayConstructor | undefined;
          if (!ctor)
            throw new SerializerError(
              this.name,
              "deserialize",
              "Unknown typed array",
              { v }
            );
          const buf = Buffer.from(v.b, "base64");
          return new ctor(
            buf.buffer,
            buf.byteOffset,
            buf.byteLength / ctor.BYTES_PER_ELEMENT
          );
        }
      }
      if (type === Buffer && typeof value === "string") {
        return Buffer.from(value, "base64");
      }
      if (type === RegExp) {
        const { s, f } = value as { s: string; f: string };
        return new RegExp(s, f);
      }

      if (typeof type === "function") {
        if (
          "deserialize" in type &&
          type.deserialize &&
          typeof type.deserialize === "function"
        ) {
          return type.deserialize(value, parent);
        }

        return value;
      }

      if (type.kind === "array") {
        return await Promise.all(
          (value as SerializedData[]).map(async (item, i) => {
            return await this._deserializeValue(
              type.of,
              item,
              value,
              i.toString()
            );
          })
        );
      }

      if (type.kind === "map") {
        const entries = value as [unknown, unknown][];
        const map = new Map();

        for (const [k, v] of entries) {
          map.set(
            await this._deserializeValue(type.key, k, parent, parentKey),
            await this._deserializeValue(type.value, v, parent, parentKey)
          );
        }

        return map;
      }

      if (type.kind === "set") {
        const arr = value as unknown[];
        const set = new Set();

        for (const v of arr) {
          set.add(await this._deserializeValue(type.of, v, parent, parentKey));
        }

        return set;
      }

      if (type.kind === "record") {
        const obj = value as Record<string, unknown>;
        const out: Record<string, unknown> = {};

        for (const [k, v] of Object.entries(obj)) {
          out[k] = await this._deserializeValue(type.of, v, parent, k);
        }

        return out;
      }

      return value;
    } catch (e) {
      throw new SerializerError(
        this.name,
        "Serializable._deserializeValue",
        `Deserialization failed`,
        { unresolved, value, parentKey, this: this },
        e
      );
    }
  }

  private static async _validateValue(
    type: NonResolvableTypeDescriptor,
    value: unknown
  ): Promise<boolean> {
    try {
      if (type === null || type === undefined) return true;

      if (type === String) return typeof value === "string";
      if (type === Number)
        return (
          typeof value === "number" ||
          value === "N" ||
          value === "I" ||
          value === "-"
        );
      if (type === Boolean) return typeof value === "boolean";

      if (type === Date) return typeof value === "string";
      if (type === BigInt) return typeof value === "string";
      if (type === URL) return typeof value === "string";
      if (type === Error)
        return (
          !!value &&
          typeof value === "object" &&
          "n" in value &&
          "m" in value &&
          "s" in value
        );
      if (type === RegExp)
        return (
          !!value && typeof value === "object" && "s" in value && "f" in value
        );
      if (
        type === Uint8Array ||
        type === Uint16Array ||
        type === Uint32Array ||
        type === BigUint64Array ||
        type === Int8Array ||
        type === Int16Array ||
        type === Int32Array ||
        type === BigInt64Array ||
        type === Float32Array ||
        type === Float64Array
      ) {
        return (
          typeof value === "object" &&
          value !== null &&
          "t" in value &&
          "b" in value &&
          value.t === type.name
        );
      }
      if (type === Buffer) return typeof value === "string";

      if (typeof type === "function") {
        if (value === null || value === undefined || typeof value !== "object")
          return false;

        return true;
      }

      if (type.kind === "array" || type.kind === "map" || type.kind === "set")
        return Array.isArray(value);

      if (type.kind === "record") {
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      }

      return type.kind === "unknown";
    } catch (e) {
      throw new SerializerError(
        this.name,
        "Serializable._validateValue",
        "Error validating value",
        {
          type,
          value,
        },
        e
      );
    }
  }

  // ===================
  //  Migration Methods
  // ===================

  private static async _runMigrations<TObj extends Record<string, unknown>>(
    inst: Serializable<TObj>,
    fromVersion: number,
    cache: SerializableCache
  ): Promise<void> {
    try {
      const targetVersion = cache.version;

      if (fromVersion === targetVersion) return;

      const graph = cache.migrationGraph;
      const path = this._buildMigrationPath(
        graph,
        fromVersion,
        targetVersion,
        cache
      );

      if (!path) {
        throw new SerializerError(
          this.name,
          "Serializable.validateMigrationPath",
          `No migration path from v${fromVersion} to v${targetVersion}. `,
          {
            availableMigrations: this.migrators
              .map((m) => `v${m.from} → v${m.to}`)
              .join(", "),
          }
        );
      }

      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];

        const key = `${from}->${to}`;
        const step = cache.migratorMap.get(key);
        if (!step) {
          throw new SerializerError(
            this.name,
            "Serializable._runMigrations",
            `Migration step not found: v${from} → v${to}`,
            { from, to, path }
          );
        }

        try {
          await step.migrate(inst as unknown as Record<string, unknown>);
        } catch (e) {
          throw new SerializerError(
            this.name,
            "Serializable._runMigrations",
            `Migration ${from} → ${to} failed`,
            { from, to, step: `v${from} → v${to}` },
            e
          );
        }
      }
    } catch (e) {
      throw new SerializerError(
        this.name,
        "Serializable._runMigrations",
        "Error running migrations",
        { inst, fromVersion },
        e
      );
    }
  }

  private static _buildMigrationGraph(
    cache: SerializableCache
  ): Map<number, number[]> {
    const cachedGraph = cache.migrationGraph;
    if (cachedGraph.size > 0) return cachedGraph;

    const graph = new Map<number, number[]>();

    for (const { from, to } of this.migrators) {
      if (to <= from) {
        throw new SerializerError(
          this.name,
          "Serializable._buildMigrationGraph",
          `Invalid migration direction: v${from} → v${to} (must increase version)`,
          { from, to }
        );
      }

      if (!graph.has(from)) graph.set(from, []);
      graph.get(from)!.push(to);
    }

    const visited = new Set<number>();
    const stack = new Set<number>();

    const visit = (node: number) => {
      if (stack.has(node)) {
        throw new SerializerError(
          this.name,
          "Serializable._buildMigrationGraph",
          `Migration cycle detected involving v${node}`,
          { migrators: this.migrators }
        );
      }

      if (visited.has(node)) return;

      visited.add(node);
      stack.add(node);

      for (const next of graph.get(node) ?? []) {
        visit(next);
      }

      stack.delete(node);
    };

    for (const node of graph.keys()) {
      visit(node);
    }

    cache.migrationGraph = graph;

    return graph;
  }

  private static _buildMigrationPath(
    graph: Map<number, number[]>,
    fromVersion: number,
    toVersion: number,
    cache: SerializableCache
  ): number[] | null {
    const key = `${fromVersion}->${toVersion}`;

    if (cache.migrationPaths.has(key)) return cache.migrationPaths.get(key)!;

    if (fromVersion === toVersion) return [];

    const queue: { version: number; path: number[] }[] = [
      { version: fromVersion, path: [fromVersion] },
    ];
    const visited = new Set<number>([fromVersion]);

    while (queue.length > 0) {
      const { version: current, path } = queue.shift()!;

      if (current === toVersion) {
        cache.migrationPaths.set(key, path);
        return path;
      }

      const neighbors = graph.get(current) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ version: next, path: [...path, next] });
        }
      }
    }

    cache.migrationPaths.set(key, null);
    return null;
  }

  // =======================
  //  Public static methods
  // =======================

  static defineMigrator<
    FromShape extends FieldSchema,
    ToShape extends FieldSchema
  >(
    from: Fields<FromShape>,
    to: Fields<ToShape>,
    fn: (inst: ShapeToObj<ToShape & FromShape>) => Promise<void> | void
  ): MigrationEntry<ShapeToObj<ToShape & FromShape>> {
    return {
      from: from.version,
      to: to.version,
      migrate: fn,
    };
  }

  [util.inspect.custom](depth: number, options: util.InspectOptions) {
    if (depth <= 0) {
      return `[${this.constructor.name}]`;
    }

    const clone: Record<string, unknown> = {};

    for (const key of Reflect.ownKeys(this)) {
      if (
        key === "_internalUnknownFields" ||
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

  constructor() {
    this._getCache();
  }
}
