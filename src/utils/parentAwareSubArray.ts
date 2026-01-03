export default class ParentAwareSubArray<T> {
  private parent: T[];
  private predicate: (o: T) => boolean;
  private refs: { ref: T; parentIndex: number }[];

  constructor(parent: T[], predicate: (o: T) => boolean) {
    this.parent = parent;
    this.predicate = predicate;
    this.refs = [];

    // Initialize with references
    parent.forEach((item, idx) => {
      if (predicate(item)) {
        this.refs.push({ ref: item, parentIndex: idx });
      }
    });
  }

  get length() {
    return this.refs.length;
  }

  at(i: number): T | undefined {
    return this.refs[i]?.ref;
  }

  splice(start: number, deleteCount?: number) {
    const removed = this.refs.splice(start, deleteCount ?? this.refs.length);

    // Remove items from parent by index (highest first to not mess up order)
    removed
      .map((r) => r.parentIndex)
      .sort((a, b) => b - a)
      .forEach((idx) => this.parent.splice(idx, 1));

    // Rebuild refs since parent indexes shifted
    this.refs = [];
    this.parent.forEach((item, idx) => {
      if (this.predicate(item)) {
        this.refs.push({ ref: item, parentIndex: idx });
      }
    });

    return removed.map((r) => r.ref);
  }
}
