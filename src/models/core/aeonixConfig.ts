import merge from "#utils/merge.js";

interface Setters {
  tickRate: number;
  maxNotifications: number;
}

export default class AeonixConfig {
  tickRate: number = 10 * 1000; // 10 seconds
  maxNotifications: number = 50;

  set<T extends keyof Setters>(key: T, arg: Setters[T]): void {
    this[key] = arg;
  }

  constructor(o: Partial<AeonixConfig>) {
    return merge(this, o);
  }
}
