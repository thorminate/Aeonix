import Player from "../Player/Player.js";
import Item from "./item.js";

export class ItemUsageContext {
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }
}

export class ItemUsageResult {
  message: string;
  success: boolean;
  oneTime: boolean = false;
  data: any;

  constructor(message: string, success: boolean, depleted?: boolean) {
    this.message = message;
    this.success = success;

    if (depleted) this.oneTime = true;
  }
}

export class ItemEventContext {
  player: Player;
  item: Item;

  constructor(player: Player, item: Item) {
    this.player = player;
    this.item = item;
  }
}

export class ItemEventResult {
  message: string;
  success: boolean;

  constructor(message: string, success: boolean) {
    this.message = message;
    this.success = success;
  }
}
