import Item, { ItemUsageContext } from "../../item/item.js";

interface IWeaponData {
  damage: number;
  range: number;
}

export default class WeaponItem extends Item {
  name: string;
  id: string;
  description: string;
  weight: number;
  value: number;
  data: IWeaponData;

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

  async use(context: ItemUsageContext): Promise<void> {}
}
