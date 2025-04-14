import Player from "../Player/Player";

export class ItemUsageContext {
  player: Player;
}

export class ItemUsageResult {
  message: string;
  success: boolean;
  data: any;

  constructor(message: string, success: boolean) {
    this.message = message;
    this.success = success;
  }
}
