export type PrimitiveConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor;

export interface ArrayTypeDescriptor {
  kind: "array";
  of: TypeDescriptor;
}

export type ClassConstructor = new (...args: unknown[]) => unknown;

type TypeDescriptor =
  | PrimitiveConstructor
  | ClassConstructor
  | ArrayTypeDescriptor;

export default TypeDescriptor;
