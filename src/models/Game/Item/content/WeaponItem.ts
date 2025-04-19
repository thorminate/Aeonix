import Item from "../item.js";
import { ItemUsageContext, ItemUsageResult } from "../itemUtils.js";

export interface IWeaponData {
  damage: number;
  range: number;
  wear: number;
}

export default class WeaponItem extends Item {
  override name: string = "Weapon";
  override type: string = "WeaponItem";
  override description: string = "A weapon.";
  override weight: number = 10;
  override value: number = 0;
  override data: IWeaponData = this.createData();
  override useType: string = "Swing";

  override createData(
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

  override async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    const { player } = context;

    player.giveXpFromRange(5, 10);
    this.data.wear++;
    return new ItemUsageResult("Sword Swung!", true);
  }
}
