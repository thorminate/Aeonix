import ContextualError from "#utils/contextualError.js";
import TypeDescriptor, {
  literalOf,
  NonResolvableTypeDescriptor,
  TypeDescriptorValue,
} from "#utils/typeDescriptor.js";
import util from "util";

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

export interface SerializedData<
  Data extends Record<number, unknown> = Record<number, unknown>
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
  exclude?: boolean;
}

export interface MigrationEntry<
  T extends Record<string, unknown> = Record<string, unknown>
> {
  from: number;
  to: number;
  migrate: (inst: T) => Promise<void> | void;
}

function calculateVersion(fields: Fields<FieldSchema>[]): number {
  let version = 0;
  for (const field of fields) {
    version = Math.max(version, field.version);
  }
  return version;
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
      delete newShape[k as string];
    }
  }

  if (diff.update) {
    Object.assign(newShape, diff.update as Record<string, FieldData>);
  }

  if (diff.add) {
    const existingIds = new Set(Object.values(newShape).map((f) => f.id));
    for (const [key, fieldData] of Object.entries(diff.add)) {
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

type ShapeToObj<Shape extends FieldSchema> = Partial<{
  [K in keyof Shape]: TypeDescriptorValue<Shape[K]["type"]>;
}>;

export default abstract class Serializable<
  T extends object,
  F extends Fields<FieldSchema>[] = Fields<FieldSchema>[]
> {
  protected static readonly requiredFields: string[] = [];
  private _internalUnknownFields: Record<number, unknown> = {};
  private _fieldCache?: Map<number, Fields<FieldSchema>>;

  get unknownFields(): Readonly<Record<number, unknown>> {
    return this._internalUnknownFields;
  }

  abstract readonly fields: F;
  abstract readonly migrators: MigrationEntry[];
  onDeserialize?(data: T, parent?: object): void;

  protected readonly excluded: (keyof T)[] = [];

  private _getFieldsForVersion(
    version: number
  ): Fields<FieldSchema> | undefined {
    if (!this._fieldCache) {
      this._fieldCache = new Map(this.fields.map((f) => [f.version, f]));
    }

    // fast path
    if (this._fieldCache.has(version)) {
      return this._fieldCache.get(version);
    }

    // resolve closest lower version
    let best: Fields<FieldSchema> | undefined;

    for (const [v, fields] of this._fieldCache.entries()) {
      if (v <= version && (!best || v > best.version)) {
        best = fields;
      }
    }

    return best;
  }

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

      const data: Record<number, unknown> = {};

      const version = calculateVersion(this.fields);
      const fieldsForCurrentVersion = this._getFieldsForVersion(version);

      if (!fieldsForCurrentVersion) {
        throw new SerializerError(
          this.constructor.name,
          "Serializable.serialize",
          `No fields found for version ${version}`,
          {
            fields: this.fields,
            version: version,
          }
        );
      }

      for (const [key, field] of Object.entries(
        fieldsForCurrentVersion.shape
      ) as [string, FieldData][]) {
        if (key === "version" || key === "fields") continue;
        if (field.exclude) continue;
        if (this.excluded.includes(key as keyof T)) continue;

        const value = (this as unknown as Record<string, unknown>)[key];
        if (value === undefined || value === null) continue;

        data[(field as FieldData).id] = await this._serializeValue(
          (field as FieldData).type,
          value,
          visited
        );
      }

      const obj: SerializedData = {} as SerializedData;

      obj.v = version;
      obj.d = data;
      if ((this as unknown as { _id: string })._id)
        obj._id = (this as unknown as { _id: string })?._id;

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
        if (
          value &&
          typeof value === "object" &&
          "serialize" in value &&
          typeof value.serialize === "function"
        ) {
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

  private static async _validateValue(
    type: NonResolvableTypeDescriptor,
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
        if (value === null || value === undefined || typeof value !== "object")
          return false;

        return true;
      }

      if (type.kind === "array") {
        return Array.isArray(value);
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

  private static _buildMigrationGraph(
    migrators: MigrationEntry[]
  ): Map<number, number[]> {
    const graph = new Map<number, number[]>();

    for (const { from, to } of migrators) {
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
          { migrators }
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

    return graph;
  }

  private static _findMigrationPath(
    graph: Map<number, number[]>,
    fromVersion: number,
    toVersion: number
  ): number[] | null {
    if (fromVersion === toVersion) return [];

    const queue: { version: number; path: number[] }[] = [
      { version: fromVersion, path: [fromVersion] },
    ];
    const visited = new Set<number>([fromVersion]);

    while (queue.length > 0) {
      const { version: current, path } = queue.shift()!;

      if (current === toVersion) return path;

      const neighbors = graph.get(current) || [];
      for (const next of neighbors) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push({ version: next, path: [...path, next] });
        }
      }
    }

    return null;
  }

  private static async _runMigrations<
    TObj extends object,
    TFields extends Fields<FieldSchema>[]
  >(inst: Serializable<TObj, TFields>, fromVersion: number): Promise<void> {
    try {
      const targetVersion = calculateVersion(inst.fields);
      const graph = this._buildMigrationGraph(inst.migrators);
      const path = this._findMigrationPath(graph, fromVersion, targetVersion);

      if (!path) {
        throw new SerializerError(
          this.name,
          "Serializable.validateMigrationPath",
          `No migration path from v${fromVersion} to v${targetVersion}. `,
          {
            availableMigrations: inst.migrators
              .map((m) => `v${m.from} → v${m.to}`)
              .join(", "),
          }
        );
      }

      for (let i = 0; i < path.length - 1; i++) {
        const from = path[i];
        const to = path[i + 1];

        const step = inst.migrators.find((m) => m.from === from && m.to === to);
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

  static async deserialize<T extends Serializable<T>>(
    this: new () => T,
    input: SerializedData,
    parent?: object,
    ctor: new () => T = this
  ): Promise<T> {
    if (!input || typeof input !== "object" || !input.d) {
      throw new SerializerError(
        this.name,
        "Serializable.deserialize",
        `Invalid input`,
        { input }
      );
    }

    let inst;

    const usedCtor = ctor || this;

    try {
      inst = new usedCtor();
    } catch (e) {
      throw new SerializerError(
        usedCtor.name,
        "Serializable.deserialize",
        `Failed to deserialize: error creating instance`,
        { input },
        e
      );
    }
    try {
      const unknown: Record<number, unknown> = {};

      const fieldsForCurrentVersion = inst._getFieldsForVersion(input.v);

      if (!fieldsForCurrentVersion) {
        throw new SerializerError(
          usedCtor.name,
          "Serializable.deserialize",
          `No fields found for version ${input.v}`,
          {
            fields: inst.fields,
            version: input.v,
          }
        );
      }

      for (const [key, field] of Object.entries(
        fieldsForCurrentVersion.shape
      )) {
        const raw = input?.d?.[(field as FieldData)?.id];
        if (raw === undefined) continue;

        (inst as unknown as Record<string, unknown>)[key] = raw;
      }

      for (const [id, val] of Object.entries(input.d)) {
        const known = Object.values(fieldsForCurrentVersion.shape).some(
          (f) => (f as FieldData).id === Number(id)
        );
        if (!known) unknown[Number(id)] = val;
      }

      inst._internalUnknownFields = unknown;

      for (const key of Object.keys(
        inst as unknown as Record<string, unknown>
      )) {
        const fieldData = fieldsForCurrentVersion.shape[
          key as keyof typeof fieldsForCurrentVersion.shape
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

      const targetVersion = calculateVersion(inst.fields);
      if (input.v !== targetVersion) {
        await Serializable._runMigrations(inst, input.v);
      }

      const requiredProps =
        (usedCtor as { requiredFields?: string[] }).requiredFields || [];

      for (const prop of requiredProps) {
        if (typeof prop !== "string") {
          throw new SerializerError(
            usedCtor.name,
            "Serializable.deserialize",
            `requiredProps contains non-string value`,
            {
              prop,
              propType: typeof prop,
              inst: inst.constructor.name,
              requiredProps,
            }
          );
        }

        const value = (inst as unknown as Record<string, unknown>)[prop];

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
            usedCtor.name,
            "Serializable.deserialize",
            `Abstract property '${prop}' missing after deserialization`,
            {
              prop,
              requiredProps,
              inst: inst.constructor.name,
              availableProps: Object.keys(inst),
            }
          );
        }
      }

      for (const [id] of Object.entries(inst._internalUnknownFields)) {
        const known = Object.values(
          inst._getFieldsForVersion(calculateVersion(inst.fields))!.shape
        ).some((f) => f.id === Number(id));
        if (known) delete inst._internalUnknownFields[Number(id)];
      }

      inst.onDeserialize?.(inst, parent);
      return inst;
    } catch (e) {
      throw new SerializerError(
        usedCtor.name,
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

      if (
        type === String ||
        type === Number ||
        type === Boolean ||
        type === Date
      )
        return value;

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

      if (type.kind === "array" && Array.isArray(value)) {
        return await Promise.all(
          (value as SerializedData[]).map(async (item: SerializedData, i) => {
            const literal = await literalOf(type.of, item);
            if (!literal) {
              throw new SerializerError(
                this.name,
                "Serializable._deserializeValue",
                "Unable to deserialize array item, type could not be resolved.",
                { item, type }
              );
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
      throw new SerializerError(
        this.name,
        "Serializable._deserializeValue",
        `Deserialization failed`,
        { unresolved, value, parentKey, this: this },
        e
      );
    }
  }

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
}
