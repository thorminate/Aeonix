import Item from "../../../../models/item/item.js";

export default function findEntryFromIdStrict(
  items: Item[],
  id: string
): [Item, number] {
  const resultIndex = items.findIndex((item) => item.id === id);

  const result = items?.[resultIndex];

  if (!result) {
    throw new Error("Could not find letter from id", {
      cause: {
        id,
        items,
      },
    });
  }

  return [result, resultIndex];
}
