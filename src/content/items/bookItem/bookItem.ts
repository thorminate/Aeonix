import Item from "../../../models/item/item.js";
import ItemEventResult from "../../../models/item/utils/itemEventResult.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";

interface IBookData {
  num: number;
}

export default class BookItem extends Item<IBookData> {
  name: string = "Book";
  type: string = "bookItem"; // should always be the exact same as the filename
  description: string = "A book.";
  weight: number = 10;
  value: number = 0;
  interactionType: string = "Read";
  interactable: boolean = true;
  oneTimeInteraction: boolean = false;
  canDrop: boolean = false;

  override async onDrop() {
    return new ItemEventResult("Something happened!", true);
  }

  override async onInteract() {
    this.data.num++;
    return new ItemUsageResult("Wow!", true);
  }
}
