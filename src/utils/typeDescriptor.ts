import { SerializedData } from "#core/serializable.js";

/* ========================
 *  Primitive constructors
 * ======================== */

export type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | BigUint64ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | BigInt64ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

export type PrimitiveConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | BigIntConstructor
  | RegExpConstructor
  | TypedArrayConstructor
  | typeof URL
  | ErrorConstructor;

/* ==========
 *  Resolver
 * ========== */

export type TypeDescriptorResolver = (
  value: SerializedData
) =>
  | NonResolvableTypeDescriptor
  | Promise<NonResolvableTypeDescriptor | undefined>
  | undefined;

/* =============
 *  Descriptors
 * ============= */

export interface ArrayTypeDescriptor {
  kind: "array";
  of: TypeDescriptor;
}

export interface MapDescriptor {
  kind: "map";
  key: TypeDescriptor;
  value: TypeDescriptor;
}

export interface SetDescriptor {
  kind: "set";
  of: TypeDescriptor;
}

export interface RecordDescriptor {
  kind: "record";
  of: TypeDescriptor;
}

export interface UnknownTypeDescriptor {
  kind: "unknown";
}

export interface ResolvableType {
  kind: "resolvable";
  resolver: TypeDescriptorResolver;
}

export type ClassConstructor = new (...args: unknown[]) => unknown;

export type TypeDescriptor =
  | PrimitiveConstructor
  | ClassConstructor
  | ArrayTypeDescriptor
  | MapDescriptor
  | SetDescriptor
  | RecordDescriptor
  | UnknownTypeDescriptor
  | ResolvableType;

export type NonResolvableTypeDescriptor =
  | PrimitiveConstructor
  | ClassConstructor
  | ArrayTypeDescriptor
  | MapDescriptor
  | SetDescriptor
  | RecordDescriptor
  | UnknownTypeDescriptor;

export default TypeDescriptor;

/* ==============================
 *  Type → runtime value mapping
 * ============================== */

export type TypeDescriptorValue<T extends TypeDescriptor> =
  T extends StringConstructor
    ? string
    : T extends NumberConstructor
    ? number
    : T extends BooleanConstructor
    ? boolean
    : T extends DateConstructor
    ? Date
    : T extends ClassConstructor
    ? InstanceType<T>
    : T extends ArrayTypeDescriptor
    ? Array<TypeDescriptorValue<T["of"]>>
    : T extends UnknownTypeDescriptor
    ? unknown
    : never;

/* =====================
 *  Constants & helpers
 * ===================== */

export const Unknown: UnknownTypeDescriptor = { kind: "unknown" };

export function arrayOf(of: TypeDescriptor): ArrayTypeDescriptor {
  return { kind: "array", of };
}

export function mapOf(k: TypeDescriptor, v: TypeDescriptor): MapDescriptor {
  return { kind: "map", key: k, value: v };
}

export function setOf(of: TypeDescriptor): SetDescriptor {
  return { kind: "set", of };
}

export function recordOf(of: TypeDescriptor): RecordDescriptor {
  return { kind: "record", of };
}

export function dynamicType(resolver: TypeDescriptorResolver): ResolvableType {
  return { kind: "resolvable", resolver };
}

/* ============
 *  Resolution
 * ============ */

export async function literalOf(
  descriptor: TypeDescriptor,
  value: SerializedData
): Promise<NonResolvableTypeDescriptor | undefined> {
  // primitives & class constructors resolve to themselves
  if (isPrimitive(descriptor) || typeof descriptor === "function") {
    return descriptor as NonResolvableTypeDescriptor;
  }

  if (descriptor.kind === "resolvable") {
    return (await descriptor.resolver(value)) ?? Unknown;
  }

  // array / unknown are already literal
  return descriptor;
}

/* ========
 *  Guards
 * ======== */

export function isPrimitive(
  type: TypeDescriptor
): type is PrimitiveConstructor {
  return (
    type === String || type === Number || type === Boolean || type === Date
  );
}
