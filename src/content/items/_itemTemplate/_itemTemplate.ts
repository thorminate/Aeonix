import Item from "../../../models/item/item.js";
import ItemEventResult from "../../../models/item/utils/itemEventResult.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";

interface ITemplateData {
  num: number;
}

export default class ItemTemplate extends Item<ITemplateData> {
  name: string = "template";
  type: string = "#itemTemplate"; // should always be the exact same as the filename
  description: string = "A placeholder item.";
  weight: number = 10;
  value: number = 0;
  interactionType: string = "yes";
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
