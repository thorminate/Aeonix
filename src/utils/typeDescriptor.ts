import { SerializedData } from "../models/core/serializable.js";

export type PrimitiveConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor;

export type TypeDescriptorResolver = (
  value: SerializedData
) => TypeDescriptor | Promise<TypeDescriptor | undefined> | undefined;

export type FunctionOrLiteralTypeDescriptor =
  | TypeDescriptor
  | TypeDescriptorResolver;

export interface ArrayTypeDescriptor {
  kind: "array";
  of: FunctionOrLiteralTypeDescriptor;
}

export interface UnknownTypeDescriptor {
  kind: "unknown";
}

export type ClassConstructor = new (...args: unknown[]) => unknown;

type TypeDescriptor =
  | PrimitiveConstructor
  | ClassConstructor
  | ArrayTypeDescriptor
  | UnknownTypeDescriptor;

export default TypeDescriptor;

/**
 * Helper to normalize a FunctionOrLiteralTypeDescriptor into a concrete TypeDescriptor.
 * - If it's already a TypeDescriptor, return it.
 * - If it's a resolver, use its return type (unwrapping Promise and excluding undefined).
 */
type ResolveFunctionOrLiteral<T> = T extends TypeDescriptor
  ? T
  : T extends TypeDescriptorResolver
  ? ReturnType<T> extends Promise<infer P>
    ? Exclude<P, undefined>
    : Exclude<ReturnType<T>, undefined>
  : never;

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
    ? Array<
        TypeDescriptorValue<ResolveFunctionOrLiteral<T["of"]> & TypeDescriptor>
      >
    : T extends UnknownTypeDescriptor
    ? unknown
    : never;
