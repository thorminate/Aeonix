import Player from "../../player/player.js";

export default class EnvironmentEventContext<ExtraContext = undefined> {
  eventType: string = "base";
  player: Player;
  extraContext: ExtraContext;

  constructor(eventType: string, player: Player, extraContext: ExtraContext) {
    this.eventType = eventType;
    this.player = player;
    this.extraContext = extraContext;
  }
}
