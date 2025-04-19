import Player from "../Player/Player.js";

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
