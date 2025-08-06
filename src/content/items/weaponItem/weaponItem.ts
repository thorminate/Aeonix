import Item from "../../../models/item/item.js";
import ItemEventResult from "../../../models/item/utils/itemEventResult.js";
import ItemUsageResult from "../../../models/item/utils/itemUsageResult.js";
import Player from "../../../models/player/player.js";

export interface IWeaponData {
  damage: number;
  range: number;
  wear: number;
}

export default class WeaponItem extends Item {
  type: string = "weaponItem";
  name: string = "Weapon";
  description: string = "A weapon.";
  weight: number = 10;
  value: number = 0;
  data: IWeaponData = this.createData();
  interactionType: string = "Swing";
  interactable: boolean = true;
  oneTimeInteraction: boolean = false;
  canDrop: boolean = true;

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

  async use(player: Player): Promise<ItemUsageResult> {
    player.stats.giveXpFromRange(5, 10);

    this.data.wear++;
    return new ItemUsageResult("Sword Swung!", true);
  }
}
