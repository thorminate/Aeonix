type ConcreteConstructor<T, Args extends unknown[] = unknown[]> = new (
  ...args: Args
) => T;

export default ConcreteConstructor;
