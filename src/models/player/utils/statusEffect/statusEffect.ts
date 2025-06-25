import Player from "../../player.js";

export default class StatusEffect {
  id: string = "";
  name: string = "";
  description: string = "";
  duration: number = 0; // Duration in turns
  isPermanent: boolean = false;

  onEffectStart?(player: Player): Player;
  onEffectTick?(player: Player): Player;
  onEffectEnd?(player: Player): Player;
}
