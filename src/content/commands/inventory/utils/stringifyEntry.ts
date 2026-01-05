import Item from "#item/item.js";

export default function stringifyEntry(entry: Item) {
  return `${entry.name} ${entry.description}`;
}
