import { SerializedData } from "#core/serializable.js";

/* ========================
 *  Primitive constructors
 * ======================== */

export type PrimitiveConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor;

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
  | UnknownTypeDescriptor
  | ResolvableType;

export type NonResolvableTypeDescriptor =
  | PrimitiveConstructor
  | ClassConstructor
  | ArrayTypeDescriptor
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
