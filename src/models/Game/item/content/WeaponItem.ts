import Item, { ItemUsageContext, ItemUsageResult } from "../item.js";

export interface IWeaponData {
  damage: number;
  range: number;
}

export default class WeaponItem extends Item {
  name: string = "Weapon";
  id: string = "WeaponItem";
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

  constructor() {
    super();
    this.name = "Weapon";
    this.id = this.constructor.name;
    this.description = "A weapon.";
    this.weight = 10;
    this.value = 0;
    this.data = this.createData();
  }

  async use(context: ItemUsageContext): Promise<ItemUsageResult> {
    return new ItemUsageResult("", true);
  }
}
