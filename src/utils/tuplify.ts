export default function tuplify<T extends unknown[]>(opts: [...T]): T {
  return opts;
}
