import Player from "../player.js";

export default class StatusEffect {
  id: string = "";
  name: string = "";
  description: string = "";
  duration: number = 0; // Duration in turns
  isPermanent: boolean = false;

  onEffectStart(player: Player): Player {
    return player;
  }

  onEffectTick(player: Player): Player {
    return player;
  }

  onEffectEnd(player: Player): Player {
    return player;
  }
}
