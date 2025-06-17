import Player from "../player/player.js";

export default class Quest {
  public id: string = "";
  public name: string = "";
  public description: string = "";
  public xpReward: number = 0;
  public itemReward: string = "";
  public completed: boolean = false;

  constructor(
    id: string,
    name: string,
    description: string,
    xpReward?: number,
    itemReward?: string
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.xpReward = xpReward ?? 0;
    this.itemReward = itemReward ?? "";
  }

  async fulfill(player: Player) {
    this.completed = true;
    player.giveXp(this.xpReward);
    player.inventory.add(this.itemReward);
  }
}
