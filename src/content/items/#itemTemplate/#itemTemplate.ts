import Item from "../../../models/item/item.js";
import ItemEventResult from "../../../models/item/utils/itemEventResult.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";

interface ITemplateData {
  num: number;
}

export default class ItemTemplate extends Item {
  name: string = "template";
  type: string = "#itemTemplate"; // should always be the exact same as the filename
  description: string = "A placeholder item.";
  weight: number = 10;
  value: number = 0;
  data: ITemplateData = this.createData();
  useType: string = "Use";

  createData(num: number = 1): ITemplateData {
    return {
      num,
    };
  }

  override onDrop() {
    return new ItemEventResult("Something happened!", true);
  }

  async use() {
    return new ItemUsageResult("Wow!", true);
  }
}
