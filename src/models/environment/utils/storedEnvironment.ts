import Item from "../../item/item.js";

export default interface StoredEnvironment {
  _id: string;
  type: string;
  players: string[];
  items: Item[];
}
