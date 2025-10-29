export default async function asyncEvery<T>(
  arr: T[],
  predicate: (item: T, index: number, array: T[]) => Promise<boolean>
): Promise<boolean> {
  for (let i = 0; i < arr.length; i++) {
    if (!(await predicate(arr[i]!, i, arr))) return false;
  }
  return true;
}
