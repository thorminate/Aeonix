import Item from "../item.js";
import ItemEventResult from "../utils/itemEventResult.js";
import ItemUsageContext from "../utils/itemUsageContext.js";
import ItemUsageResult from "../utils/itemUsageResult.js";

export interface IWeaponData {
  damage: number;
  range: number;
  wear: number;
}

export default class WeaponItem extends Item {
  name: string = "Weapon";
  type: string = "WeaponItem";
  description: string = "A weapon.";
  weight: number = 10;
  value: number = 0;
  data: IWeaponData = this.createData();
  useType: string = "Swing";

  createData(
    damage: number = 10,
    range: number = 5,
    wear: number = 0
  ): IWeaponData {
    return {
      damage,
      range,
      wear,
    };
  }

  override onDrop(): ItemEventResult {
    this.data.wear++;
    return new ItemEventResult("Your weapon took damage!", true);
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    const { player } = context;

    player.giveXpFromRange(5, 10);
    this.data.wear++;
    return new ItemUsageResult("Sword Swung!", true);
  }
}
