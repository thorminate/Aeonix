export abstract class PlayerSubclassBase {
  abstract getClassMap(): Record<string, new (...args: unknown[]) => unknown>;
}
