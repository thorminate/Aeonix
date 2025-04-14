import Item from "../item.js";
import { ItemUsageContext, ItemUsageResult } from "../itemUtils.js";

export interface IWeaponData {
  damage: number;
  range: number;
}

export default class WeaponItem extends Item {
  name: string = "Weapon";
  description: string = "A weapon.";
  weight: number = 10;
  value: number = 0;
  data: IWeaponData = this.createData();
  useType: string = "Swing";

  createData(damage: number = 10, range: number = 5): IWeaponData {
    return {
      damage,
      range,
    };
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    return new ItemUsageResult("", true);
  }
}
